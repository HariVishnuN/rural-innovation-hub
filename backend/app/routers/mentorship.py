from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.mentorship import MentorshipRequest
from app.schemas.collaboration import (
    MentorshipRequestCreate,
    MentorshipRequestUpdate,
    MentorshipRequestResponse,
    MentorMatchResponse,
)
from app.core.permissions import get_current_user

router = APIRouter(prefix="/mentorship", tags=["Mentorship & Expert Guidance"])


@router.get("/matches", response_model=List[MentorMatchResponse])
def get_recommended_mentors(
    invention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Heuristic mentor matching algorithm scoring mentors based on engineering & domain alignment."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    mentors = db.query(User).filter(User.role == "MENTOR", User.is_deleted == False).all()
    results = []

    cat_lower = inv.category.lower()

    for m in mentors:
        skills = (m.skills_expertise or "").lower()
        score = 70
        reasons = []

        if "agriculture" in cat_lower and ("agri" in skills or "farm" in skills):
            score += 20
            reasons.append("High domain alignment with Agricultural engineering.")
        if "water" in cat_lower and ("irrigation" in skills or "fluid" in skills or "pump" in skills):
            score += 20
            reasons.append("Fluid dynamics and drip irrigation expertise match.")
        if "patent" in skills or "ip" in skills:
            score += 10
            reasons.append("Experienced in grassroots IP protection & prior art.")
        if "mechanical" in skills:
            score += 10
            reasons.append("Strong mechanical fabrication & kinematics background.")

        score = min(98, score)
        if not reasons:
            reasons.append("General rural product development & scaling guidance.")

        results.append(
            MentorMatchResponse(
                mentor_id=m.id,
                full_name=m.full_name,
                skills_expertise=m.skills_expertise,
                organization=m.organization_college,
                match_score=score,
                matching_reasons=reasons,
            )
        )

    results.sort(key=lambda x: x.match_score, reverse=True)
    return results


@router.get("/requests", response_model=List[MentorshipRequestResponse])
def list_my_mentorship_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists requests involving the caller (as innovator or mentor)."""
    if current_user.role == "MENTOR":
        reqs = db.query(MentorshipRequest).filter(MentorshipRequest.mentor_id == current_user.id).all()
    else:
        reqs = db.query(MentorshipRequest).filter(MentorshipRequest.innovator_id == current_user.id).all()

    results = []
    for r in reqs:
        inv = db.query(Invention).filter(Invention.id == r.invention_id).first()
        innovator = db.query(User).filter(User.id == r.innovator_id).first()
        mentor = db.query(User).filter(User.id == r.mentor_id).first()
        results.append(
            MentorshipRequestResponse(
                id=r.id,
                invention_id=r.invention_id,
                invention_title=inv.title if inv else "Invention",
                innovator_id=r.innovator_id,
                innovator_name=innovator.full_name if innovator else "Innovator",
                mentor_id=r.mentor_id,
                mentor_name=mentor.full_name if mentor else "Mentor",
                match_score=r.match_score,
                notes=r.notes,
                status=r.status,
                created_at=r.created_at,
            )
        )
    return results


@router.post("/requests", response_model=MentorshipRequestResponse, status_code=status.HTTP_201_CREATED)
def request_mentorship(
    req: MentorshipRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sends a mentorship inquiry from an innovator to an expert."""
    inv = db.query(Invention).filter(Invention.id == req.invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    mentor = db.query(User).filter(User.id == req.mentor_id, User.role == "MENTOR").first()
    if not mentor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")

    m_req = MentorshipRequest(
        invention_id=req.invention_id,
        innovator_id=current_user.id,
        mentor_id=req.mentor_id,
        match_score=85,
        notes=req.notes,
        status="PENDING",
    )
    db.add(m_req)
    db.commit()
    db.refresh(m_req)

    return MentorshipRequestResponse(
        id=m_req.id,
        invention_id=m_req.invention_id,
        invention_title=inv.title,
        innovator_id=m_req.innovator_id,
        innovator_name=current_user.full_name,
        mentor_id=m_req.mentor_id,
        mentor_name=mentor.full_name,
        match_score=m_req.match_score,
        notes=m_req.notes,
        status=m_req.status,
        created_at=m_req.created_at,
    )


@router.patch("/requests/{request_id}", response_model=MentorshipRequestResponse)
def update_mentorship_status(
    request_id: int,
    req: MentorshipRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accepts or declines a mentorship request."""
    m_req = db.query(MentorshipRequest).filter(MentorshipRequest.id == request_id).first()
    if not m_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentorship request not found")

    if m_req.mentor_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the assigned mentor can update status")

    m_req.status = req.status
    db.commit()
    db.refresh(m_req)

    inv = db.query(Invention).filter(Invention.id == m_req.invention_id).first()
    innovator = db.query(User).filter(User.id == m_req.innovator_id).first()
    mentor = db.query(User).filter(User.id == m_req.mentor_id).first()

    return MentorshipRequestResponse(
        id=m_req.id,
        invention_id=m_req.invention_id,
        invention_title=inv.title if inv else "Invention",
        innovator_id=m_req.innovator_id,
        innovator_name=innovator.full_name if innovator else "Innovator",
        mentor_id=m_req.mentor_id,
        mentor_name=mentor.full_name if mentor else "Mentor",
        match_score=m_req.match_score,
        notes=m_req.notes,
        status=m_req.status,
        created_at=m_req.created_at,
    )
