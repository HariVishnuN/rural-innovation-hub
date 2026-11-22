import json
import logging
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import decode_access_token
from app.models.message import Message
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSockets"])


class ConnectionManager:
    def __init__(self):
        # Map conversation_key -> List[WebSocket]
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    def get_room_key(self, user1: int, user2: int) -> str:
        u_min = min(user1, user2)
        u_max = max(user1, user2)
        return f"{u_min}_{u_max}"

    async def connect(self, room_key: str, websocket: WebSocket):
        await websocket.accept()
        if room_key not in self.active_rooms:
            self.active_rooms[room_key] = []
        self.active_rooms[room_key].append(websocket)
        logger.info(f"WebSocket joined room {room_key}. Total in room: {len(self.active_rooms[room_key])}")

    def disconnect(self, room_key: str, websocket: WebSocket):
        if room_key in self.active_rooms and websocket in self.active_rooms[room_key]:
            self.active_rooms[room_key].remove(websocket)
            if not self.active_rooms[room_key]:
                del self.active_rooms[room_key]
        logger.info(f"WebSocket left room {room_key}")

    async def broadcast_to_room(self, room_key: str, message: dict):
        if room_key in self.active_rooms:
            dead_sockets = []
            for connection in self.active_rooms[room_key]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_sockets.append(connection)
            for dead in dead_sockets:
                self.disconnect(room_key, dead)


manager = ConnectionManager()


@router.websocket("/chat/{partner_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    partner_id: int,
    token: str = Query(..., description="JWT Bearer token"),
):
    """
    Authenticated real-time chat WebSocket.
    Messages are persisted to MySQL BEFORE broadcasting to recipients.
    """
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    current_user_id = int(payload["sub"])
    room_key = manager.get_room_key(current_user_id, partner_id)
    await manager.connect(room_key, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                text_content = parsed.get("message", "").strip()
                invention_id = parsed.get("invention_id")

                if not text_content:
                    continue

                # 1. Transactionally persist to MySQL
                db: Session = SessionLocal()
                try:
                    sender = db.query(User).filter(User.id == current_user_id).first()
                    receiver = db.query(User).filter(User.id == partner_id).first()

                    msg = Message(
                        sender_id=current_user_id,
                        receiver_id=partner_id,
                        invention_id=invention_id,
                        message_text=text_content,
                        is_read=False,
                    )
                    db.add(msg)
                    db.commit()
                    db.refresh(msg)

                    broadcast_data = {
                        "id": msg.id,
                        "sender_id": msg.sender_id,
                        "receiver_id": msg.receiver_id,
                        "sender_name": sender.full_name if sender else "User",
                        "receiver_name": receiver.full_name if receiver else "User",
                        "invention_id": msg.invention_id,
                        "message_text": msg.message_text,
                        "is_read": msg.is_read,
                        "created_at": msg.created_at.isoformat(),
                    }
                finally:
                    db.close()

                # 2. Broadcast to all active websockets in this conversation
                await manager.broadcast_to_room(room_key, broadcast_data)

            except json.JSONDecodeError:
                continue

    except WebSocketDisconnect:
        manager.disconnect(room_key, websocket)
