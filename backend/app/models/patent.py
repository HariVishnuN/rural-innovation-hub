from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class PatentApplication(Base):
    __tablename__ = "patent_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    package_type = Column(String(50), nullable=False)  # 'PROVISIONAL', 'UTILITY', 'DESIGN'
    package_name = Column(String(100), nullable=False) # e.g. 'Provisional Patent Application'
    fee_inr = Column(Numeric(10, 2), nullable=False, default=Decimal("4999.00"))
    status = Column(String(50), nullable=False, default="PENDING")  # 'PENDING', 'UNDER_REVIEW', 'FILED', 'GRANTED'
    application_number = Column(String(100), nullable=True)  # Official IP India filing number if filed
    sha256_provenance_hash = Column(String(64), nullable=False)
    applicant_name = Column(String(150), nullable=False)
    applicant_state = Column(String(100), nullable=False)
    applicant_phone = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User")
    invention = relationship("Invention")
