import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    print("SUCCESS: FastAPI application and all 13 routers loaded cleanly.")

    from app.models import (
        User, Invention, InventionMaterial, ReviewRating, Message,
        FundingPledge, Bounty, BountySubmission, Replication,
        MentorshipRequest, TelemetryLog, Workshop, LicensingContract,
        Notification, AuditLog, FeatureFlag, EventOutbox, CommercialOffer,
        Pitch
    )
    print("SUCCESS: All 19 SQLAlchemy models loaded cleanly into metadata.")

    from app.services.invention_service import InventionService
    print("SUCCESS: Invention service and rule-based heuristic engines loaded.")

    from app.core.security import calculate_sha256
    h = calculate_sha256("test-content")
    print(f"SUCCESS: SHA-256 fingerprint engine operational ({h[:12]}...).")

except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)
