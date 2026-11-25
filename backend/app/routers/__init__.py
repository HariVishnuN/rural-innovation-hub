from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.inventions import router as inventions_router
from app.routers.messages import router as messages_router
from app.routers.bounties import router as bounties_router
from app.routers.funding import router as funding_router
from app.routers.workshops import router as workshops_router
from app.routers.mentorship import router as mentorship_router
from app.routers.analytics import router as analytics_router
from app.routers.admin import router as admin_router
from app.routers.health import router as health_router
from app.routers.websocket import router as websocket_router
from app.routers.collaboration import router as collaboration_router
from app.routers.commercial_offers import router as commercial_offers_router
from app.routers.upload import router as upload_router
from app.routers.investors import router as investors_router
from app.routers.pitches import router as pitches_router
from app.routers.officials import router as officials_router
from app.routers.patents import router as patents_router

__all__ = [
    "auth_router",
    "users_router",
    "inventions_router",
    "messages_router",
    "bounties_router",
    "funding_router",
    "workshops_router",
    "mentorship_router",
    "analytics_router",
    "admin_router",
    "health_router",
    "websocket_router",
    "collaboration_router",
    "commercial_offers_router",
    "upload_router",
    "investors_router",
    "pitches_router",
    "officials_router",
    "patents_router",
]
