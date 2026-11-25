import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.rate_limit import check_rate_limit
from app.db.session import init_db
from app.routers import (
    auth_router,
    users_router,
    inventions_router,
    messages_router,
    bounties_router,
    funding_router,
    workshops_router,
    mentorship_router,
    analytics_router,
    admin_router,
    health_router,
    websocket_router,
    collaboration_router,
    commercial_offers_router,
    upload_router,
    investors_router,
    pitches_router,
    officials_router,
    patents_router,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("rural_innovation_hub")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables on MySQL
    logger.info("Initializing Rural Innovation Hub backend...")
    init_db()

    # Automatically ensure default grassroots inventions exist
    try:
        from app.db.session import SessionLocal
        from app.models.invention import Invention
        with SessionLocal() as db:
            active_count = db.query(Invention).filter(Invention.is_deleted == False).count()
            if active_count == 0:
                logger.info("Database has 0 inventions. Running automatic seed for default reference innovations...")
                from seed import seed_database
                seed_database()
                logger.info("Default grassroots innovations auto-seeded successfully!")
    except Exception as seed_err:
        logger.warning(f"Auto-seed check notice: {seed_err}")

    logger.info("Rural Innovation Hub backend ready to accept traffic.")
    yield
    # Shutdown
    logger.info("Shutting down Rural Innovation Hub backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Rural Innovation Hub: Grassroots open-hardware technology, IP provenance, community bounties, and low-cost prototyping.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware - allow localhost and Vercel frontend origins with credentials
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://rural-innovation-hub-kappa.vercel.app",
    "https://rural-innovation-hub-git-main-nhv4.vercel.app",
]
for origin in settings.cors_origin_list:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Pass through CORS preflight OPTIONS requests without rate-limiting
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path
    if path.endswith("/auth/login") or path.endswith("/auth/register") or path.endswith("/auth/pin-login"):
        try:
            check_rate_limit(request, max_requests=60, window_seconds=60)
        except Exception as exc:
            detail = getattr(exc, "detail", "Too many requests. Please wait a moment.")
            origin = request.headers.get("origin")
            headers = {}
            if origin:
                headers["Access-Control-Allow-Origin"] = origin
                headers["Access-Control-Allow-Credentials"] = "true"
            return JSONResponse(status_code=429, content={"detail": str(detail)}, headers=headers)

    response = await call_next(request)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error for {request.method} {request.url.path}: {exc}", exc_info=True)
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected server error occurred: {str(exc)}"},
        headers=headers,
    )


# Include Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(inventions_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(bounties_router, prefix="/api")
app.include_router(funding_router, prefix="/api")
app.include_router(workshops_router, prefix="/api")
app.include_router(mentorship_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(collaboration_router, prefix="/api")
app.include_router(commercial_offers_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(investors_router, prefix="/api")
app.include_router(pitches_router, prefix="/api")
app.include_router(officials_router, prefix="/api")
app.include_router(patents_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(websocket_router, prefix="/api")

# Mount uploads directory for static file access
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Also mount health and metrics at root for Docker/K8s probes
app.include_router(health_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Rural Innovation Hub API",
        "documentation": "/docs",
        "status": "active",
        "version": settings.VERSION,
    }