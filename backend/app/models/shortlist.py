from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.db.base import Base


class OfficialShortlist(Base):
    __tablename__ = "official_shortlists"

    id = Column(Integer, primary_key=True, index=True)
    official_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    innovator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
