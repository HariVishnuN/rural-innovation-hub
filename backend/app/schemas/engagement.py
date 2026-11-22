from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


# Messaging
class MessageCreate(BaseModel):
    receiver_id: int
    invention_id: Optional[int] = None
    message_text: str = Field(..., min_length=1)


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    invention_id: Optional[int] = None
    message_text: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    partner_id: int
    partner_name: str
    partner_role: str
    last_message: str
    last_message_at: datetime
    unread_count: int


# Funding Pledges
class PledgeCreate(BaseModel):
    pledge_type: str = Field("MONETARY", description="MONETARY, SPARE_PARTS, EQUIPMENT_TIME, MENTORSHIP_HOURS")
    amount: Optional[Decimal] = Decimal("0.00")
    spare_part_details: Optional[str] = None
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    notes: Optional[str] = None


class PledgeResponse(BaseModel):
    id: int
    invention_id: int
    donor_id: Optional[int] = None
    donor_name: Optional[str] = None
    pledge_type: str
    amount: Decimal
    spare_part_details: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Bounties
class BountyCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=20)
    region: str = Field(..., max_length=100)
    reward_amount: Optional[Decimal] = Decimal("0.00")
    deadline: Optional[datetime] = None


class BountySubmissionCreate(BaseModel):
    invention_id: int
    note: Optional[str] = None


class BountySubmissionResponse(BaseModel):
    id: int
    bounty_id: int
    invention_id: int
    invention_title: Optional[str] = None
    innovator_id: int
    innovator_name: Optional[str] = None
    note: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class BountyResponse(BaseModel):
    id: int
    poster_id: int
    poster_name: Optional[str] = None
    title: str
    description: str
    region: str
    reward_amount: Decimal
    status: str
    deadline: Optional[datetime] = None
    submissions_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True


# Replications
class ReplicationCreate(BaseModel):
    location: str
    state: str
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    build_cost: Optional[Decimal] = Decimal("0.00")


class ReplicationResponse(BaseModel):
    id: int
    invention_id: int
    invention_title: Optional[str] = None
    builder_id: int
    builder_name: Optional[str] = None
    location: str
    state: str
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    build_cost: Decimal
    created_at: datetime

    class Config:
        from_attributes = True
