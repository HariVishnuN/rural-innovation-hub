from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.engagement import MessageCreate, MessageResponse, ConversationSummary
from app.services.messaging_service import MessagingService
from app.core.permissions import get_current_user

router = APIRouter(prefix="/conversations", tags=["Messaging & Conversations"])


@router.get("", response_model=List[ConversationSummary])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all distinct conversation threads for the authenticated user."""
    return MessagingService.get_user_conversations(db, current_user.id)


@router.get("/{partner_id}/messages", response_model=List[MessageResponse])
def get_messages(
    partner_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns conversation message history between current user and partner."""
    return MessagingService.get_conversation_messages(db, current_user.id, partner_id)


@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    req: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sends and persists a new private message."""
    return MessagingService.send_message(db, current_user.id, req)
