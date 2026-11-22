from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.user import User
from app.models.bounty import Bounty, BountySubmission
from app.models.invention import Invention
from app.schemas.engagement import (
    BountyCreate,
    BountyResponse,
    BountySubmissionCreate,
    BountySubmissionResponse,
)
from app.core.permissions import get_current_user

router = APIRouter(prefix="/bounties", tags=["Community Problem Bounties"])


@router.get("", response_model=List[BountyResponse])
def list_bounties(db: Session = Depends(get_db)):
    """Lists open grassroots problems posted by farmers, panchayats, and rural groups."""
    bounties = db.query(Bounty).filter(Bounty.is_deleted == False).order_by(Bounty.created_at.desc()).all()
    results = []
    for b in bounties:
        poster = db.query(User).filter(User.id == b.poster_id).first()
        sub_count = db.query(func.count(BountySubmission.id)).filter(BountySubmission.bounty_id == b.id).scalar() or 0
        results.append(
            BountyResponse(
                id=b.id,
                poster_id=b.poster_id,
                poster_name=poster.full_name if poster else "Community Member",
                title=b.title,
                description=b.description,
                region=b.region,
                reward_amount=b.reward_amount,
                status=b.status,
                deadline=b.deadline,
                submissions_count=sub_count,
                created_at=b.created_at,
            )
        )
    return results


@router.post("", response_model=BountyResponse, status_code=status.HTTP_201_CREATED)
def create_bounty(
    req: BountyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Posts a new grassroots challenge with an optional prize or community fund."""
    b = Bounty(
        poster_id=current_user.id,
        title=req.title.strip(),
        description=req.description.strip(),
        region=req.region.strip(),
        reward_amount=req.reward_amount,
        deadline=req.deadline,
        status="OPEN",
    )
    db.add(b)
    db.commit()
    db.refresh(b)

    return BountyResponse(
        id=b.id,
        poster_id=b.poster_id,
        poster_name=current_user.full_name,
        title=b.title,
        description=b.description,
        region=b.region,
        reward_amount=b.reward_amount,
        status=b.status,
        deadline=b.deadline,
        submissions_count=0,
        created_at=b.created_at,
    )


@router.post("/{bounty_id}/submissions", response_model=BountySubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_solution(
    bounty_id: int,
    req: BountySubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submits an invention as a proposed solution to an open community bounty."""
    bounty = db.query(Bounty).filter(Bounty.id == bounty_id, Bounty.is_deleted == False).first()
    if not bounty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bounty not found")

    inv = db.query(Invention).filter(Invention.id == req.invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    submission = BountySubmission(
        bounty_id=bounty_id,
        invention_id=req.invention_id,
        innovator_id=current_user.id,
        note=req.note,
        status="SUBMITTED",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return BountySubmissionResponse(
        id=submission.id,
        bounty_id=submission.bounty_id,
        invention_id=submission.invention_id,
        invention_title=inv.title,
        innovator_id=submission.innovator_id,
        innovator_name=current_user.full_name,
        note=submission.note,
        status=submission.status,
        created_at=submission.created_at,
    )
