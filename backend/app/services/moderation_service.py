from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.invention import Invention
from app.models.audit import AuditLog
from app.models.outbox import EventOutbox
from app.models.notification import Notification
from app.models.user import User


class ModerationService:
    @staticmethod
    def approve_invention(db: Session, admin_id: int, invention_id: int, ip_address: Optional[str] = None) -> Invention:
        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

        prior_state = {
            "moderation_status": inv.moderation_status,
            "rejection_reason": inv.rejection_reason,
            "field_tested": inv.field_tested,
        }

        inv.moderation_status = "APPROVED"
        inv.rejection_reason = None
        inv.updated_at = datetime.utcnow()

        new_state = {
            "moderation_status": "APPROVED",
            "rejection_reason": None,
            "field_tested": inv.field_tested,
        }

        # 1. Audit log entry
        audit = AuditLog(
            admin_id=admin_id,
            entity_type="INVENTION",
            entity_id=inv.id,
            action="APPROVE",
            prior_state=prior_state,
            new_state=new_state,
            reason="Invention verified and approved by hub moderator.",
            ip_address=ip_address,
            created_at=datetime.utcnow(),
        )
        db.add(audit)

        # 2. Transactional outbox event for async notifications and mentor matching
        outbox_event = EventOutbox(
            event_type="INVENTION_APPROVED",
            payload={
                "invention_id": inv.id,
                "title": inv.title,
                "creator_id": inv.creator_id,
                "category": inv.category,
                "region": inv.region,
                "approved_by": admin_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
            status="PENDING",
            retry_count=0,
            created_at=datetime.utcnow(),
        )
        db.add(outbox_event)

        # 3. Notification for creator
        notif = Notification(
            user_id=inv.creator_id,
            type="INVENTION_APPROVED",
            title="Invention Approved! 🎉",
            body=f"Your innovation '{inv.title}' has been approved and is now live in the global discovery catalog.",
            link=f"/inventions/{inv.id}",
            created_at=datetime.utcnow(),
        )
        db.add(notif)

        db.commit()
        db.refresh(inv)
        return inv

    @staticmethod
    def reject_invention(db: Session, admin_id: int, invention_id: int, reason: str, ip_address: Optional[str] = None) -> Invention:
        if not reason or not reason.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rejection reason is required")

        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

        prior_state = {
            "moderation_status": inv.moderation_status,
            "rejection_reason": inv.rejection_reason,
        }

        inv.moderation_status = "REJECTED"
        inv.rejection_reason = reason.strip()
        inv.updated_at = datetime.utcnow()

        new_state = {
            "moderation_status": "REJECTED",
            "rejection_reason": inv.rejection_reason,
        }

        audit = AuditLog(
            admin_id=admin_id,
            entity_type="INVENTION",
            entity_id=inv.id,
            action="REJECT",
            prior_state=prior_state,
            new_state=new_state,
            reason=reason.strip(),
            ip_address=ip_address,
            created_at=datetime.utcnow(),
        )
        db.add(audit)

        notif = Notification(
            user_id=inv.creator_id,
            type="INVENTION_REJECTED",
            title="Invention Needs Revisions",
            body=f"Your invention '{inv.title}' was reviewed: {reason.strip()}. You can edit and resubmit.",
            link=f"/inventions/{inv.id}",
            created_at=datetime.utcnow(),
        )
        db.add(notif)

        db.commit()
        db.refresh(inv)
        return inv

    @staticmethod
    def update_field_tested(db: Session, admin_id: int, invention_id: int, field_tested: bool, ip_address: Optional[str] = None) -> Invention:
        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invention not found")

        prior_state = {"field_tested": inv.field_tested}
        inv.field_tested = field_tested
        inv.updated_at = datetime.utcnow()

        audit = AuditLog(
            admin_id=admin_id,
            entity_type="INVENTION",
            entity_id=inv.id,
            action="FIELD_TEST_VERIFIED" if field_tested else "FIELD_TEST_UNVERIFIED",
            prior_state=prior_state,
            new_state={"field_tested": field_tested},
            reason=f"Field-test verification updated to {field_tested}.",
            ip_address=ip_address,
            created_at=datetime.utcnow(),
        )
        db.add(audit)

        db.commit()
        db.refresh(inv)
        return inv
