from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Any
from pydantic import BaseModel, Field


class AssemblyStep(BaseModel):
    step: Optional[int] = 1
    title: Optional[str] = "Step"
    details: Optional[str] = "Assembly step details"
    audio_text: Optional[str] = None
    tool_required: Optional[str] = None


class MaterialItem(BaseModel):
    item_name: Optional[str] = "Hardware Component"
    quantity: Optional[str] = "1 Unit"
    unit_cost: Optional[Decimal] = Decimal("0.00")
    local_source: Optional[str] = None
    optimized_alternative: Optional[str] = None
    estimated_savings: Optional[Decimal] = Decimal("0.00")


class MaterialResponse(MaterialItem):
    id: int
    invention_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class InventionCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    category: Optional[str] = "Agriculture"
    region: Optional[str] = "Gujarat"
    description: str = Field(..., min_length=3)
    assembly_steps: Optional[List[AssemblyStep]] = Field(default_factory=list)
    materials: Optional[List[MaterialItem]] = Field(default_factory=list)
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    blueprint_url: Optional[str] = None
    sketch_url: Optional[str] = None
    durability_notes: Optional[str] = None
    scaling_stage: Optional[str] = "RAW_PROTOTYPE"
    estimated_co2_savings_kg: Optional[Decimal] = Decimal("0.00")
    estimated_water_savings_liters: Optional[Decimal] = Decimal("0.00")


class InventionUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    description: Optional[str] = None
    assembly_steps: Optional[List[AssemblyStep]] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    blueprint_url: Optional[str] = None
    sketch_url: Optional[str] = None
    durability_notes: Optional[str] = None
    scaling_stage: Optional[str] = None
    estimated_co2_savings_kg: Optional[Decimal] = None
    estimated_water_savings_liters: Optional[Decimal] = None


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    invention_id: int
    user_id: int
    user_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InventionResponse(BaseModel):
    id: int
    creator_id: int
    creator_name: Optional[str] = None
    creator_state: Optional[str] = None
    creator_photo_url: Optional[str] = None
    creator_village_city: Optional[str] = None
    creator_phone: Optional[str] = None
    creator_bio: Optional[str] = None
    creator_verified: Optional[bool] = False
    title: str
    category: str
    region: str
    description: str
    total_cost: Decimal
    currency: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    blueprint_url: Optional[str] = None
    sketch_url: Optional[str] = None
    sha256_hash: str
    moderation_status: str
    rejection_reason: Optional[str] = None
    safety_score: int
    durability_notes: Optional[str] = None
    field_tested: bool
    scaling_stage: Optional[str] = "RAW_PROTOTYPE"
    estimated_co2_savings_kg: Decimal
    estimated_water_savings_liters: Decimal
    views_count: int
    average_rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    replications_count: Optional[int] = 0
    total_pledged: Optional[Decimal] = Decimal("0.00")
    likes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    paid_reuses_count: Optional[int] = 0
    is_liked_by_me: Optional[bool] = False
    created_at: datetime

    class Config:
        from_attributes = True


class InventionLikeResponse(BaseModel):
    liked: bool
    likes_count: int


class CommentCreate(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: int
    invention_id: int
    user_id: int
    user_name: Optional[str] = None
    user_username: Optional[str] = None
    user_role: Optional[str] = None
    user_photo_url: Optional[str] = None
    comment_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class ScalingStageUpdate(BaseModel):
    scaling_stage: str = Field(..., pattern="^(RAW_PROTOTYPE|PEER_VALIDATED|FIELD_TESTED|MARKET_READY)$")


class InventionDetailResponse(InventionResponse):
    assembly_steps: List[Any]
    materials: List[MaterialResponse]
    reviews: List[ReviewResponse]


class SimilarityCheckRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None


class SimilarityMatch(BaseModel):
    id: int
    title: str
    category: str
    score: float
    description_snippet: str


class SimilarityCheckResponse(BaseModel):
    matches: List[SimilarityMatch]
    message: str


class MaterialOptimizeRequest(BaseModel):
    materials: List[MaterialItem]


class MaterialOptimizeResponse(BaseModel):
    original_total: Decimal
    optimized_total: Decimal
    potential_savings: Decimal
    suggestions: List[MaterialItem]
    rationale: str


class InventionCertificateResponse(BaseModel):
    certificate_id: str
    invention_id: int
    title: str
    creator_name: str
    creator_location: str
    sha256_hash: str
    submission_timestamp: datetime
    category: str
    field_tested: bool
    safety_score: int
    verification_url: str
    disclaimer: str
