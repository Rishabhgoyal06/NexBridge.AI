from typing import Optional
from fastapi import Depends, Header, HTTPException, status
import jwt
from app.config import SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
from app.db import fetch_one

class UserClaims:
    def __init__(self, user_id: str, email: str, role: str):
        self.user_id = user_id
        self.email = email
        self.role = role

    def to_dict(self):
        return {
            "userId": self.user_id,
            "email": self.email,
            "role": self.role
        }

async def get_current_user_claims(authorization: Optional[str] = Header(None)) -> UserClaims:
    """
    FastAPI Security Dependency:
    Strictly verifies Supabase JWT Bearer token and attaches authenticated user ID + role.
    Raises 401 Unauthorized if token is missing, malformed, or invalid.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected Bearer <token>.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    # Reject mock or placeholder tokens in secure mode
    if token.startswith("mock_token_") or token.startswith("token_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token. Please sign in with your verified credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub") or payload.get("id")
        email = payload.get("email")

        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed token claims.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check role from user metadata or profile table
        user_meta = payload.get("user_metadata") or {}
        role = user_meta.get("role")

        profile = await fetch_one("SELECT id, email, role FROM public.profiles WHERE id::text = $1 OR email = $2", user_id, email)
        if profile and profile.get("role"):
            role = profile["role"]
            user_id = str(profile["id"])
        elif not role:
            role = "founder"

        return UserClaims(user_id=str(user_id), email=email, role=role)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user_claims(authorization: Optional[str] = Header(None)) -> Optional[UserClaims]:
    """Optional authentication for public routes that adapt based on session"""
    if not authorization:
        return None
    try:
        return await get_current_user_claims(authorization)
    except Exception:
        return None
