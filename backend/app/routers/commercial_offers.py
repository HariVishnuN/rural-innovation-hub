from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.commercial_offer import CommercialOffer
from app.models.notification import Notification
from app.schemas.commercial_offer import (
    CommercialOfferCreate,
    CommercialOfferResponse,
    CommercialOfferStatusUpdate,
)
from app.core.permissions import get_current_user, get_current_user_optional

router = APIRouter(tags=["Commercial Offers (Rent/Buy/License)"])


@router.post("/inventions/{invention_id}/offers", response_model=CommercialOfferResponse, status_code=status.HTTP_201_CREATED)
def submit_commercial_offer(
    invention_id: int,
    req: CommercialOfferCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Submits a Buy, Rent, or License offer from an Official/Company/Investor
    to the Grassroots Inventor, persisted transactionally in MySQL.
    """
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    official_name = current_user.full_name if current_user else (req.official_name or "Official Representative")
    official_email = current_user.email if current_user else (req.official_email or "official@department.gov")
    official_id = current_user.id if current_user else None

    amount_val = req.proposed_amount if req.proposed_amount is not None else (req.amount_inr or Decimal("0.00"))

    clean_type = (req.offer_type or "BUY").strip()
    if clean_type.lower() in ["paid reuse", "paid_reuse", "reuse"]:
        offer_type_val = "Paid Reuse"
    elif clean_type.lower() in ["rent", "rental"]:
        offer_type_val = "Rent"
    elif clean_type.lower() in ["buy", "purchase"]:
        offer_type_val = "Buy"
    else:
        offer_type_val = clean_type.capitalize()

    offer = CommercialOffer(
        invention_id=inv.id,
        inventor_id=inv.creator_id,
        official_id=official_id,
        buyer_id=official_id,
        official_name=official_name,
        organization_name=req.organization_name.strip(),
        official_email=official_email,
        official_phone=req.official_phone,
        offer_type=offer_type_val,
        proposed_amount=amount_val,
        amount_inr=amount_val,
        rental_duration_months=req.rental_duration_months,
        message=req.message.strip(),
        status="PENDING",
        created_at=datetime.utcnow(),
    )
    db.add(offer)

    # Notify Inventor
    offer_type_label = offer_type_val
    notif = Notification(
        user_id=inv.creator_id,
        type="COMMERCIAL_OFFER",
        title=f"New {offer_type_label} Offer from {req.organization_name}!",
        body=f"{official_name} proposed ₹{float(amount_val):,.2f} to {offer_type_val.lower()} '{inv.title}'.",
        link=f"/profile",
        created_at=datetime.utcnow(),
    )
    db.add(notif)

    db.commit()
    db.refresh(offer)

    creator = db.query(User).filter(User.id == inv.creator_id).first()

    return CommercialOfferResponse(
        id=offer.id,
        invention_id=inv.id,
        invention_title=inv.title,
        invention_image_url=inv.image_url,
        inventor_id=inv.creator_id,
        inventor_name=creator.full_name if creator else "Inventor",
        official_id=offer.official_id,
        buyer_id=offer.buyer_id or offer.official_id,
        official_name=offer.official_name,
        buyer_name=offer.official_name,
        organization_name=offer.organization_name,
        official_email=offer.official_email,
        buyer_email=offer.official_email,
        official_phone=offer.official_phone,
        buyer_phone=offer.official_phone,
        offer_type=offer.offer_type,
        proposed_amount=offer.proposed_amount,
        amount_inr=offer.amount_inr or offer.proposed_amount,
        rental_duration_months=offer.rental_duration_months,
        message=offer.message,
        status=offer.status,
        created_at=offer.created_at,
    )


@router.get("/inventions/{invention_id}/offers", response_model=List[CommercialOfferResponse])
def get_invention_offers(
    invention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns offers for a specific invention (visible to creator or admin)."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    if inv.creator_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    offers = db.query(CommercialOffer).filter(CommercialOffer.invention_id == invention_id).order_by(CommercialOffer.created_at.desc()).all()
    creator = db.query(User).filter(User.id == inv.creator_id).first()

    return [
        CommercialOfferResponse(
            id=o.id,
            invention_id=inv.id,
            invention_title=inv.title,
            invention_image_url=inv.image_url,
            inventor_id=inv.creator_id,
            inventor_name=creator.full_name if creator else "Inventor",
            official_id=o.official_id,
            official_name=o.official_name,
            organization_name=o.organization_name,
            official_email=o.official_email,
            official_phone=o.official_phone,
            offer_type=o.offer_type,
            proposed_amount=o.proposed_amount,
            rental_duration_months=o.rental_duration_months,
            message=o.message,
            status=o.status,
            created_at=o.created_at,
        )
        for o in offers
    ]


@router.get("/offers/received", response_model=List[CommercialOfferResponse])
def get_received_offers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all incoming Buy/Rent/License offers for inventions owned by the authenticated inventor."""
    offers = db.query(CommercialOffer).filter(CommercialOffer.inventor_id == current_user.id).order_by(CommercialOffer.created_at.desc()).all()
    results = []
    for o in offers:
        inv = db.query(Invention).filter(Invention.id == o.invention_id).first()
        results.append(
            CommercialOfferResponse(
                id=o.id,
                invention_id=o.invention_id,
                invention_title=inv.title if inv else "Invention",
                invention_image_url=inv.image_url if inv else None,
                inventor_id=o.inventor_id,
                inventor_name=current_user.full_name,
                official_id=o.official_id,
                official_name=o.official_name,
                organization_name=o.organization_name,
                official_email=o.official_email,
                official_phone=o.official_phone,
                offer_type=o.offer_type,
                proposed_amount=o.proposed_amount,
                rental_duration_months=o.rental_duration_months,
                message=o.message,
                status=o.status,
                created_at=o.created_at,
            )
        )
    return results


@router.get("/offers/sent", response_model=List[CommercialOfferResponse])
def get_sent_offers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns offers sent by the authenticated official/investor."""
    offers = db.query(CommercialOffer).filter(CommercialOffer.official_id == current_user.id).order_by(CommercialOffer.created_at.desc()).all()
    results = []
    for o in offers:
        inv = db.query(Invention).filter(Invention.id == o.invention_id).first()
        inventor = db.query(User).filter(User.id == o.inventor_id).first()
        results.append(
            CommercialOfferResponse(
                id=o.id,
                invention_id=o.invention_id,
                invention_title=inv.title if inv else "Invention",
                invention_image_url=inv.image_url if inv else None,
                inventor_id=o.inventor_id,
                inventor_name=inventor.full_name if inventor else "Inventor",
                official_id=o.official_id,
                official_name=o.official_name,
                organization_name=o.organization_name,
                official_email=o.official_email,
                official_phone=o.official_phone,
                offer_type=o.offer_type,
                proposed_amount=o.proposed_amount,
                rental_duration_months=o.rental_duration_months,
                message=o.message,
                status=o.status,
                created_at=o.created_at,
            )
        )
    return results


@router.patch("/offers/{offer_id}/status", response_model=CommercialOfferResponse)
def update_offer_status(
    offer_id: int,
    req: CommercialOfferStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Inventor accepts, rejects, or marks an offer as negotiating."""
    offer = db.query(CommercialOffer).filter(CommercialOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.inventor_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the inventor can update offer status")

    offer.status = req.status.upper()
    db.commit()
    db.refresh(offer)

    inv = db.query(Invention).filter(Invention.id == offer.invention_id).first()

    return CommercialOfferResponse(
        id=offer.id,
        invention_id=offer.invention_id,
        invention_title=inv.title if inv else "Invention",
        invention_image_url=inv.image_url if inv else None,
        inventor_id=offer.inventor_id,
        inventor_name=current_user.full_name,
        official_id=offer.official_id,
        buyer_id=offer.buyer_id or offer.official_id,
        official_name=offer.official_name,
        buyer_name=offer.official_name,
        organization_name=offer.organization_name,
        official_email=offer.official_email,
        buyer_email=offer.official_email,
        official_phone=offer.official_phone,
        buyer_phone=offer.official_phone,
        offer_type=offer.offer_type,
        proposed_amount=offer.proposed_amount,
        amount_inr=offer.amount_inr or offer.proposed_amount,
        rental_duration_months=offer.rental_duration_months,
        message=offer.message,
        status=offer.status,
        created_at=offer.created_at,
    )
