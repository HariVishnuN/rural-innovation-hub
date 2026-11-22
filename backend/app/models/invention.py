from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class Invention(Base):
    __tablename__ = "inventions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(
        Enum(
            "Agriculture",
            "Water & Irrigation",
            "Renewable Energy",
            "Health & Sanitation",
            "Small Farm Machinery",
            "Education & Crafts",
            "Other",
            name="invention_category_enum",
        ),
        nullable=False,
        index=True,
    )
    region = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    assembly_steps = Column(JSON, nullable=False)  # Array of {step: 1, title: "", details: "", audio_url: ""}
    total_cost = Column(Numeric(12, 2), nullable=False, default=0.00, index=True)
    currency = Column(String(10), default="INR")
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    blueprint_url = Column(String(500), nullable=True)
    sketch_url = Column(String(500), nullable=True)
    sha256_hash = Column(String(64), nullable=False, index=True)
    submission_timestamp = Column(DateTime, default=datetime.utcnow)
    moderation_status = Column(
        Enum("PENDING", "APPROVED", "REJECTED", name="moderation_status_enum"),
        nullable=False,
        default="PENDING",
        index=True,
    )
    rejection_reason = Column(Text, nullable=True)
    safety_score = Column(Integer, default=85)
    durability_notes = Column(Text, nullable=True)
    field_tested = Column(Boolean, default=False, index=True)
    scaling_stage = Column(
        Enum(
            "RAW_PROTOTYPE",
            "PEER_VALIDATED",
            "FIELD_TESTED",
            "MARKET_READY",
            name="scaling_stage_enum",
        ),
        nullable=False,
        default="RAW_PROTOTYPE",
        index=True,
    )
    estimated_co2_savings_kg = Column(Numeric(10, 2), default=0.00)
    estimated_water_savings_liters = Column(Numeric(12, 2), default=0.00)
    views_count = Column(Integer, default=0)
    is_deleted = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="inventions")
    materials = relationship("InventionMaterial", back_populates="invention", cascade="all, delete-orphan")
    reviews = relationship("ReviewRating", back_populates="invention", cascade="all, delete-orphan")
    pledges = relationship("FundingPledge", back_populates="invention", cascade="all, delete-orphan")
    replications = relationship("Replication", back_populates="invention", cascade="all, delete-orphan")
    telemetry_logs = relationship("TelemetryLog", back_populates="invention", cascade="all, delete-orphan")
    mentorship_requests = relationship("MentorshipRequest", back_populates="invention", cascade="all, delete-orphan")
    licensing_contracts = relationship("LicensingContract", back_populates="invention", cascade="all, delete-orphan")
    bounty_submissions = relationship("BountySubmission", back_populates="invention")
    pitches = relationship("Pitch", back_populates="invention", cascade="all, delete-orphan")
    likes = relationship("InventionLike", back_populates="invention", cascade="all, delete-orphan")
    comments = relationship("InventionComment", back_populates="invention", cascade="all, delete-orphan")
    commercial_offers = relationship("CommercialOffer", back_populates="invention", cascade="all, delete-orphan")
