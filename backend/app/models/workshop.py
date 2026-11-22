from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Enum, JSON
from app.db.base import Base


class Workshop(Base):
    __tablename__ = "workshops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    type = Column(
        Enum("FabLab", "ToolLibrary", "VillageWorkshop", "PolytechnicMakerSpace", name="workshop_type_enum"),
        nullable=False,
        index=True,
    )
    address = Column(String(255), nullable=False)
    city_village = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(100), nullable=True)
    available_tools = Column(JSON, nullable=True)  # List of tools/machines
    is_deleted = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
