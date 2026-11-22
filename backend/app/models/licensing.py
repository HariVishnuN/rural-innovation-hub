from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class LicensingContract(Base):
    __tablename__ = "licensing_contracts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invention_id = Column(Integer, ForeignKey("inventions.id", ondelete="CASCADE"), nullable=False, index=True)
    inventor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    licensee_name = Column(String(150), nullable=False)
    licensee_entity_type = Column(String(100), nullable=False)
    royalty_percentage = Column(Numeric(5, 2), nullable=False, default=5.00)
    territory = Column(String(150), default="India")
    contract_terms = Column(Text, nullable=False)
    status = Column(
        Enum("DRAFT", "OFFERED", "EXECUTED", "TERMINATED", name="licensing_status_enum"),
        nullable=False,
        default="DRAFT",
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    invention = relationship("Invention", back_populates="licensing_contracts")
    inventor = relationship("User")
