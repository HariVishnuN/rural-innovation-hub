from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Replication(Base):
    __tablename__ = "replications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    builder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    location = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    photo_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    build_cost = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    invention = relationship("Invention", back_populates="replications")
    builder = relationship("User", back_populates="replications")
