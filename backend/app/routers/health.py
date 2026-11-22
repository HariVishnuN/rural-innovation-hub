import os
import platform
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter(tags=["Health & Diagnostics"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Liveness probe verifying MySQL database connectivity and uptime."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {e}"

    return {
        "status": "online",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "rural-innovation-hub-api",
    }


@router.get("/metrics")
def system_metrics():
    """Basic diagnostic runtime metrics for memory, CPU, and disk usage."""
    try:
        import psutil
        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=0.1)
        return {
            "cpu_usage_pct": cpu,
            "memory_total_mb": round(mem.total / (1024 * 1024), 2),
            "memory_used_mb": round(mem.used / (1024 * 1024), 2),
            "memory_percent": mem.percent,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception:
        return {
            "status": "operational",
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "timestamp": datetime.utcnow().isoformat(),
        }
