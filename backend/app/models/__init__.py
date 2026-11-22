# Import all models to ensure DeclarativeBase metadata is complete
from app.models.user import User
from app.models.invention import Invention
from app.models.material import InventionMaterial
from app.models.review import ReviewRating
from app.models.message import Message
from app.models.pledge import FundingPledge
from app.models.bounty import Bounty, BountySubmission
from app.models.replication import Replication
from app.models.mentorship import MentorshipRequest
from app.models.telemetry import TelemetryLog
from app.models.workshop import Workshop
from app.models.licensing import LicensingContract
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.models.feature_flag import FeatureFlag
from app.models.outbox import EventOutbox
from app.models.commercial_offer import CommercialOffer
from app.models.pitch import Pitch
from app.models.social import InventionLike, InventionComment
from app.models.otp import EmailOTP
from app.models.shortlist import OfficialShortlist

__all__ = [
    "User",
    "Invention",
    "InventionMaterial",
    "ReviewRating",
    "Message",
    "FundingPledge",
    "Bounty",
    "BountySubmission",
    "Replication",
    "MentorshipRequest",
    "TelemetryLog",
    "Workshop",
    "LicensingContract",
    "Notification",
    "AuditLog",
    "FeatureFlag",
    "EventOutbox",
    "CommercialOffer",
    "Pitch",
    "InventionLike",
    "InventionComment",
    "EmailOTP",
    "OfficialShortlist",
]
