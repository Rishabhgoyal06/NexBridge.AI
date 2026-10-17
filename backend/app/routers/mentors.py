import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from app.models import (
    Mentor, MentorRequest, RequestSessionPayload, UpdateMentorStatusPayload
)
from app.db import fetch_all, fetch_one, execute

router = APIRouter(prefix="", tags=["Mentors"])

@router.get("/mentors", response_model=List[Mentor])
async def list_mentors(
    query: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    """Searches mentors and advisors filtered by domain or keywords"""
    rows = await fetch_all("SELECT * FROM public.mentors ORDER BY rating DESC")
    mentors = []

    for r in rows:
        raw_domains = json.loads(r["domains"]) if isinstance(r["domains"], str) else (r["domains"] or [])
        raw_exits = json.loads(r["past_exits"]) if isinstance(r["past_exits"], str) else (r["past_exits"] or [])
        raw_slots = json.loads(r["available_slots"]) if isinstance(r["available_slots"], str) else (r["available_slots"] or [])

        # Filter domain
        if domain and domain.lower() != "all":
            if not any(domain.lower() in d.lower() for d in raw_domains):
                continue

        # Filter query
        if query and query.strip():
            q = query.strip().lower()
            name_match = q in r["name"].lower()
            title_match = q in r["title"].lower()
            comp_match = q in (r.get("company") or "").lower()
            dom_match = any(q in d.lower() for d in raw_domains)
            if not (name_match or title_match or comp_match or dom_match):
                continue

        mentors.append(Mentor(
            id=r["id"],
            name=r["name"],
            avatar=r.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            title=r["title"],
            company=r.get("company") or "Vance Advisory",
            bio=r.get("bio") or "",
            rating=float(r.get("rating") or 5.0),
            reviews_count=r.get("reviews_count") or 30,
            hourly_rate=r.get("hourly_rate") or 250,
            domains=raw_domains,
            past_exits=raw_exits,
            availability=r.get("availability") or "Tomorrow at 2:00 PM EST",
            available_slots=raw_slots
        ))

    return mentors

@router.get("/mentors/{mentor_id}", response_model=Mentor)
async def get_mentor(mentor_id: str):
    """Returns detailed mentor profile"""
    r = await fetch_one("SELECT * FROM public.mentors WHERE id = $1", mentor_id)
    if not r:
        raise HTTPException(status_code=404, detail="Mentor not found")

    raw_domains = json.loads(r["domains"]) if isinstance(r["domains"], str) else (r["domains"] or [])
    raw_exits = json.loads(r["past_exits"]) if isinstance(r["past_exits"], str) else (r["past_exits"] or [])
    raw_slots = json.loads(r["available_slots"]) if isinstance(r["available_slots"], str) else (r["available_slots"] or [])

    return Mentor(
        id=r["id"],
        name=r["name"],
        avatar=r.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        title=r["title"],
        company=r.get("company") or "Vance Advisory",
        bio=r.get("bio") or "",
        rating=float(r.get("rating") or 5.0),
        reviews_count=r.get("reviews_count") or 30,
        hourly_rate=r.get("hourly_rate") or 250,
        domains=raw_domains,
        past_exits=raw_exits,
        availability=r.get("availability") or "Tomorrow at 2:00 PM EST",
        available_slots=raw_slots
    )

@router.post("/mentors/request", response_model=MentorRequest)
async def request_session(payload: RequestSessionPayload):
    """Submits advisory session booking request to mentor"""
    req_id = f"req_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now().isoformat()

    mentor = await fetch_one("SELECT name, avatar FROM public.mentors WHERE id = $1", payload.mentor_id)
    m_name = mentor["name"] if mentor else "Advisor"
    m_avatar = mentor.get("avatar") or "" if mentor else ""

    try:
        await execute("""
            INSERT INTO public.mentor_requests (
                id, mentor_id, mentor_name, mentor_avatar, founder_name,
                startup_name, topic, message, proposed_time, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', now());
        """, req_id, payload.mentor_id, m_name, m_avatar, payload.founder_name, payload.startup_name, payload.topic, payload.message, payload.proposed_time)
    except Exception as e:
        print(f"Notice on mentor request insert: {e}")

    return MentorRequest(
        id=req_id,
        mentor_id=payload.mentor_id,
        mentor_name=m_name,
        mentor_avatar=m_avatar,
        founder_name=payload.founder_name or "Aarav Patel",
        startup_name=payload.startup_name or "NutriFit AI",
        topic=payload.topic,
        message=payload.message,
        proposed_time=payload.proposed_time,
        status="pending",
        created_at=now_iso
    )

@router.get("/mentors/requests/all", response_model=List[MentorRequest])
async def get_all_requests():
    """Lists all advisory consultation requests"""
    rows = await fetch_all("SELECT * FROM public.mentor_requests ORDER BY created_at DESC")
    reqs = []
    for r in rows:
        reqs.append(MentorRequest(
            id=r["id"],
            mentor_id=r["mentor_id"],
            mentor_name=r.get("mentor_name") or "Marcus Vance",
            mentor_avatar=r.get("mentor_avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            founder_name=r.get("founder_name") or "Aarav Patel",
            startup_name=r.get("startup_name") or "NutriFit AI",
            topic=r["topic"],
            message=r["message"],
            proposed_time=r["proposed_time"],
            status=r.get("status") or "pending",
            created_at=str(r.get("created_at") or "Just now")
        ))
    return reqs

@router.patch("/mentors/requests/{request_id}/status", response_model=List[MentorRequest])
async def update_request_status(request_id: str, payload: UpdateMentorStatusPayload):
    """Updates advisory request status and returns refreshed list"""
    await execute("UPDATE public.mentor_requests SET status = $1 WHERE id = $2", payload.status, request_id)
    return await get_all_requests()
