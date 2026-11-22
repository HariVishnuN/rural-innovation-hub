from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Numeric, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class Pitch(Base):
    __tablename__ = "pitches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inventor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    investor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    pitch_title = Column(String(255), nullable=False)
    pitch_notes = Column(Text, nullable=False)
    funding_needed = Column(Numeric(12, 2), nullable=False, default=0.00)
    status = Column(
        Enum("SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "DECLINED", name="pitch_status_enum"),
        nullable=False,
        default="SUBMITTED",
        index=True,
    )
    feedback_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    inventor = relationship("User", foreign_keys=[inventor_id])
    investor = relationship("User", foreign_keys=[investor_id])
    invention = relationship("Invention", foreign_keys=[invention_id], back_populates="pitches")
