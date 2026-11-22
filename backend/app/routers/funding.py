from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.pledge import FundingPledge
from app.schemas.engagement import PledgeCreate, PledgeResponse
from app.core.permissions import get_current_user_optional

router = APIRouter(prefix="/inventions/{invention_id}/pledges", tags=["Funding & Spare Parts Pledges"])


@router.get("", response_model=List[PledgeResponse])
def list_pledges(invention_id: int, db: Session = Depends(get_db)):
    """Lists all financial and parts pledges for an invention."""
    pledges = (
        db.query(FundingPledge)
        .filter(FundingPledge.invention_id == invention_id)
        .order_by(FundingPledge.created_at.desc())
        .all()
    )
    return [PledgeResponse.model_validate(p) for p in pledges]


@router.post("", response_model=PledgeResponse, status_code=status.HTTP_201_CREATED)
def create_pledge(
    invention_id: int,
    req: PledgeCreate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Pledges funding or donated spare parts to help build or scale an innovation."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    donor_name = current_user.full_name if current_user else (req.donor_name or "Anonymous Supporter")
    donor_email = current_user.email if current_user else req.donor_email
    donor_id = current_user.id if current_user else None

    pledge = FundingPledge(
        invention_id=invention_id,
        donor_id=donor_id,
        donor_name=donor_name,
        donor_email=donor_email,
        pledge_type=req.pledge_type,
        amount=req.amount,
        spare_part_details=req.spare_part_details,
        notes=req.notes,
        status="PLEDGED",
    )
    db.add(pledge)
    db.commit()
    db.refresh(pledge)

    return PledgeResponse.model_validate(pledge)
