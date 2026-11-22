from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


# Admin Moderation
class ModerationActionRequest(BaseModel):
    reason: Optional[str] = None


class FieldTestUpdateRequest(BaseModel):
    field_tested: bool


class AuditLogResponse(BaseModel):
    id: int
    admin_id: Optional[int] = None
    admin_name: Optional[str] = None
    entity_type: str
    entity_id: int
    action: str
    prior_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FeatureFlagResponse(BaseModel):
    id: int
    name: str
    enabled: bool
    description: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class FeatureFlagUpdate(BaseModel):
    enabled: bool


# Notifications
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: str
    link: Optional[str] = None
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Analytics & Impact
class ImpactSummaryResponse(BaseModel):
    total_inventions: int
    approved_inventions: int
    total_innovators: int
    total_replications: int
    total_funding_pledged: Decimal
    total_co2_saved_kg: Decimal
    total_water_saved_liters: Decimal
    total_workshops: int
    total_bounties: int


class CategoryDistributionItem(BaseModel):
    category: str
    count: int
    percentage: float


class StateDistributionItem(BaseModel):
    state: str
    inventions_count: int
    replications_count: int


class AnalyticsOverviewResponse(BaseModel):
    impact_summary: ImpactSummaryResponse
    categories: List[CategoryDistributionItem]
    state_distribution: List[StateDistributionItem]
    recent_replications: List[Dict[str, Any]]
    esg_summary: Dict[str, Any]
