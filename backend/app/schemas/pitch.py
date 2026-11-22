from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class PitchCreate(BaseModel):
    invention_id: int
    investor_id: int
    pitch_title: str = Field(..., min_length=3, max_length=255)
    pitch_notes: str = Field(..., min_length=10)
    funding_needed: Decimal = Field(..., ge=0)


class PitchStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(SUBMITTED|UNDER_REVIEW|ACCEPTED|DECLINED)$")
    feedback_notes: Optional[str] = None


class PitchResponse(BaseModel):
    id: int
    inventor_id: int
    inventor_name: Optional[str] = None
    inventor_location: Optional[str] = None
    investor_id: int
    investor_name: Optional[str] = None
    organization_name: Optional[str] = None
    invention_id: int
    invention_title: Optional[str] = None
    invention_category: Optional[str] = None
    pitch_title: str
    pitch_notes: str
    funding_needed: Decimal
    status: str
    feedback_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
