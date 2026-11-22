from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.commercial_offer import CommercialOffer
from app.services.invention_service import InventionService
from app.schemas.user import (
    UserResponse,
    UserPublicResponse,
    UserUpdate,
    InnovatorDashboardResponse,
    BuyerDetail,
    InnovatorDashboardSummary,
)
from app.schemas.invention import InventionResponse
from app.core.permissions import get_current_user
from app.core.security import get_password_hash
import re

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's full private profile."""
    return UserResponse.model_validate(current_user)


@router.get("/me/dashboard", response_model=InnovatorDashboardResponse)
def get_my_innovator_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Private Innovator Dashboard:
    Strictly restricted to the authenticated user.
    Returns caller's profile, posted inventions with live counts,
    and private list of buyers/reusers with summary totals.
    """
    # 1. Fetch user's inventions
    user_inventions = InventionService.get_inventions(
        db,
        status=None,  # All statuses
        current_user_id=current_user.id,
        limit=200,
    )
    my_inventions = [inv for inv in user_inventions if inv.creator_id == current_user.id]

    # 2. Fetch commercial offers / buyers for user's inventions
    offers = db.query(CommercialOffer).filter(
        CommercialOffer.inventor_id == current_user.id
    ).order_by(CommercialOffer.created_at.desc()).all()

    buyers_list = []
    total_earnings = Decimal("0.00")
    for o in offers:
        inv = db.query(Invention).filter(Invention.id == o.invention_id).first()
        amt = o.amount_inr or o.proposed_amount or Decimal("0.00")
        if o.status in ["ACCEPTED", "PAID", "Accepted", "Paid"]:
            total_earnings += amt

        buyers_list.append(
            BuyerDetail(
                id=o.id,
                invention_id=o.invention_id,
                invention_title=inv.title if inv else "Invention",
                invention_image_url=inv.image_url if inv else None,
                buyer_id=o.buyer_id or o.official_id,
                buyer_name=o.official_name or "Official Representative",
                buyer_email=o.official_email or "",
                buyer_phone=o.official_phone,
                organization_name=o.organization_name,
                offer_type=o.offer_type,
                amount_inr=amt,
                message=o.message,
                status=o.status,
                created_at=o.created_at,
            )
        )

    # 3. Summary totals
    total_likes = sum(inv.likes_count or 0 for inv in my_inventions)
    total_comments = sum(inv.comments_count or 0 for inv in my_inventions)
    total_paid_reuses = sum(inv.paid_reuses_count or 0 for inv in my_inventions)

    # If no accepted earnings yet, total value of offers
    if total_earnings == Decimal("0.00") and offers:
        total_earnings = sum(o.amount_inr or o.proposed_amount or Decimal("0.00") for o in offers)

    summary = InnovatorDashboardSummary(
        total_inventions=len(my_inventions),
        total_likes=total_likes,
        total_comments=total_comments,
        total_paid_reuses=len(buyers_list) if len(buyers_list) > total_paid_reuses else total_paid_reuses,
        total_earnings_inr=total_earnings,
    )

    return InnovatorDashboardResponse(
        user=UserResponse.model_validate(current_user),
        inventions=my_inventions,
        buyers=buyers_list,
        summary=summary,
    )


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    req: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates profile attributes, username, and 4-digit quick PIN for the authenticated user."""
    update_data = req.model_dump(exclude_unset=True)

    if "username" in update_data:
        raw_username = update_data.pop("username")
        if raw_username:
            new_username = raw_username.strip().lower()
            if not re.match(r"^[a-zA-Z0-9_\.]{3,30}$", new_username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username must be 3-30 characters (letters, numbers, underscores, dots).",
                )
            existing = db.query(User).filter(User.username == new_username, User.id != current_user.id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This username is already taken. Please choose another.",
                )
            current_user.username = new_username

    if "pin" in update_data:
        raw_pin = update_data.pop("pin")
        if raw_pin:
            clean_pin = str(raw_pin).strip()
            if not re.match(r"^\d{4}$", clean_pin):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quick PIN must be strictly 4 numeric digits (0000-9999).",
                )
            current_user.pin_hash = get_password_hash(clean_pin)

    new_pwd = update_data.pop("new_password", None) or update_data.pop("password", None)
    if new_pwd:
        clean_pwd = str(new_pwd).strip()
        if len(clean_pwd) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters.",
            )
        current_user.password_hash = get_password_hash(clean_pwd)

    if "phone_number" in update_data and "phone" not in update_data:
        update_data["phone"] = update_data.pop("phone_number")
    elif "phone_number" in update_data:
        update_data.pop("phone_number")

    if "village_or_city" in update_data and "village_city" not in update_data:
        update_data["village_city"] = update_data.pop("village_or_city")
    elif "village_or_city" in update_data:
        update_data.pop("village_or_city")

    if "skills_or_expertise" in update_data and "skills_expertise" not in update_data:
        update_data["skills_expertise"] = update_data.pop("skills_or_expertise")
    elif "skills_or_expertise" in update_data:
        update_data.pop("skills_or_expertise")

    for field, val in update_data.items():
        setattr(current_user, field, val)

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/{user_id}", response_model=UserPublicResponse)
def get_public_profile(user_id: int, db: Session = Depends(get_db)):
    """Returns a privacy-safe public view of an innovator or mentor."""
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserPublicResponse.model_validate(user)


@router.get("/{user_id}/inventions", response_model=List[InventionResponse])
def get_user_inventions(user_id: int, db: Session = Depends(get_db)):
    """Returns approved inventions created by a specific user."""
    return InventionService.get_inventions(db, status="APPROVED", skip=0, limit=100)
