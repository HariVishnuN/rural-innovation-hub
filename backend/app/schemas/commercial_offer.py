from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class CommercialOfferCreate(BaseModel):
    offer_type: str = Field("BUY", description="BUY, RENT, PAID_REUSE, LICENSE")
    organization_name: str = Field(..., min_length=2, max_length=200)
    proposed_amount: Optional[Decimal] = None
    amount_inr: Optional[Decimal] = None
    rental_duration_months: Optional[int] = None
    official_name: Optional[str] = None
    official_email: Optional[str] = None
    official_phone: Optional[str] = None
    message: str = Field(..., min_length=5)


class CommercialOfferStatusUpdate(BaseModel):
    status: str = Field(..., description="ACCEPTED, REJECTED, NEGOTIATING, PAID")


class CommercialOfferResponse(BaseModel):
    id: int
    invention_id: int
    invention_title: Optional[str] = None
    invention_image_url: Optional[str] = None
    inventor_id: int
    inventor_name: Optional[str] = None
    official_id: Optional[int] = None
    buyer_id: Optional[int] = None
    official_name: str
    buyer_name: Optional[str] = None
    organization_name: str
    official_email: str
    buyer_email: Optional[str] = None
    official_phone: Optional[str] = None
    buyer_phone: Optional[str] = None
    offer_type: str
    proposed_amount: Decimal
    amount_inr: Optional[Decimal] = None
    rental_duration_months: Optional[int] = None
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
