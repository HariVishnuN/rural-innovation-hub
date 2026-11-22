from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class InventionMaterial(Base):
    __tablename__ = "invention_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    item_name = Column(String(150), nullable=False)
    quantity = Column(String(50), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False, default=0.00)
    local_source = Column(String(150), nullable=True)
    optimized_alternative = Column(String(150), nullable=True)
    estimated_savings = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    invention = relationship("Invention", back_populates="materials")
