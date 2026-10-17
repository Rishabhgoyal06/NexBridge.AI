import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import UserClaims, get_current_user_claims
from app.models import User, LoginRequest, SignUpRequest, AuthResponse, SwitchRoleRequest
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
from app.db import fetch_one, execute

router = APIRouter(prefix="", tags=["Auth"])

admin_headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

anon_headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
}

@router.post("/auth/signup", response_model=AuthResponse)
async def signup(payload: SignUpRequest):
    """
    Creates a new user account with Supabase Auth, confirms email,
    syncs profile, and returns authenticated session token.
    """
    email = payload.email.strip().lower()
    password = payload.password
    role = payload.role
    name = (payload.name or email.split("@")[0].replace(".", " ").title()).strip()

    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    async with httpx.AsyncClient() as client:
        # 1. Create user in Supabase Auth via Admin API
        create_res = await client.post(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers=admin_headers,
            json={
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"role": role, "name": name}
            }
        )

        if create_res.status_code not in (200, 201):
            err_data = create_res.json() if create_res.headers.get("content-type", "").startswith("application/json") else {}
            msg = err_data.get("msg") or err_data.get("message") or "Registration failed."
            if "already registered" in msg.lower() or "unique constraint" in msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please sign in instead."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to create account: {msg}"
            )

        user_data = create_res.json()
        user_id = user_data["id"]

        # 2. Authenticate to obtain real access token
        login_res = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=anon_headers,
            json={"email": email, "password": password}
        )

        if login_res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account created but initial session generation failed. Please sign in."
            )

        token_data = login_res.json()
        access_token = token_data["access_token"]

        # 3. Ensure profile is present in DB
        headline = (
            "Seed Founder • Building on NexBridge" if role == "founder"
            else "Staff Distributed Systems Architect • Open to Roles" if role == "talent"
            else "Angel Investor & Product Advisor • Vance Advisory"
        )
        avatar = (
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" if role == "founder"
            else "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" if role == "talent"
            else "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
        )

        try:
            await execute("""
                INSERT INTO public.profiles (id, email, name, role, headline, avatar)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    updated_at = now();
            """, user_id, email, name, role, headline, avatar)
        except Exception as e:
            print(f"Profile upsert note: {e}")

        user = User(
            id=str(user_id),
            name=name,
            email=email,
            role=role,
            headline=headline,
            avatar=avatar
        )

        return AuthResponse(
            user=user,
            access_token=access_token,
            token_type="bearer"
        )

@router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    """
    Authenticates email and password against Supabase Auth.
    Strictly enforces valid credentials and returns real JWT access token.
    """
    email = payload.email.strip().lower()
    password = payload.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    async with httpx.AsyncClient() as client:
        # Request password token grant from Supabase Auth
        token_res = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=anon_headers,
            json={"email": email, "password": password}
        )

        # If email not confirmed, auto-confirm via admin and retry
        if token_res.status_code == 400:
            err_data = token_res.json()
            if err_data.get("error_code") == "email_not_confirmed":
                # Find user ID and confirm email
                users_res = await client.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=admin_headers)
                users = [u for u in users_res.json().get("users", []) if u["email"] == email]
                if users:
                    uid = users[0]["id"]
                    await client.put(f"{SUPABASE_URL}/auth/v1/admin/users/{uid}", headers=admin_headers, json={"email_confirm": True})
                    # Retry login
                    token_res = await client.post(
                        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                        headers=anon_headers,
                        json={"email": email, "password": password}
                    )

        if token_res.status_code != 200:
            err_data = token_res.json() if token_res.headers.get("content-type", "").startswith("application/json") else {}
            msg = err_data.get("msg") or err_data.get("error_description") or "Invalid login credentials."
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )

        token_data = token_res.json()
        access_token = token_data["access_token"]
        user_obj = token_data.get("user", {})
        user_id = user_obj.get("id")

        # Fetch profile from DB
        profile = await fetch_one("SELECT id, email, name, role, headline, avatar, company FROM public.profiles WHERE id::text = $1 OR email = $2", user_id, email)
        
        user_meta = user_obj.get("user_metadata", {})
        user_role = payload.role or (profile["role"] if profile else user_meta.get("role", "founder"))
        user_name = (profile["name"] if profile else user_meta.get("name", email.split("@")[0].replace(".", " ").title()))

        headline = (profile.get("headline") if profile and profile.get("headline") else
            "Seed Founder • Building NutriFit AI" if user_role == "founder"
            else "Staff Distributed Systems Architect • Open to Roles" if user_role == "talent"
            else "Angel Investor & Product Advisor • Vance Advisory"
        )
        avatar = (profile.get("avatar") if profile and profile.get("avatar") else
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" if user_role == "founder"
            else "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" if user_role == "talent"
            else "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
        )

        # Update role if explicitly requested on login
        if payload.role and profile and profile["role"] != payload.role:
            try:
                await execute("UPDATE public.profiles SET role = $1, updated_at = now() WHERE id = $2", payload.role, profile["id"])
                user_role = payload.role
            except Exception as e:
                print(f"Role update note: {e}")

        user = User(
            id=str(user_id or (profile["id"] if profile else "unknown")),
            name=user_name,
            email=email,
            role=user_role,
            headline=headline,
            avatar=avatar,
            company=profile.get("company") if profile else None
        )

        return AuthResponse(
            user=user,
            access_token=access_token,
            token_type="bearer"
        )

@router.get("/auth/me", response_model=User)
async def get_me(claims: UserClaims = Depends(get_current_user_claims)):
    """Returns currently authenticated user profile; requires valid Bearer token."""
    profile = await fetch_one("SELECT id, email, name, role, headline, avatar, company FROM public.profiles WHERE id::text = $1 OR email = $2", claims.user_id, claims.email)
    if profile:
        return User(
            id=str(profile["id"]),
            name=profile["name"],
            email=profile["email"],
            role=profile["role"],
            headline=profile.get("headline") or "Executive Leader",
            avatar=profile.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            company=profile.get("company")
        )

    return User(
        id=claims.user_id,
        name=claims.email.split("@")[0].replace(".", " ").title(),
        email=claims.email,
        role=claims.role,
        headline="Seed Founder • Building on NexBridge",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    )

@router.post("/auth/switch-role", response_model=User)
async def switch_role(payload: SwitchRoleRequest, claims: UserClaims = Depends(get_current_user_claims)):
    """Switches active workspace role for authenticated user."""
    new_role = payload.role
    await execute("UPDATE public.profiles SET role = $1, updated_at = now() WHERE id::text = $2 OR email = $3", new_role, claims.user_id, claims.email)
    
    profile = await fetch_one("SELECT id, email, name, role, headline, avatar, company FROM public.profiles WHERE id::text = $1 OR email = $2", claims.user_id, claims.email)
    headline = (
        "Seed Founder • Building on NexBridge" if new_role == "founder"
        else "Staff Distributed Systems Architect • Open to Roles" if new_role == "talent"
        else "Angel Investor & Product Advisor • Vance Advisory"
    )
    if profile:
        return User(
            id=str(profile["id"]),
            name=profile["name"],
            email=profile["email"],
            role=new_role,
            headline=profile.get("headline") or headline,
            avatar=profile.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            company=profile.get("company")
        )

    return User(
        id=claims.user_id,
        name=claims.email.split("@")[0].replace(".", " ").title(),
        email=claims.email,
        role=new_role,
        headline=headline,
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    )
