from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.licensing import LicensingContract
from app.models.notification import Notification
from app.schemas.collaboration import LicensingContractCreate, LicensingContractResponse
from app.schemas.admin_analytics import NotificationResponse, ImpactSummaryResponse
from app.services.analytics_service import AnalyticsService
from app.core.permissions import get_current_user

router = APIRouter(tags=["Licensing, Notifications & Summary"])


@router.get("/impact/summary", response_model=ImpactSummaryResponse, tags=["Impact"])
def get_landing_impact_summary(db: Session = Depends(get_db)):
    """Live landing-page counter counts directly from MySQL."""
    return AnalyticsService.get_impact_summary(db)


@router.post("/inventions/{invention_id}/licenses", response_model=LicensingContractResponse, status_code=status.HTTP_201_CREATED, tags=["Licensing"])
def create_licensing_contract(
    invention_id: int,
    req: LicensingContractCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generates and stores a draft grassroots open-hardware licensing agreement."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    terms = req.contract_terms or (
        f"Grassroots Technology Non-Exclusive License Agreement for '{inv.title}'. "
        f"Grantee {req.licensee_name} ({req.licensee_entity_type}) agrees to pay {req.royalty_percentage}% "
        f"royalty on commercial manufacture in {req.territory}. 50% of royalties are allocated to the "
        f"innovator ({current_user.full_name}) and 50% to community replication workshops."
    )

    contract = LicensingContract(
        invention_id=invention_id,
        inventor_id=inv.creator_id,
        licensee_name=req.licensee_name,
        licensee_entity_type=req.licensee_entity_type,
        royalty_percentage=req.royalty_percentage,
        territory=req.territory or "India",
        contract_terms=terms,
        status="DRAFT",
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    return LicensingContractResponse(
        id=contract.id,
        invention_id=contract.invention_id,
        invention_title=inv.title,
        inventor_id=contract.inventor_id,
        licensee_name=contract.licensee_name,
        licensee_entity_type=contract.licensee_entity_type,
        royalty_percentage=contract.royalty_percentage,
        territory=contract.territory,
        contract_terms=contract.contract_terms,
        status=contract.status,
        created_at=contract.created_at,
    )


@router.get("/notifications", response_model=List[NotificationResponse], tags=["Notifications"])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns alerts, approval notices, and mentorship requests for the user."""
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    return [NotificationResponse.model_validate(n) for n in notifs]


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse, tags=["Notifications"])
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks a notification as read."""
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    n.read_at = datetime.utcnow()
    db.commit()
    db.refresh(n)
    return NotificationResponse.model_validate(n)
