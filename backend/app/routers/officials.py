import logging
from decimal import Decimal
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.shortlist import OfficialShortlist
from app.models.commercial_offer import CommercialOffer
from app.models.pledge import FundingPledge
from app.schemas.invention import InventionResponse
from app.schemas.user import UserPublicResponse
from app.services.invention_service import InventionService
from app.core.permissions import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/officials", tags=["Officials & Investors Portal"])


class ShortlistCreate(BaseModel):
    invention_id: int
    notes: Optional[str] = None


class ShortlistItem(BaseModel):
    id: int
    invention: InventionResponse
    notes: Optional[str] = None
    created_at: Any


class OfficialsOverview(BaseModel):
    total_inventions: int
    total_innovators: int
    total_shortlisted: int
    total_commercial_offers: int
    total_grants_pledged: Decimal


class InnovatorDirectoryItem(BaseModel):
    id: int
    full_name: str
    username: Optional[str] = None
    email: str
    phone: Optional[str] = None
    state: Optional[str] = None
    village_city: Optional[str] = None
    profile_photo_url: Optional[str] = None
    verified: bool
    inventions_count: int
    top_inventions: List[str]


@router.get("/overview", response_model=OfficialsOverview)
def get_officials_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns top executive statistics for officials, investors, and administrators."""
    total_invs = db.query(func.count(Invention.id)).filter(
        Invention.moderation_status == "APPROVED",
        Invention.is_deleted == False
    ).scalar() or 0

    total_innovators = db.query(func.count(User.id)).filter(
        User.role.in_(["INNOVATOR", "Innovator"])
    ).scalar() or 0

    my_shortlisted = db.query(func.count(OfficialShortlist.id)).filter(
        OfficialShortlist.official_id == current_user.id
    ).scalar() or 0

    total_offers = db.query(func.count(CommercialOffer.id)).scalar() or 0

    total_pledged = db.query(func.sum(FundingPledge.amount)).filter(
        FundingPledge.status != "CANCELLED"
    ).scalar() or Decimal("0.00")

    return OfficialsOverview(
        total_inventions=total_invs,
        total_innovators=total_innovators,
        total_shortlisted=my_shortlisted,
        total_commercial_offers=total_offers,
        total_grants_pledged=total_pledged,
    )


@router.get("/shortlist", response_model=List[ShortlistItem])
def get_my_shortlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all inventions starred/shortlisted by this official."""
    records = (
        db.query(OfficialShortlist)
        .filter(OfficialShortlist.official_id == current_user.id)
        .order_by(OfficialShortlist.created_at.desc())
        .all()
    )

    items = []
    for r in records:
        inv_detail = InventionService.get_invention_detail(db, r.invention_id, current_user_id=current_user.id)
        if inv_detail:
            items.append(
                ShortlistItem(
                    id=r.id,
                    invention=inv_detail,
                    notes=r.notes,
                    created_at=r.created_at,
                )
            )

    return items


@router.post("/shortlist", status_code=status.HTTP_201_CREATED)
def add_to_shortlist(
    req: ShortlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Adds an invention to the official's private inspection shortlist."""
    existing = (
        db.query(OfficialShortlist)
        .filter(
            OfficialShortlist.official_id == current_user.id,
            OfficialShortlist.invention_id == req.invention_id,
        )
        .first()
    )

    if existing:
        return {"shortlisted": True, "message": "Already in your shortlist", "id": existing.id}

    inv = db.query(Invention).filter(Invention.id == req.invention_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invention not found")

    item = OfficialShortlist(
        official_id=current_user.id,
        invention_id=req.invention_id,
        innovator_id=inv.creator_id,
        notes=req.notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {"shortlisted": True, "message": "Invention added to your shortlist", "id": item.id}


@router.delete("/shortlist/{invention_id}")
def remove_from_shortlist(
    invention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Removes an invention from the official's shortlist."""
    item = (
        db.query(OfficialShortlist)
        .filter(
            OfficialShortlist.official_id == current_user.id,
            OfficialShortlist.invention_id == invention_id,
        )
        .first()
    )
    if item:
        db.delete(item)
        db.commit()
        return {"shortlisted": False, "message": "Removed from shortlist"}

    return {"shortlisted": False, "message": "Not in shortlist"}


@router.get("/innovators", response_model=List[InnovatorDirectoryItem])
def get_innovators_directory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists verified grassroots innovators and their published machines."""
    innovators = (
        db.query(User)
        .filter(User.role.in_(["INNOVATOR", "Innovator"]))
        .order_by(User.full_name.asc())
        .all()
    )

    res = []
    for user in innovators:
        invs = (
            db.query(Invention.title)
            .filter(
                Invention.creator_id == user.id,
                Invention.moderation_status == "APPROVED",
                Invention.is_deleted == False,
            )
            .limit(4)
            .all()
        )
        top_titles = [i[0] for i in invs]

        res.append(
            InnovatorDirectoryItem(
                id=user.id,
                full_name=user.full_name,
                username=user.username,
                email=user.email,
                phone=user.phone,
                state=user.state,
                village_city=user.village_city,
                profile_photo_url=user.profile_photo_url,
                verified=user.verified,
                inventions_count=len(invs),
                top_inventions=top_titles,
            )
        )

    return res
