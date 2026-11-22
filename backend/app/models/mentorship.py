from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False)
    innovator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Integer, default=80)
    notes = Column(Text, nullable=True)
    status = Column(
        Enum("PENDING", "ACCEPTED", "COMPLETED", "DECLINED", name="mentorship_status_enum"),
        nullable=False,
        default="PENDING",
        index=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    invention = relationship("Invention", back_populates="mentorship_requests")
    innovator = relationship("User", back_populates="mentorships_as_innovator", foreign_keys=[innovator_id])
    mentor = relationship("User", back_populates="mentorships_as_mentor", foreign_keys=[mentor_id])
