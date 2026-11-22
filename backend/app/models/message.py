from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.base import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="SET NULL"), nullable=True)
    message_text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        Index("idx_messages_conversation", "sender_id", "receiver_id"),
    )

    # Relationships
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="received_messages", foreign_keys=[receiver_id])
    invention = relationship("Invention")
