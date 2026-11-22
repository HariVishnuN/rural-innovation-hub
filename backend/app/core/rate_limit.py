import time
from collections import defaultdict
from fastapi import HTTPException, Request, status
from app.core.config import settings

# Thread-safe in-memory sliding window rate limiter
_request_records = defaultdict(list)


def check_rate_limit(request: Request, max_requests: int = None, window_seconds: int = 60):
    """
    Validates that a client IP has not exceeded the allowed request threshold.
    """
    if max_requests is None:
        max_requests = settings.RATE_LIMIT_PER_MINUTE

    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window_start = now - window_seconds

    # Clean old requests
    _request_records[client_ip] = [t for t in _request_records[client_ip] if t > window_start]

    if len(_request_records[client_ip]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {max_requests} requests per minute.",
        )

    _request_records[client_ip].append(now)
