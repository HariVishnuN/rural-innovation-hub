from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.invention import Invention
from app.models.audit import AuditLog
from app.models.feature_flag import FeatureFlag
from app.schemas.invention import InventionResponse
from app.schemas.admin_analytics import (
    ModerationActionRequest,
    FieldTestUpdateRequest,
    AuditLogResponse,
    FeatureFlagResponse,
    FeatureFlagUpdate,
)
from app.services.moderation_service import ModerationService
from app.services.invention_service import InventionService
from app.services.outbox_service import OutboxService
from app.core.permissions import require_admin

router = APIRouter(prefix="/admin", tags=["Admin & Moderation"])


@router.get("/moderation", response_model=List[InventionResponse])
def get_moderation_queue(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Returns all pending inventions awaiting moderator review."""
    return InventionService.get_inventions(db, status="PENDING", limit=100)


@router.post("/inventions/{invention_id}/approve", response_model=InventionResponse)
def approve_invention(
    invention_id: int,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Approves an invention, creates audit log entry, and dispatches outbox event."""
    client_ip = request.client.host if request.client else None
    ModerationService.approve_invention(db, current_admin.id, invention_id, client_ip)
    # Process outbox events
    OutboxService.process_pending_events(db)
    return InventionService.get_invention_detail(db, invention_id)


@router.post("/inventions/{invention_id}/reject", response_model=InventionResponse)
def reject_invention(
    invention_id: int,
    req: ModerationActionRequest,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Rejects an invention with a mandatory explanation reason."""
    client_ip = request.client.host if request.client else None
    ModerationService.reject_invention(db, current_admin.id, invention_id, req.reason or "Does not meet open hardware criteria", client_ip)
    return InventionService.get_invention_detail(db, invention_id)


@router.patch("/inventions/{invention_id}/field-tested", response_model=InventionResponse)
def update_field_tested_status(
    invention_id: int,
    req: FieldTestUpdateRequest,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Verifies that an invention has completed field testing."""
    client_ip = request.client.host if request.client else None
    ModerationService.update_field_tested(db, current_admin.id, invention_id, req.field_tested, client_ip)
    return InventionService.get_invention_detail(db, invention_id)


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Returns audit log trail for governance and moderation compliance."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        admin_user = db.query(User).filter(User.id == l.admin_id).first() if l.admin_id else None
        results.append(
            AuditLogResponse(
                id=l.id,
                admin_id=l.admin_id,
                admin_name=admin_user.full_name if admin_user else "System",
                entity_type=l.entity_type,
                entity_id=l.entity_id,
                action=l.action,
                prior_state=l.prior_state,
                new_state=l.new_state,
                reason=l.reason,
                ip_address=l.ip_address,
                created_at=l.created_at,
            )
        )
    return results


@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
def list_feature_flags(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Lists system feature flags."""
    flags = db.query(FeatureFlag).all()
    return [FeatureFlagResponse.model_validate(f) for f in flags]


@router.patch("/feature-flags/{flag_name}", response_model=FeatureFlagResponse)
def update_feature_flag(
    flag_name: str,
    req: FeatureFlagUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Toggles or updates a feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.name == flag_name).first()
    if not flag:
        flag = FeatureFlag(name=flag_name, enabled=req.enabled, description=f"Flag for {flag_name}")
        db.add(flag)
    else:
        flag.enabled = req.enabled
        flag.updated_by_id = current_admin.id

    db.commit()
    db.refresh(flag)
    return FeatureFlagResponse.model_validate(flag)
