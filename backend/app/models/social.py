from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class InventionLike(Base):
    __tablename__ = "invention_likes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        UniqueConstraint("invention_id", "user_id", name="uq_invention_user_like"),
    )

    # Relationships
    invention = relationship("Invention", back_populates="likes")
    user = relationship("User", back_populates="likes")


class InventionComment(Base):
    __tablename__ = "invention_comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    invention = relationship("Invention", back_populates="comments")
    user = relationship("User", back_populates="comments")
