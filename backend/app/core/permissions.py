import enum
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.session import get_db

security_scheme = HTTPBearer(auto_error=False)


class UserRole(str, enum.Enum):
    INNOVATOR = "INNOVATOR"
    INVESTOR = "INVESTOR"
    MENTOR = "MENTOR"
    ADMIN = "ADMIN"


def get_current_user_optional(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    if not auth_header:
        return None

    token = auth_header.credentials
    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    # Import User model lazily to avoid circular imports
    from app.models.user import User

    user = db.query(User).filter(User.id == int(user_id), User.is_deleted == False).first()
    return user


def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    user = get_current_user_optional(auth_header=auth_header, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or user inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in [r.value for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


require_admin = require_role([UserRole.ADMIN])
require_innovator_or_admin = require_role([UserRole.INNOVATOR, UserRole.ADMIN])
require_investor_or_admin = require_role([UserRole.INVESTOR, UserRole.ADMIN])
require_mentor_or_admin = require_role([UserRole.MENTOR, UserRole.ADMIN])
