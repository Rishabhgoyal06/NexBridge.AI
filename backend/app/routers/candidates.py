import json
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from app.models import Candidate, CandidateSkill
from app.db import fetch_all, fetch_one

router = APIRouter(prefix="", tags=["Candidates"])

@router.get("/candidates", response_model=List[Candidate])
async def list_candidates(roleId: Optional[str] = Query(None)):
    """Retrieves candidates matching venture job roles"""
    rows = await fetch_all("SELECT * FROM public.talent_profiles ORDER BY experience_years DESC")
    candidates = []
    
    role_mapping = {
        "tal_01": "role_1",
        "tal_02": "role_1",
        "tal_03": "role_2",
        "tal_04": "role_3",
        "tal_05": "role_1"
    }

    for r in rows:
        assigned_role = role_mapping.get(r["id"], "role_1")
        if roleId and assigned_role != roleId:
            continue

        raw_skills = json.loads(r["skills"]) if isinstance(r["skills"], str) else (r["skills"] or [])
        skills = [
            CandidateSkill(name=s["name"], matched=s.get("matched", True)) if isinstance(s, dict)
            else CandidateSkill(name=str(s), matched=True)
            for s in raw_skills
        ]

        candidates.append(Candidate(
            id=r["id"],
            name=r["name"],
            avatar=r.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            role=r.get("headline") or "Software Architect",
            match_score=94 if r["id"] == "tal_02" else 88 if r["id"] == "tal_03" else 82,
            experience_years=r.get("experience_years") or 6,
            location=r.get("location") or "Remote",
            current_company="Tech Labs",
            skills=skills,
            bio=r.get("bio") or "",
            github=f"https://github.com/{r['name'].lower().replace(' ', '')}",
            linkedin=f"https://linkedin.com/in/{r['name'].lower().replace(' ', '')}",
            outreach_status="none",
            applied_job_role_id=assigned_role
        ))

    return candidates

@router.get("/candidates/{candidate_id}", response_model=Candidate)
async def get_candidate(candidate_id: str):
    """Returns candidate profile details"""
    r = await fetch_one("SELECT * FROM public.talent_profiles WHERE id = $1", candidate_id)
    if not r:
        raise HTTPException(status_code=404, detail="Candidate not found")

    raw_skills = json.loads(r["skills"]) if isinstance(r["skills"], str) else (r["skills"] or [])
    skills = [
        CandidateSkill(name=s["name"], matched=s.get("matched", True)) if isinstance(s, dict)
        else CandidateSkill(name=str(s), matched=True)
        for s in raw_skills
    ]

    return Candidate(
        id=r["id"],
        name=r["name"],
        avatar=r.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        role=r.get("headline") or "Software Architect",
        match_score=94 if r["id"] == "tal_02" else 88,
        experience_years=r.get("experience_years") or 6,
        location=r.get("location") or "Remote",
        current_company="Tech Labs",
        skills=skills,
        bio=r.get("bio") or "",
        github=f"https://github.com/{r['name'].lower().replace(' ', '')}",
        linkedin=f"https://linkedin.com/in/{r['name'].lower().replace(' ', '')}",
        outreach_status="none",
        applied_job_role_id="role_1"
    )
