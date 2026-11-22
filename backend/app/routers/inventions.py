from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.review import ReviewRating
from app.models.replication import Replication
from app.models.telemetry import TelemetryLog
from app.schemas.invention import (
    InventionCreate,
    InventionUpdate,
    InventionResponse,
    InventionDetailResponse,
    InventionLikeResponse,
    CommentCreate,
    CommentResponse,
    ScalingStageUpdate,
    ReviewCreate,
    ReviewResponse,
    SimilarityCheckRequest,
    SimilarityCheckResponse,
    MaterialOptimizeRequest,
    MaterialOptimizeResponse,
    InventionCertificateResponse,
)
from app.schemas.engagement import ReplicationCreate, ReplicationResponse
from app.schemas.collaboration import TelemetryLogCreate, TelemetryLogResponse
from app.services.invention_service import InventionService
from app.core.permissions import get_current_user, get_current_user_optional

router = APIRouter(prefix="/inventions", tags=["Inventions & Innovations"])


@router.get("/featured", response_model=List[InventionResponse])
def get_featured_inventions(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Returns top approved inventions for the landing showcase."""
    user_id = current_user.id if current_user else None
    return InventionService.get_inventions(db, status="APPROVED", sort_by="popular", current_user_id=user_id, limit=6)


@router.get("", response_model=List[InventionResponse])
def list_inventions(
    keyword: Optional[str] = Query(None, description="Search in title or description"),
    category: Optional[str] = Query(None, description="Category filter"),
    region: Optional[str] = Query(None, description="State / Region filter"),
    max_cost: Optional[float] = Query(None, description="Maximum budget in INR"),
    sort_by: Optional[str] = Query("newest", description="newest, cost_asc, cost_desc, popular, field_tested"),
    skip: int = 0,
    limit: int = 50,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Discovery search across approved grassroots innovations."""
    user_id = current_user.id if current_user else None
    return InventionService.get_inventions(
        db,
        keyword=keyword,
        category=category,
        region=region,
        max_cost=max_cost,
        sort_by=sort_by,
        status="APPROVED",
        current_user_id=user_id,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=InventionResponse, status_code=status.HTTP_201_CREATED)
def create_invention(
    req: InventionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submits a new grassroots invention, computing SHA-256 fingerprint & safety score."""
    try:
        inv = InventionService.create_invention(db, current_user.id, req)
        detail = InventionService.get_invention_detail(db, inv.id, current_user_id=current_user.id)
        if not detail:
            raise HTTPException(status_code=404, detail="Invention created but failed to load details.")
        return detail
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to publish invention: {str(exc)}",
        )


@router.get("/{invention_id}", response_model=InventionDetailResponse)
def get_invention_detail(
    invention_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Returns complete details, assembly steps, materials, and reviews for an invention."""
    user_id = current_user.id if current_user else None
    detail = InventionService.get_invention_detail(db, invention_id, current_user_id=user_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")
    return detail


@router.post("/{invention_id}/like", response_model=InventionLikeResponse)
def toggle_invention_like(
    invention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggles like/unlike on an invention for the authenticated user."""
    liked, likes_count = InventionService.toggle_like(db, invention_id, current_user.id)
    return InventionLikeResponse(liked=liked, likes_count=likes_count)


@router.get("/{invention_id}/comments", response_model=List[CommentResponse])
def get_invention_comments(
    invention_id: int,
    db: Session = Depends(get_db),
):
    """Returns all comments for a specific invention."""
    return InventionService.get_comments(db, invention_id)


@router.post("/{invention_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_invention_comment(
    invention_id: int,
    req: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Adds a comment to an invention for the authenticated user."""
    return InventionService.add_comment(db, invention_id, current_user.id, req.comment_text)


@router.patch("/{invention_id}", response_model=InventionResponse)
def update_invention(
    invention_id: int,
    req: InventionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates an invention owned by the caller or admin."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    if inv.creator_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another creator's invention")

    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field == "assembly_steps" and val:
            setattr(inv, field, [s.model_dump() if hasattr(s, "model_dump") else s for s in val])
        else:
            setattr(inv, field, val)

    db.commit()
    db.refresh(inv)
    return InventionService.get_invention_detail(db, inv.id)


@router.delete("/{invention_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invention(
    invention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft deletes an invention."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    if inv.creator_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another creator's invention")

    inv.is_deleted = True
    db.commit()
    return None


@router.post("/similarity-check", response_model=SimilarityCheckResponse)
def similarity_check(req: SimilarityCheckRequest, db: Session = Depends(get_db)):
    """Heuristic rule-based similarity and novelty check."""
    return InventionService.check_similarity(db, req)


@router.post("/material-optimization", response_model=MaterialOptimizeResponse)
def optimize_materials(req: MaterialOptimizeRequest):
    """Heuristic scrap and local materials cost optimizer."""
    return InventionService.optimize_materials(req)


@router.get("/{invention_id}/certificate", response_model=InventionCertificateResponse)
def get_certificate(invention_id: int, db: Session = Depends(get_db)):
    """Returns cryptographic provenance certificate data for print/download."""
    cert = InventionService.generate_certificate(db, invention_id)
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")
    return cert


@router.post("/{invention_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(
    invention_id: int,
    req: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Adds or updates a review rating (1-5) for an invention."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    existing = db.query(ReviewRating).filter(ReviewRating.invention_id == invention_id, ReviewRating.user_id == current_user.id).first()
    if existing:
        existing.rating = req.rating
        existing.comment = req.comment
        db.commit()
        db.refresh(existing)
        return ReviewResponse(
            id=existing.id,
            invention_id=existing.invention_id,
            user_id=existing.user_id,
            user_name=current_user.full_name,
            rating=existing.rating,
            comment=existing.comment,
            created_at=existing.created_at,
        )

    review = ReviewRating(
        invention_id=invention_id,
        user_id=current_user.id,
        rating=req.rating,
        comment=req.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        invention_id=review.invention_id,
        user_id=review.user_id,
        user_name=current_user.full_name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )


@router.post("/{invention_id}/replications", response_model=ReplicationResponse, status_code=status.HTTP_201_CREATED)
def record_replication(
    invention_id: int,
    req: ReplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Records a builder replication of this open-hardware blueprint in a new region."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

    rep = Replication(
        invention_id=invention_id,
        builder_id=current_user.id,
        location=req.location,
        state=req.state,
        photo_url=req.photo_url,
        notes=req.notes,
        build_cost=req.build_cost or inv.total_cost,
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)

    return ReplicationResponse(
        id=rep.id,
        invention_id=rep.invention_id,
        invention_title=inv.title,
        builder_id=rep.builder_id,
        builder_name=current_user.full_name,
        location=rep.location,
        state=rep.state,
        photo_url=rep.photo_url,
        notes=rep.notes,
        build_cost=rep.build_cost,
        created_at=rep.created_at,
    )


@router.get("/{invention_id}/telemetry", response_model=List[TelemetryLogResponse])
def get_telemetry_logs(invention_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Returns real-world sensor/telemetry readings for field-tested machines."""
    logs = (
        db.query(TelemetryLog)
        .filter(TelemetryLog.invention_id == invention_id)
        .order_by(TelemetryLog.recorded_at.desc())
        .limit(limit)
        .all()
    )
    return [
        TelemetryLogResponse(
            id=log.id,
            invention_id=log.invention_id,
            power_watts=float(log.power_watts),
            runtime_hours=float(log.runtime_hours),
            efficiency_percentage=float(log.efficiency_percentage),
            ambient_temp_c=float(log.ambient_temp_c) if log.ambient_temp_c else None,
            recorded_at=log.recorded_at,
        )
        for log in logs
    ]


@router.post("/{invention_id}/telemetry", response_model=TelemetryLogResponse, status_code=status.HTTP_201_CREATED)
def record_telemetry(
    invention_id: int,
    req: TelemetryLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ingests power, runtime, and efficiency telemetry from IoT logger or maker."""
    log = TelemetryLog(
        invention_id=invention_id,
        power_watts=req.power_watts,
        runtime_hours=req.runtime_hours,
        efficiency_percentage=req.efficiency_percentage,
        ambient_temp_c=req.ambient_temp_c,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return TelemetryLogResponse(
        id=log.id,
        invention_id=log.invention_id,
        power_watts=float(log.power_watts),
        runtime_hours=float(log.runtime_hours),
        efficiency_percentage=float(log.efficiency_percentage),
        ambient_temp_c=float(log.ambient_temp_c) if log.ambient_temp_c else None,
        recorded_at=log.recorded_at,
    )


@router.patch("/{invention_id}/scaling-stage", response_model=InventionResponse)
def update_scaling_stage(
    invention_id: int,
    req: ScalingStageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows Officials, Admins, or Inventors to advance an invention's validation & market-readiness stage."""
    inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invention not found.")

    inv.scaling_stage = req.scaling_stage
    if req.scaling_stage in ["FIELD_TESTED", "MARKET_READY"]:
        inv.field_tested = True

    db.commit()
    db.refresh(inv)
    return InventionService.get_invention_detail(db, invention_id)
