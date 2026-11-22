from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Bounty(Base):
    __tablename__ = "bounties"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    poster_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    region = Column(String(100), nullable=False, index=True)
    reward_amount = Column(Numeric(12, 2), default=0.00)
    status = Column(
        Enum("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", name="bounty_status_enum"),
        nullable=False,
        default="OPEN",
        index=True,
    )
    deadline = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    poster = relationship("User", back_populates="bounties_posted")
    submissions = relationship("BountySubmission", back_populates="bounty", cascade="all, delete-orphan")


class BountySubmission(Base):
    __tablename__ = "bounty_submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bounty_id = Column(Integer, ForeignKey("bounties.id", ondelete="CASCADE"), nullable=False, index=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    innovator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    note = Column(Text, nullable=True)
    status = Column(
        Enum("SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED", name="bounty_submission_status_enum"),
        nullable=False,
        default="SUBMITTED",
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bounty = relationship("Bounty", back_populates="submissions")
    invention = relationship("Invention", back_populates="bounty_submissions")
    innovator = relationship("User", back_populates="bounty_submissions")
