from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, JSON
from app.db.base import Base


class EventOutbox(Base):
    __tablename__ = "event_outbox"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(
        Enum("PENDING", "PROCESSED", "FAILED", name="outbox_status_enum"),
        nullable=False,
        default="PENDING",
        index=True,
    )
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    processed_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
