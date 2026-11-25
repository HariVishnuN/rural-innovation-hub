from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


class PatentPackageInfo(BaseModel):
    package_type: str
    title: str
    tagline: str
    fee_inr: float
    turnaround_days: str
    features: List[str]
    best_for: str


class PatentApplyRequest(BaseModel):
    invention_id: int
    package_type: str  # 'PROVISIONAL', 'UTILITY', 'DESIGN'
    applicant_name: str
    applicant_state: str
    applicant_phone: Optional[str] = None
    notes: Optional[str] = None


class PatentApplicationResponse(BaseModel):
    id: int
    user_id: int
    invention_id: int
    invention_title: str
    invention_category: Optional[str] = None
    invention_image_url: Optional[str] = None
    package_type: str
    package_name: str
    fee_inr: float
    status: str
    application_number: Optional[str] = None
    sha256_provenance_hash: str
    applicant_name: str
    applicant_state: str
    applicant_phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
