from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    action = Column(String(50), nullable=False, index=True)
    prior_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    admin = relationship("User")
