import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.outbox import EventOutbox
from app.models.mentorship import MentorshipRequest
from app.models.user import User

logger = logging.getLogger(__name__)


class OutboxService:
    @staticmethod
    def process_pending_events(db: Session, max_batch: int = 10) -> int:
        """
        Polls and processes pending outbox events (e.g., auto mentor matching upon approval).
        Can be triggered via background task, cron, or post-commit hook.
        """
        events = (
            db.query(EventOutbox)
            .filter(EventOutbox.status == "PENDING")
            .order_by(EventOutbox.created_at.asc())
            .limit(max_batch)
            .all()
        )

        processed_count = 0
        for ev in events:
            try:
                if ev.event_type == "INVENTION_APPROVED":
                    # Heuristic mentor matching
                    payload = ev.payload
                    inv_id = payload.get("invention_id")
                    inv_cat = payload.get("category", "")
                    creator_id = payload.get("creator_id")

                    # Find eligible mentors
                    mentors = db.query(User).filter(User.role == "MENTOR", User.is_deleted == False).all()
                    for mentor in mentors:
                        skills = (mentor.skills_expertise or "").lower()
                        match = 75
                        if any(term in skills for term in ["patent", "design", "agriculture", "mechanics"]):
                            match += 15

                        # Create recommended mentorship request if match is high
                        if match >= 85:
                            existing = (
                                db.query(MentorshipRequest)
                                .filter(
                                    MentorshipRequest.invention_id == inv_id,
                                    MentorshipRequest.mentor_id == mentor.id,
                                )
                                .first()
                            )
                            if not existing:
                                req = MentorshipRequest(
                                    invention_id=inv_id,
                                    innovator_id=creator_id,
                                    mentor_id=mentor.id,
                                    match_score=match,
                                    notes=f"Automated match based on category '{inv_cat}' and expertise '{mentor.skills_expertise}'.",
                                    status="PENDING",
                                    created_at=datetime.utcnow(),
                                )
                                db.add(req)

                ev.status = "PROCESSED"
                ev.processed_at = datetime.utcnow()
                processed_count += 1
            except Exception as e:
                logger.error(f"Error processing outbox event {ev.id}: {e}")
                ev.status = "FAILED"
                ev.retry_count = (ev.retry_count or 0) + 1
                ev.last_error = str(e)

        db.commit()
        return processed_count
