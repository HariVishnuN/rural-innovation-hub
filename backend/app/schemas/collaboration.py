from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Any
from pydantic import BaseModel, Field


# Workshops & Makerspaces
class WorkshopCreate(BaseModel):
    name: str
    type: str = Field(..., description="FabLab, ToolLibrary, VillageWorkshop, PolytechnicMakerSpace")
    address: str
    city_village: str
    state: str
    pincode: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    available_tools: Optional[List[str]] = None


class WorkshopResponse(BaseModel):
    id: int
    name: str
    type: str
    address: str
    city_village: str
    state: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    available_tools: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Mentorship
class MentorshipRequestCreate(BaseModel):
    invention_id: int
    mentor_id: int
    notes: Optional[str] = None


class MentorshipRequestUpdate(BaseModel):
    status: str = Field(..., description="ACCEPTED, DECLINED, COMPLETED")


class MentorshipRequestResponse(BaseModel):
    id: int
    invention_id: int
    invention_title: Optional[str] = None
    innovator_id: int
    innovator_name: Optional[str] = None
    mentor_id: int
    mentor_name: Optional[str] = None
    match_score: int
    notes: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MentorMatchResponse(BaseModel):
    mentor_id: int
    full_name: str
    skills_expertise: Optional[str] = None
    organization: Optional[str] = None
    match_score: int
    matching_reasons: List[str]


# Telemetry
class TelemetryLogCreate(BaseModel):
    power_watts: Decimal
    runtime_hours: Decimal
    efficiency_percentage: Decimal
    ambient_temp_c: Optional[Decimal] = None


class TelemetryLogResponse(BaseModel):
    id: int
    invention_id: int
    power_watts: float
    runtime_hours: float
    efficiency_percentage: float
    ambient_temp_c: Optional[float] = None
    recorded_at: datetime

    class Config:
        from_attributes = True


# Licensing Contract
class LicensingContractCreate(BaseModel):
    licensee_name: str
    licensee_entity_type: str
    royalty_percentage: Decimal = Decimal("5.00")
    territory: Optional[str] = "India"
    contract_terms: Optional[str] = None


class LicensingContractResponse(BaseModel):
    id: int
    invention_id: int
    invention_title: Optional[str] = None
    inventor_id: int
    licensee_name: str
    licensee_entity_type: str
    royalty_percentage: Decimal
    territory: str
    contract_terms: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
