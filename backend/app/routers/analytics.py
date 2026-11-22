from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.admin_analytics import ImpactSummaryResponse, AnalyticsOverviewResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & ESG Impact"])


@router.get("/summary", response_model=ImpactSummaryResponse)
def get_impact_summary(db: Session = Depends(get_db)):
    """Returns high-level platform impact counters (inventions, replications, CO2, water)."""
    return AnalyticsService.get_impact_summary(db)


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Returns comprehensive analytics for the analytics dashboard with Recharts data."""
    return AnalyticsService.get_full_analytics(db)
