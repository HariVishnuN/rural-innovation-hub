from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.invention import InventionResponse


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_\.]+$")
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=100)
    pin: str = Field(..., pattern=r"^\d{4}$", description="4-digit numeric PIN for fast login")
    role: str = Field("INNOVATOR", description="Allowed: INNOVATOR, INVESTOR, MENTOR. Admin cannot be self-selected.")
    phone: Optional[str] = None
    phone_number: Optional[str] = None
    village_city: Optional[str] = None
    village_or_city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    preferred_language: Optional[str] = "English"
    bio: Optional[str] = None
    skills_expertise: Optional[str] = None
    skills_or_expertise: Optional[str] = None
    organization_college: Optional[str] = None
    consent_given: Optional[bool] = None
    consent_accepted: Optional[bool] = None


class SendOTPRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    role: Optional[str] = "INNOVATOR"


class VerifyOTPRegister(UserRegister):
    otp_code: str = Field(..., min_length=4, max_length=8)


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str


class UserPinLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, description="Username or registered email")
    pin: str = Field(..., pattern=r"^\d{4}$", description="4-digit numeric PIN")


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    pin: Optional[str] = None
    password: Optional[str] = None
    new_password: Optional[str] = None
    phone: Optional[str] = None
    phone_number: Optional[str] = None
    village_city: Optional[str] = None
    village_or_city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    preferred_language: Optional[str] = None
    bio: Optional[str] = None
    skills_expertise: Optional[str] = None
    skills_or_expertise: Optional[str] = None
    organization_college: Optional[str] = None
    profile_photo_url: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    username: Optional[str] = None
    email: str
    role: str
    has_pin: bool = False
    phone: Optional[str] = None
    village_city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    preferred_language: Optional[str] = None
    bio: Optional[str] = None
    skills_expertise: Optional[str] = None
    organization_college: Optional[str] = None
    profile_photo_url: Optional[str] = None
    verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPublicResponse(BaseModel):
    id: int
    full_name: str
    username: Optional[str] = None
    role: str
    state: Optional[str] = None
    village_city: Optional[str] = None
    bio: Optional[str] = None
    skills_expertise: Optional[str] = None
    organization_college: Optional[str] = None
    profile_photo_url: Optional[str] = None
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DemoAccount(BaseModel):
    role: str
    name: str
    username: str
    pin: str = "1234"
    email: str
    password: str
    description: str
    profile_photo_url: Optional[str] = None


class BuyerDetail(BaseModel):
    id: int
    invention_id: int
    invention_title: str
    invention_image_url: Optional[str] = None
    buyer_id: Optional[int] = None
    buyer_name: str
    buyer_email: str
    buyer_phone: Optional[str] = None
    organization_name: str
    offer_type: str
    amount_inr: Decimal
    message: str
    status: str
    created_at: datetime


class InnovatorDashboardSummary(BaseModel):
    total_inventions: int
    total_likes: int
    total_comments: int
    total_paid_reuses: int
    total_earnings_inr: Decimal


class InnovatorDashboardResponse(BaseModel):
    user: UserResponse
    inventions: List[InventionResponse]
    buyers: List[BuyerDetail]
    summary: InnovatorDashboardSummary
