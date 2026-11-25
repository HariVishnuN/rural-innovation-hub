from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.patent import PatentApplication
from app.schemas.patent import (
    PatentPackageInfo,
    PatentApplyRequest,
    PatentApplicationResponse,
)
from app.core.permissions import get_current_user

router = APIRouter(prefix="/patents", tags=["Patent & IP Services"])

PATENT_PACKAGES = [
    PatentPackageInfo(
        package_type="PROVISIONAL",
        title="Provisional Patent Specification",
        tagline="12-Month Global Priority Protection at Grassroots Cost",
        fee_inr=4999.00,
        turnaround_days="3-5 Business Days",
        features=[
            "Official Form 1 & Form 2 Drafting with Certified Patent Agent",
            "Secures Indian Patent Office (IPO) Filing Date & Priority Number",
            "Enables 'Patent Pending' label on all machines & prototypes",
            "12-month window to commercialize before complete specification",
            "Cryptographic SHA-256 timestamped proof of invention provenance",
        ],
        best_for="Innovators testing early prototypes in villages before committing to complete patent filing.",
    ),
    PatentPackageInfo(
        package_type="UTILITY",
        title="Complete Utility Patent (Non-Provisional)",
        tagline="Full 20-Year Exclusive Commercial & Manufacturing Rights",
        fee_inr=14999.00,
        turnaround_days="10-14 Business Days",
        features=[
            "Exhaustive 10+ Claims Formulation covering mechanical design & process",
            "High-Precision CAD Schematics complying with Indian Patent Rules 2003",
            "Prior-Art Novelty Clearance Search across global patent databases",
            "Response to First Examination Report (FER) by registered patent attorney",
            "20-year legal monopoly protection across all Indian states",
        ],
        best_for="Market-ready machines seeking manufacturing licenses, corporate buyouts, or bank venture debt.",
    ),
    PatentPackageInfo(
        package_type="DESIGN",
        title="Industrial Design Registration",
        tagline="Aesthetic, Ergonomic & Exterior Shape Protection",
        fee_inr=8999.00,
        turnaround_days="5-7 Business Days",
        features=[
            "6-View Isometric CAD Drawings (Front, Top, Side, Perspective)",
            "Protects unique physical form factor against counterfeit duplication",
            "Fast-track examination under National Design Rules",
            "10-year term renewable for an additional 5 years (15 years total)",
            "Affordable shield against local workshop knockoffs",
        ],
        best_for="Unique physical farm implements, ergonomic hand-tools, and distinctive machinery frames.",
    ),
]


@router.get("/packages", response_model=List[PatentPackageInfo])
def get_patent_packages():
    """Returns available patent service packages and fee structure."""
    return PATENT_PACKAGES


@router.post("/apply", response_model=PatentApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_for_patent(
    req: PatentApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submits a formal patent application request for an innovator's grassroots invention."""
    inv = db.query(Invention).filter(Invention.id == req.invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found.")

    if inv.creator_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only submit patent applications for innovations you created.",
        )

    # Find matching package
    pkg = next((p for p in PATENT_PACKAGES if p.package_type == req.package_type.upper()), None)
    if not pkg:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid patent package type selected.")

    # Check for existing pending application for this invention and package
    existing = db.query(PatentApplication).filter(
        PatentApplication.invention_id == inv.id,
        PatentApplication.package_type == pkg.package_type,
        PatentApplication.status.in_(["PENDING", "UNDER_REVIEW"]),
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A {pkg.title} application is already active for this invention (Status: {existing.status}).",
        )

    app_record = PatentApplication(
        user_id=current_user.id,
        invention_id=inv.id,
        package_type=pkg.package_type,
        package_name=pkg.title,
        fee_inr=Decimal(str(pkg.fee_inr)),
        status="UNDER_REVIEW",
        application_number=f"IN/2026/{inv.id:04d}/{pkg.package_type[:3]}",
        sha256_provenance_hash=inv.sha256_hash or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        applicant_name=req.applicant_name.strip() or current_user.full_name,
        applicant_state=req.applicant_state.strip() or inv.region,
        applicant_phone=req.applicant_phone or current_user.phone,
        notes=req.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    return PatentApplicationResponse(
        id=app_record.id,
        user_id=app_record.user_id,
        invention_id=app_record.invention_id,
        invention_title=inv.title,
        invention_category=inv.category,
        invention_image_url=inv.image_url,
        package_type=app_record.package_type,
        package_name=app_record.package_name,
        fee_inr=float(app_record.fee_inr),
        status=app_record.status,
        application_number=app_record.application_number,
        sha256_provenance_hash=app_record.sha256_provenance_hash,
        applicant_name=app_record.applicant_name,
        applicant_state=app_record.applicant_state,
        applicant_phone=app_record.applicant_phone,
        notes=app_record.notes,
        created_at=app_record.created_at,
        updated_at=app_record.updated_at,
    )


@router.get("/my-applications", response_model=List[PatentApplicationResponse])
def get_my_patent_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all patent applications filed by the authenticated user."""
    apps = (
        db.query(PatentApplication)
        .filter(PatentApplication.user_id == current_user.id)
        .order_by(PatentApplication.created_at.desc())
        .all()
    )

    results = []
    for a in apps:
        inv = db.query(Invention).filter(Invention.id == a.invention_id).first()
        results.append(
            PatentApplicationResponse(
                id=a.id,
                user_id=a.user_id,
                invention_id=a.invention_id,
                invention_title=inv.title if inv else "Grassroots Invention",
                invention_category=inv.category if inv else None,
                invention_image_url=inv.image_url if inv else None,
                package_type=a.package_type,
                package_name=a.package_name,
                fee_inr=float(a.fee_inr),
                status=a.status,
                application_number=a.application_number,
                sha256_provenance_hash=a.sha256_provenance_hash,
                applicant_name=a.applicant_name,
                applicant_state=a.applicant_state,
                applicant_phone=a.applicant_phone,
                notes=a.notes,
                created_at=a.created_at,
                updated_at=a.updated_at,
            )
        )
    return results
