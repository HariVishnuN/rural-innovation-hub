from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.permissions import UserRole
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserPinLogin, UserResponse, TokenResponse, DemoAccount

# In-memory sliding window rate limiter for 4-digit PIN attempts (max 5 failed attempts per 5 minutes)
_FAILED_PIN_ATTEMPTS: Dict[str, List[datetime]] = {}


def _check_pin_rate_limit(key: str) -> None:
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=5)
    attempts = [t for t in _FAILED_PIN_ATTEMPTS.get(key, []) if t > cutoff]
    _FAILED_PIN_ATTEMPTS[key] = attempts
    if len(attempts) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed PIN attempts. Please wait 5 minutes or sign in with your Email & Password.",
        )


def _record_failed_pin_attempt(key: str) -> None:
    now = datetime.utcnow()
    attempts = _FAILED_PIN_ATTEMPTS.get(key, [])
    attempts.append(now)
    _FAILED_PIN_ATTEMPTS[key] = attempts


def _clear_failed_pin_attempts(key: str) -> None:
    if key in _FAILED_PIN_ATTEMPTS:
        _FAILED_PIN_ATTEMPTS.pop(key, None)


class AuthService:
    @staticmethod
    def register_user(db: Session, req: UserRegister) -> TokenResponse:
        # Prevent self-selection of ADMIN role
        requested_role = req.role.strip().upper()
        if requested_role == UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin role cannot be self-selected during registration. Contact system administration.",
            )

        if requested_role in ["OFFICIAL", "OFFICIALS", "GOVERNMENT", "COMPANY"]:
            requested_role = UserRole.INVESTOR.value
        elif requested_role not in [UserRole.INNOVATOR.value, UserRole.INVESTOR.value, UserRole.MENTOR.value]:
            requested_role = UserRole.INNOVATOR.value

        norm_email = req.email.strip().lower()
        norm_username = req.username.strip().lower()
        clean_pin = req.pin.strip()

        if not clean_pin.isdigit() or len(clean_pin) != 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quick PIN must be strictly 4 numeric digits (0000-9999).",
            )

        existing_email = db.query(User).filter(User.email == norm_email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

        existing_username = db.query(User).filter(User.username == norm_username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken.",
            )

        phone_val = req.phone or req.phone_number
        village_val = req.village_city or req.village_or_city
        skills_val = req.skills_expertise or req.skills_or_expertise
        consent_val = req.consent_given if req.consent_given is not None else (req.consent_accepted if req.consent_accepted is not None else True)

        user = User(
            full_name=req.full_name.strip(),
            username=norm_username,
            email=norm_email,
            password_hash=get_password_hash(req.password),
            pin_hash=get_password_hash(clean_pin),
            role=requested_role,
            phone=phone_val,
            village_city=village_val,
            district=req.district,
            state=req.state,
            pincode=req.pincode,
            preferred_language=req.preferred_language or "English",
            bio=req.bio,
            skills_expertise=skills_val,
            organization_college=req.organization_college,
            consent_given=consent_val,
            consent_timestamp=datetime.utcnow(),
            created_at=datetime.utcnow(),
            last_login_at=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def login_user(db: Session, req: UserLogin) -> TokenResponse:
        identifier = req.email.strip().lower()
        # Allow searching by email or username
        user = db.query(User).filter(
            or_(User.email == identifier, User.username == identifier),
            User.is_deleted == False
        ).first()

        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please try again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)

        token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def pin_login(db: Session, req: UserPinLogin, client_ip: str = "unknown") -> TokenResponse:
        norm_username = req.username.strip().lower()
        clean_pin = req.pin.strip()

        rate_key = f"{norm_username}:{client_ip}"
        _check_pin_rate_limit(rate_key)

        if not clean_pin.isdigit() or len(clean_pin) != 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quick PIN must be strictly 4 numeric digits.",
            )

        # Match either username or registered email
        user = db.query(User).filter(
            or_(User.username == norm_username, User.email == norm_username),
            User.is_deleted == False
        ).first()

        if not user or not user.pin_hash or not verify_password(clean_pin, user.pin_hash):
            _record_failed_pin_attempt(rate_key)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or 4-digit PIN. Please try again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Success: clear failed rate limiting attempts
        _clear_failed_pin_attempts(rate_key)

        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)

        token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def get_demo_accounts() -> List[DemoAccount]:
        return [
            DemoAccount(
                role="INNOVATOR",
                name="HARI VISHNU N (Innovator)",
                username="hxrivxnu",
                pin="1234",
                email="nharivishnu31072008@gmail.com",
                password="Password@123",
                description="Grassroots Innovator & Platform User showcasing agricultural hardware.",
                profile_photo_url="/images/avatars/harivishnu.jpg",
            ),
            DemoAccount(
                role="INNOVATOR",
                name="Ramesh Patel (Grassroots Maker)",
                username="ramesh",
                pin="1234",
                email="ramesh@ruralhub.org",
                password="Innovator@123",
                description="Farmer and rural innovator from Gujarat. Has created low-cost drip irrigation and pedal thresher.",
                profile_photo_url="/images/avatars/ramesh.jpg",
            ),
            DemoAccount(
                role="INVESTOR",
                name="Ananya Sengupta (Impact Funder)",
                username="ananya",
                pin="1234",
                email="ananya@ruralhub.org",
                password="Investor@123",
                description="Social impact angel investor funding micro-mechanization and water conservation projects.",
                profile_photo_url="/images/avatars/ananya.jpg",
            ),
            DemoAccount(
                role="MENTOR",
                name="Prof. Rajesh Sharma (Technical Advisor)",
                username="prof.sharma",
                pin="1234",
                email="prof.sharma@ruralhub.org",
                password="Mentor@123",
                description="Professor of Mechanical Engineering, IIT Gandhinagar. Expertise in frugal mechanics & patent strategy.",
                profile_photo_url="/images/avatars/rajesh.jpg",
            ),
            DemoAccount(
                role="ADMIN",
                name="System Administrator (Hub Governance)",
                username="admin",
                pin="1234",
                email="admin@ruralhub.org",
                password="Admin@123",
                description="Platform moderator, verifying field-tests, audit reviews, and feature-flag configurations.",
                profile_photo_url="/images/avatars/admin.jpg",
            ),
        ]
