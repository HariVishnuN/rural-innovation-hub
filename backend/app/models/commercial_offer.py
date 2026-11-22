from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class CommercialOffer(Base):
    __tablename__ = "commercial_offers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    inventor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    official_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    official_name = Column(String(150), nullable=False)
    organization_name = Column(String(200), nullable=False)
    official_email = Column(String(255), nullable=False)
    official_phone = Column(String(30), nullable=True)
    offer_type = Column(String(50), nullable=False, default="BUY", index=True)  # BUY, RENT, PAID_REUSE, LICENSE
    proposed_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    amount_inr = Column(Numeric(12, 2), nullable=True, default=0.00)
    rental_duration_months = Column(Integer, nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="PENDING", index=True)  # PENDING, ACCEPTED, PAID, REJECTED, NEGOTIATING
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    invention = relationship("Invention", foreign_keys=[invention_id], back_populates="commercial_offers")
    inventor = relationship("User", foreign_keys=[inventor_id])
    official = relationship("User", foreign_keys=[official_id])
