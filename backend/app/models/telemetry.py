from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    power_watts = Column(Numeric(8, 2), nullable=False, default=0.00)
    runtime_hours = Column(Numeric(8, 2), nullable=False, default=0.00)
    efficiency_percentage = Column(Numeric(5, 2), nullable=False, default=0.00)
    ambient_temp_c = Column(Numeric(5, 2), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    invention = relationship("Invention", back_populates="telemetry_logs")
