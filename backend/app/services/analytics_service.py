from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.invention import Invention
from app.models.user import User
from app.models.replication import Replication
from app.models.pledge import FundingPledge
from app.models.bounty import Bounty
from app.models.workshop import Workshop
from app.schemas.admin_analytics import (
    ImpactSummaryResponse,
    CategoryDistributionItem,
    StateDistributionItem,
    AnalyticsOverviewResponse,
)


class AnalyticsService:
    @staticmethod
    def get_impact_summary(db: Session) -> ImpactSummaryResponse:
        total_inventions = db.query(func.count(Invention.id)).filter(Invention.is_deleted == False).scalar() or 0
        approved_inventions = (
            db.query(func.count(Invention.id))
            .filter(Invention.is_deleted == False, Invention.moderation_status == "APPROVED")
            .scalar()
            or 0
        )
        total_innovators = db.query(func.count(User.id)).filter(User.role == "INNOVATOR", User.is_deleted == False).scalar() or 0
        total_replications = db.query(func.count(Replication.id)).scalar() or 0

        total_pledged = (
            db.query(func.sum(FundingPledge.amount))
            .filter(FundingPledge.status != "CANCELLED")
            .scalar()
            or Decimal("0.00")
        )

        total_co2 = (
            db.query(func.sum(Invention.estimated_co2_savings_kg))
            .filter(Invention.is_deleted == False, Invention.moderation_status == "APPROVED")
            .scalar()
            or Decimal("0.00")
        )

        total_water = (
            db.query(func.sum(Invention.estimated_water_savings_liters))
            .filter(Invention.is_deleted == False, Invention.moderation_status == "APPROVED")
            .scalar()
            or Decimal("0.00")
        )

        total_workshops = db.query(func.count(Workshop.id)).filter(Workshop.is_deleted == False).scalar() or 0
        total_bounties = db.query(func.count(Bounty.id)).filter(Bounty.is_deleted == False).scalar() or 0

        return ImpactSummaryResponse(
            total_inventions=total_inventions,
            approved_inventions=approved_inventions,
            total_innovators=total_innovators,
            total_replications=total_replications,
            total_funding_pledged=total_pledged,
            total_co2_saved_kg=total_co2,
            total_water_saved_liters=total_water,
            total_workshops=total_workshops,
            total_bounties=total_bounties,
        )

    @staticmethod
    def get_full_analytics(db: Session) -> AnalyticsOverviewResponse:
        summary = AnalyticsService.get_impact_summary(db)

        # Category distribution
        cat_counts = (
            db.query(Invention.category, func.count(Invention.id))
            .filter(Invention.is_deleted == False, Invention.moderation_status == "APPROVED")
            .group_by(Invention.category)
            .all()
        )

        total_cat = sum(c[1] for c in cat_counts) or 1
        categories = [
            CategoryDistributionItem(
                category=c[0],
                count=c[1],
                percentage=round((c[1] / total_cat) * 100, 1),
            )
            for c in cat_counts
        ]

        # State distribution
        state_invs = (
            db.query(Invention.region, func.count(Invention.id))
            .filter(Invention.is_deleted == False, Invention.moderation_status == "APPROVED")
            .group_by(Invention.region)
            .all()
        )
        inv_map = {s[0]: s[1] for s in state_invs}

        state_reps = (
            db.query(Replication.state, func.count(Replication.id))
            .group_by(Replication.state)
            .all()
        )
        rep_map = {s[0]: s[1] for s in state_reps}

        all_states = set(list(inv_map.keys()) + list(rep_map.keys()))
        state_distribution = [
            StateDistributionItem(
                state=st,
                inventions_count=inv_map.get(st, 0),
                replications_count=rep_map.get(st, 0),
            )
            for st in sorted(all_states)
            if st
        ]

        # Recent replications
        recent_reps = (
            db.query(Replication)
            .order_by(Replication.created_at.desc())
            .limit(5)
            .all()
        )
        reps_data = []
        for r in recent_reps:
            inv = db.query(Invention).filter(Invention.id == r.invention_id).first()
            builder = db.query(User).filter(User.id == r.builder_id).first()
            reps_data.append({
                "id": r.id,
                "invention_title": inv.title if inv else "Invention",
                "builder_name": builder.full_name if builder else "Maker",
                "location": r.location,
                "state": r.state,
                "build_cost": float(r.build_cost),
                "created_at": r.created_at.isoformat(),
            })

        esg_summary = {
            "estimated_co2_offset_tonnes": float(summary.total_co2_saved_kg / 1000),
            "estimated_water_saved_kiloliters": float(summary.total_water_saved_liters / 1000),
            "rural_capital_saved_estimate_inr": float(summary.total_replications * 15000),
            "open_hardware_diffusion_index": round((summary.total_replications / max(1, summary.approved_inventions)) * 10, 2),
        }

        return AnalyticsOverviewResponse(
            impact_summary=summary,
            categories=categories,
            state_distribution=state_distribution,
            recent_replications=reps_data,
            esg_summary=esg_summary,
        )
