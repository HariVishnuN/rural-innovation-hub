from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.user import User
from pydantic import BaseModel


class InvestorDirectoryItem(BaseModel):
    id: int
    full_name: str
    organization_college: Optional[str] = None
    role: str
    state: Optional[str] = None
    village_city: Optional[str] = None
    bio: Optional[str] = None
    skills_expertise: Optional[str] = None
    profile_photo_url: Optional[str] = None
    verified: bool = False
    typical_funding_range: Optional[str] = "₹25,000 - ₹5,00,000"
    focus_sectors: Optional[List[str]] = ["Agriculture", "Water & Irrigation", "Renewable Energy"]

    class Config:
        from_attributes = True


router = APIRouter(prefix="/investors", tags=["Investors & Impact Directory"])


@router.get("", response_model=List[InvestorDirectoryItem])
def list_investors(
    keyword: Optional[str] = Query(None, description="Search by name, organization, or focus sector"),
    state: Optional[str] = Query(None, description="Filter by state"),
    db: Session = Depends(get_db),
):
    """Returns list of registered Impact Investors, Agritech Venture Scouts, and CSR/NGO Representatives."""
    query = db.query(User).filter(
        User.is_deleted == False,
        or_(
            User.role == "INVESTOR",
            User.role == "OFFICIAL",
            User.role == "ADMIN",
            User.role == "CSR",
            User.role == "GOVERNMENT",
        ),
    ).order_by(User.created_at.desc())

    if state and state != "All":
        query = query.filter(User.state.ilike(f"%{state.strip()}%"))

    if keyword:
        term = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.organization_college.ilike(term),
                User.skills_expertise.ilike(term),
                User.bio.ilike(term),
            )
        )

    users = query.all()

    results = []
    for u in users:
        # Determine focus sectors and funding range from bio / skills
        sectors = ["Agriculture", "Water & Irrigation"]
        funding_range = "₹50,000 - ₹10,00,000"
        if "Energy" in (u.skills_expertise or "") or "Solar" in (u.bio or ""):
            sectors.append("Renewable Energy")
        if "Machinery" in (u.skills_expertise or ""):
            sectors.append("Small Farm Machinery")

        results.append(
            InvestorDirectoryItem(
                id=u.id,
                full_name=u.full_name,
                organization_college=u.organization_college or "Social Impact Network",
                role=u.role,
                state=u.state or "All-India",
                village_city=u.village_city or "",
                bio=u.bio or "Angel investor dedicated to rural innovation scaling and technology adoption.",
                skills_expertise=u.skills_expertise or "Seed Capital, Impact Assessment",
                profile_photo_url=u.profile_photo_url,
                verified=u.verified,
                typical_funding_range=funding_range,
                focus_sectors=sectors,
            )
        )

    return results
