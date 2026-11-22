from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class ReviewRating(Base):
    __tablename__ = "reviews_ratings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False, index=True)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("invention_id", "user_id", name="uq_user_invention_review"),
    )

    # Relationships
    invention = relationship("Invention", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
