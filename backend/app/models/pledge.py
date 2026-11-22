from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class FundingPledge(Base):
    __tablename__ = "funding_pledges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    donor_name = Column(String(150), nullable=True)
    donor_email = Column(String(255), nullable=True)
    pledge_type = Column(
        Enum("MONETARY", "SPARE_PARTS", "EQUIPMENT_TIME", "MENTORSHIP_HOURS", name="pledge_type_enum"),
        nullable=False,
        default="MONETARY",
    )
    amount = Column(Numeric(12, 2), default=0.00)
    spare_part_details = Column(Text, nullable=True)
    status = Column(
        Enum("PLEDGED", "ACCEPTED", "FULFILLED", "CANCELLED", name="pledge_status_enum"),
        nullable=False,
        default="PLEDGED",
        index=True,
    )
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    invention = relationship("Invention", back_populates="pledges")
    donor = relationship("User", back_populates="pledges")
