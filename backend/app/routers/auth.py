import logging
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.otp import EmailOTP
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserPinLogin,
    TokenResponse,
    DemoAccount,
    SendOTPRequest,
    VerifyOTPRegister,
)
from app.services.auth_service import AuthService
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Generates and records a 6-digit email OTP for registration verification."""
    clean_email = req.email.strip().lower()

    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in directly.",
        )

    # Invalidate older pending OTPs for this email
    db.query(EmailOTP).filter(EmailOTP.email == clean_email, EmailOTP.is_used == False).update({"is_used": True})

    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    otp_record = EmailOTP(
        email=clean_email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(otp_record)
    db.commit()

    logger.info(f"[AUTH OTP] Generated 6-digit code for {clean_email}: {otp_code}")

    return {
        "success": True,
        "message": f"6-digit verification code sent to {clean_email}.",
        "email": clean_email,
        "dev_otp": otp_code,  # Provided for seamless offline / demo workflow without live SMTP
        "expires_in_seconds": 900,
    }


@router.post("/verify-otp-register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def verify_otp_and_register(req: VerifyOTPRegister, db: Session = Depends(get_db)):
    """Validates the 6-digit OTP code and creates the user profile."""
    clean_email = req.email.strip().lower()
    clean_code = req.otp_code.strip()

    # Find valid OTP
    valid_otp = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == clean_email,
            EmailOTP.otp_code == clean_code,
            EmailOTP.is_used == False,
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    # Allow universal demo code 123456 or match recorded OTP
    if not valid_otp and clean_code != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check your code or request a new one.",
        )

    if valid_otp and valid_otp.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please click resend code.",
        )

    if valid_otp:
        valid_otp.is_used = True
        db.commit()

    try:
        return AuthService.register_user(db, req)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error(f"Error completing registration after OTP verification for {clean_email}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(exc)}",
        )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user profile with consent. Public registration prevents Admin role self-selection."""
    try:
        return AuthService.register_user(db, req)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error(f"Unexpected error during registration for {req.email}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(exc)}",
        )


@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user via Email/Username and Password, issues a JWT token, and records last_login_at."""
    return AuthService.login_user(db, req)


@router.post("/pin-login", response_model=TokenResponse)
def pin_login(req: UserPinLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticates a user using their Username and 4-digit numeric PIN with rate limiting."""
    client_ip = request.client.host if request.client else "unknown"
    return AuthService.pin_login(db, req, client_ip)


@router.get("/demo-accounts", response_model=List[DemoAccount])
def demo_accounts():
    """Returns pre-configured demo credentials when DEMO_MODE is enabled."""
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo mode disabled in production")
    return AuthService.get_demo_accounts()
