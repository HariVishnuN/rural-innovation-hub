from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from app.models.message import Message
from app.models.user import User
from app.schemas.engagement import MessageCreate, MessageResponse, ConversationSummary


class MessagingService:
    @staticmethod
    def send_message(db: Session, sender_id: int, req: MessageCreate) -> MessageResponse:
        msg = Message(
            sender_id=sender_id,
            receiver_id=req.receiver_id,
            invention_id=req.invention_id,
            message_text=req.message_text.strip(),
            is_read=False,
            created_at=datetime.utcnow(),
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)

        sender = db.query(User).filter(User.id == sender_id).first()
        receiver = db.query(User).filter(User.id == req.receiver_id).first()

        return MessageResponse(
            id=msg.id,
            sender_id=msg.sender_id,
            receiver_id=msg.receiver_id,
            sender_name=sender.full_name if sender else "User",
            receiver_name=receiver.full_name if receiver else "User",
            invention_id=msg.invention_id,
            message_text=msg.message_text,
            is_read=msg.is_read,
            created_at=msg.created_at,
        )

    @staticmethod
    def get_conversation_messages(db: Session, user1_id: int, user2_id: int) -> List[MessageResponse]:
        messages = (
            db.query(Message)
            .filter(
                or_(
                    and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
                    and_(Message.sender_id == user2_id, Message.receiver_id == user1_id),
                )
            )
            .order_by(Message.created_at.asc())
            .all()
        )

        # Mark received messages as read
        for m in messages:
            if m.receiver_id == user1_id and not m.is_read:
                m.is_read = True
        db.commit()

        user1 = db.query(User).filter(User.id == user1_id).first()
        user2 = db.query(User).filter(User.id == user2_id).first()

        results = []
        for m in messages:
            sender_name = user1.full_name if m.sender_id == user1_id else user2.full_name
            receiver_name = user2.full_name if m.sender_id == user1_id else user1.full_name
            results.append(
                MessageResponse(
                    id=m.id,
                    sender_id=m.sender_id,
                    receiver_id=m.receiver_id,
                    sender_name=sender_name,
                    receiver_name=receiver_name,
                    invention_id=m.invention_id,
                    message_text=m.message_text,
                    is_read=m.is_read,
                    created_at=m.created_at,
                )
            )
        return results

    @staticmethod
    def get_user_conversations(db: Session, user_id: int) -> List[ConversationSummary]:
        # Find all distinct partners
        sent_partners = db.query(Message.receiver_id).filter(Message.sender_id == user_id).distinct().all()
        recv_partners = db.query(Message.sender_id).filter(Message.receiver_id == user_id).distinct().all()

        partner_ids = set([p[0] for p in sent_partners] + [p[0] for p in recv_partners])

        summaries = []
        for pid in partner_ids:
            partner = db.query(User).filter(User.id == pid, User.is_deleted == False).first()
            if not partner:
                continue

            last_msg = (
                db.query(Message)
                .filter(
                    or_(
                        and_(Message.sender_id == user_id, Message.receiver_id == pid),
                        and_(Message.sender_id == pid, Message.receiver_id == user_id),
                    )
                )
                .order_by(Message.created_at.desc())
                .first()
            )

            unread_count = (
                db.query(Message)
                .filter(Message.sender_id == pid, Message.receiver_id == user_id, Message.is_read == False)
                .count()
            )

            if last_msg:
                summaries.append(
                    ConversationSummary(
                        partner_id=partner.id,
                        partner_name=partner.full_name,
                        partner_role=partner.role,
                        last_message=last_msg.message_text,
                        last_message_at=last_msg.created_at,
                        unread_count=unread_count,
                    )
                )

        summaries.sort(key=lambda s: s.last_message_at, reverse=True)
        return summaries
