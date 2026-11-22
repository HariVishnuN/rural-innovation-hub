from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.pitch import Pitch
from app.models.notification import Notification
from app.models.message import Message
from app.schemas.pitch import PitchCreate, PitchStatusUpdate, PitchResponse
from app.core.permissions import get_current_user

router = APIRouter(prefix="/pitches", tags=["Investor Pitches"])


@router.post("", response_model=PitchResponse, status_code=status.HTTP_201_CREATED)
def submit_pitch(
    req: PitchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows a rural inventor to submit an investment/grant pitch directly to a registered Investor or NGO."""
    # Verify invention exists and belongs to user
    inv = db.query(Invention).filter(Invention.id == req.invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invention not found.")

    # Verify investor exists
    investor = db.query(User).filter(User.id == req.investor_id, User.is_deleted == False).first()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor or NGO representative not found.")

    pitch = Pitch(
        inventor_id=current_user.id,
        investor_id=investor.id,
        invention_id=inv.id,
        pitch_title=req.pitch_title.strip(),
        pitch_notes=req.pitch_notes.strip(),
        funding_needed=req.funding_needed,
        status="SUBMITTED",
    )
    db.add(pitch)
    db.flush()

    # Create notification for investor
    notif = Notification(
        user_id=investor.id,
        title=f"New Pitch from {current_user.full_name}",
        message=f"Received investment pitch '{req.pitch_title}' for '{inv.title}' (Requested: ₹{req.funding_needed:,}).",
        notification_type="SYSTEM",
        link_url=f"/inventions/{inv.id}",
    )
    db.add(notif)

    # Initiate communication thread in messages
    msg = Message(
        sender_id=current_user.id,
        receiver_id=investor.id,
        invention_id=inv.id,
        content=f"[Direct Pitch] {req.pitch_title}\n\n{req.pitch_notes}\n\nTarget Funding: ₹{req.funding_needed:,}",
    )
    db.add(msg)

    db.commit()
    db.refresh(pitch)

    return PitchResponse(
        id=pitch.id,
        inventor_id=current_user.id,
        inventor_name=current_user.full_name,
        inventor_location=f"{current_user.village_city or ''}, {current_user.state or ''}".strip(", "),
        investor_id=investor.id,
        investor_name=investor.full_name,
        organization_name=investor.organization_college,
        invention_id=inv.id,
        invention_title=inv.title,
        invention_category=inv.category,
        pitch_title=pitch.pitch_title,
        pitch_notes=pitch.pitch_notes,
        funding_needed=pitch.funding_needed,
        status=pitch.status,
        feedback_notes=pitch.feedback_notes,
        created_at=pitch.created_at,
        updated_at=pitch.updated_at,
    )


@router.get("/sent", response_model=List[PitchResponse])
def get_sent_pitches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all pitches submitted by the currently logged-in inventor."""
    pitches = db.query(Pitch).filter(Pitch.inventor_id == current_user.id).order_by(Pitch.created_at.desc()).all()
    results = []
    for p in pitches:
        inv = db.query(Invention).filter(Invention.id == p.invention_id).first()
        investor = db.query(User).filter(User.id == p.investor_id).first()
        results.append(
            PitchResponse(
                id=p.id,
                inventor_id=p.inventor_id,
                inventor_name=current_user.full_name,
                inventor_location=f"{current_user.village_city or ''}, {current_user.state or ''}".strip(", "),
                investor_id=p.investor_id,
                investor_name=investor.full_name if investor else "Investor",
                organization_name=investor.organization_college if investor else None,
                invention_id=p.invention_id,
                invention_title=inv.title if inv else "Invention",
                invention_category=inv.category if inv else "Agriculture",
                pitch_title=p.pitch_title,
                pitch_notes=p.pitch_notes,
                funding_needed=p.funding_needed,
                status=p.status,
                feedback_notes=p.feedback_notes,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )
    return results


@router.get("/received", response_model=List[PitchResponse])
def get_received_pitches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all pitches received by the currently logged-in investor or official."""
    pitches = db.query(Pitch).filter(Pitch.investor_id == current_user.id).order_by(Pitch.created_at.desc()).all()
    results = []
    for p in pitches:
        inv = db.query(Invention).filter(Invention.id == p.invention_id).first()
        inventor = db.query(User).filter(User.id == p.inventor_id).first()
        results.append(
            PitchResponse(
                id=p.id,
                inventor_id=p.inventor_id,
                inventor_name=inventor.full_name if inventor else "Grassroots Innovator",
                inventor_location=f"{inventor.village_city or ''}, {inventor.state or ''}".strip(", ") if inventor else "",
                investor_id=p.investor_id,
                investor_name=current_user.full_name,
                organization_name=current_user.organization_college,
                invention_id=p.invention_id,
                invention_title=inv.title if inv else "Invention",
                invention_category=inv.category if inv else "Agriculture",
                pitch_title=p.pitch_title,
                pitch_notes=p.pitch_notes,
                funding_needed=p.funding_needed,
                status=p.status,
                feedback_notes=p.feedback_notes,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )
    return results


@router.patch("/{pitch_id}/status", response_model=PitchResponse)
def update_pitch_status(
    pitch_id: int,
    req: PitchStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows an investor or administrator to review, accept, or decline a pitch."""
    pitch = db.query(Pitch).filter(Pitch.id == pitch_id).first()
    if not pitch:
        raise HTTPException(status_code=404, detail="Pitch not found.")

    if pitch.investor_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized to update this pitch.")

    pitch.status = req.status
    if req.feedback_notes:
        pitch.feedback_notes = req.feedback_notes.strip()

    # Notify inventor
    notif = Notification(
        user_id=pitch.inventor_id,
        title=f"Pitch Status: {req.status}",
        message=f"{current_user.full_name} updated your pitch '{pitch.pitch_title}' to {req.status}.",
        notification_type="SYSTEM",
        link_url=f"/inventions/{pitch.invention_id}",
    )
    db.add(notif)

    db.commit()
    db.refresh(pitch)

    inv = db.query(Invention).filter(Invention.id == pitch.invention_id).first()
    inventor = db.query(User).filter(User.id == pitch.inventor_id).first()

    return PitchResponse(
        id=pitch.id,
        inventor_id=pitch.inventor_id,
        inventor_name=inventor.full_name if inventor else "Grassroots Innovator",
        inventor_location=f"{inventor.village_city or ''}, {inventor.state or ''}".strip(", ") if inventor else "",
        investor_id=pitch.investor_id,
        investor_name=current_user.full_name,
        organization_name=current_user.organization_college,
        invention_id=pitch.invention_id,
        invention_title=inv.title if inv else "Invention",
        invention_category=inv.category if inv else "Agriculture",
        pitch_title=pitch.pitch_title,
        pitch_notes=pitch.pitch_notes,
        funding_needed=pitch.funding_needed,
        status=pitch.status,
        feedback_notes=pitch.feedback_notes,
        created_at=pitch.created_at,
        updated_at=pitch.updated_at,
    )
