from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    username = Column(String(50), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    pin_hash = Column(String(255), nullable=True)
    role = Column(
        Enum("INNOVATOR", "INVESTOR", "MENTOR", "ADMIN", name="user_role_enum"),
        nullable=False,
        default="INNOVATOR",
        index=True,
    )
    phone = Column(String(20), nullable=True)
    village_city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True, index=True)
    pincode = Column(String(10), nullable=True)
    preferred_language = Column(String(50), default="English")
    bio = Column(Text, nullable=True)
    skills_expertise = Column(String(255), nullable=True)
    organization_college = Column(String(150), nullable=True)
    profile_photo_url = Column(Text, nullable=True)
    verified = Column(Boolean, default=False, index=True)
    consent_given = Column(Boolean, default=True)
    consent_timestamp = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    inventions = relationship("Invention", back_populates="creator", foreign_keys="Invention.creator_id")
    reviews = relationship("ReviewRating", back_populates="user")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    pledges = relationship("FundingPledge", back_populates="donor")
    bounties_posted = relationship("Bounty", back_populates="poster")
    bounty_submissions = relationship("BountySubmission", back_populates="innovator")
    replications = relationship("Replication", back_populates="builder")
    mentorships_as_innovator = relationship("MentorshipRequest", back_populates="innovator", foreign_keys="MentorshipRequest.innovator_id")
    mentorships_as_mentor = relationship("MentorshipRequest", back_populates="mentor", foreign_keys="MentorshipRequest.mentor_id")
    notifications = relationship("Notification", back_populates="user")
    likes = relationship("InventionLike", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("InventionComment", back_populates="user", cascade="all, delete-orphan")

    @property
    def has_pin(self) -> bool:
        return bool(self.pin_hash)
