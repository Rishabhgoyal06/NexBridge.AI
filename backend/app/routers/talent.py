import json
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from app.auth import UserClaims, get_current_user_claims
from app.models import (
    TalentProfile, StartupMatch, Application, RejectionReport,
    MissingSkillDetail, FocusArea, LearningWeek, ValidationAgent
)
from app.services.resume_service import parse_and_store_resume
from app.services.matching_service import calculate_match
from app.services.rejection_service import generate_rejection_report
from app.db import fetch_all, fetch_one

router = APIRouter(prefix="", tags=["Talent"])

@router.get("/talent/profile", response_model=TalentProfile)
async def get_talent_profile(claims: UserClaims = Depends(get_current_user_claims)):
    """Returns talent profile with extracted skills and resume metadata for the authenticated user"""
    r = await fetch_one("SELECT * FROM public.talent_profiles WHERE user_id::text = $1 ORDER BY parsed_at DESC NULLS LAST LIMIT 1", str(claims.user_id))
    if not r:
        r = await fetch_one("SELECT * FROM public.talent_profiles WHERE email = $1", claims.email)

    if r:
        raw_skills = json.loads(r["skills"]) if isinstance(r["skills"], str) else (r["skills"] or [])
        raw_agents = json.loads(r["agent_evaluations"]) if r.get("agent_evaluations") and isinstance(r["agent_evaluations"], str) else (r.get("agent_evaluations") or [])
        agents_list = [ValidationAgent(**ag) for ag in raw_agents] if raw_agents else []
        return TalentProfile(
            id=r["id"],
            name=r["name"],
            headline=r.get("headline") or "Software Architect",
            bio=r.get("bio") or "",
            location=r.get("location") or "Remote",
            experience_years=r.get("experience_years") or 0,
            skills=raw_skills,
            resume_file_name=r.get("resume_path"),
            parsed_at=str(r.get("parsed_at") or "Just now"),
            agents=agents_list
        )

    # User has not uploaded a resume yet — return their account-linked starter profile
    user_p = await fetch_one("SELECT * FROM public.profiles WHERE id::text = $1", str(claims.user_id))
    u_name = user_p.get("name") or user_p.get("full_name") or claims.email.split("@")[0].replace(".", " ").title() if user_p else claims.email.split("@")[0].replace(".", " ").title()
    return TalentProfile(
        id=f"tal_{claims.user_id[:8]}",
        name=u_name,
        headline="Co-Builder / Candidate • Upload resume to activate matching",
        bio="Upload your resume to extract your verified skills and trigger AI Agent evaluation across our venture network.",
        location="Remote",
        experience_years=0,
        skills=[],
        resume_file_name=None,
        parsed_at=None,
        agents=[]
    )

@router.post("/talent/resume", response_model=TalentProfile)
async def upload_resume(
    resume: UploadFile = File(...),
    claims: UserClaims = Depends(get_current_user_claims)
):
    """Uploads resume to Supabase storage, extracts text, calls LLM, embeds, and stores"""
    file_bytes = await resume.read()
    filename = resume.filename or "resume.pdf"
    updated_profile = await parse_and_store_resume(file_bytes, filename, claims.user_id)
    return updated_profile

@router.get("/talent/matches", response_model=List[StartupMatch])
async def get_startup_matches(claims: UserClaims = Depends(get_current_user_claims)):
    """Computes algorithmic matches (60% weighted skill overlap + 40% vector similarity)"""
    profile = await get_talent_profile(claims)
    profile_skills = profile.skills

    target_rows = await fetch_all("SELECT * FROM public.targets ORDER BY created_at ASC")
    matches = []

    for t in target_rows:
        req_skills = json.loads(t["required_skills"]) if isinstance(t["required_skills"], str) else (t["required_skills"] or [])
        match_pct, matched, missing = calculate_match(
            candidate_skills=profile_skills,
            required_skills=req_skills
        )

        sal_raw = t.get("salary_range") or "₹28L - ₹42L / yr"
        if "$" in sal_raw:
            sal_raw = sal_raw.replace("$140k - $175k", "₹26L - ₹36L / yr").replace("$160k - $190k", "₹32L - ₹44L / yr").replace("$160k - $200k", "₹35L - ₹48L / yr").replace("$130k - $160k", "₹24L - ₹32L / yr").replace("$180k - $220k", "₹42L - ₹58L / yr").replace("$170k - $210k", "₹38L - ₹52L / yr").replace("$", "₹")

        stage_raw = t.get("stage") or "Seed"
        if "$" in stage_raw:
            stage_raw = stage_raw.replace("$750k", "₹6.2 Cr").replace("$3.2M", "₹26.5 Cr").replace("$1M", "₹8.4 Cr").replace("$4.5M", "₹37 Cr").replace("$8M", "₹66 Cr").replace("$", "₹")

        matches.append(StartupMatch(
            id=t["id"].replace("tar_", "match_"),
            startup_name=t["company_name"],
            role=t["role_title"],
            match_percentage=match_pct,
            funding_stage=stage_raw,
            location=t.get("location") or "Remote",
            equity_range=t.get("equity_range") or "1.0% - 2.0%",
            salary_range=sal_raw,
            key_skills_matched=matched,
            missing_skills=missing,
            company_bio=t.get("company_bio") or t.get("description") or "",
            founder_name=t.get("founder_name") or "Founder",
            logo_url=t.get("logo_url")
        ))

    matches.sort(key=lambda x: x.match_percentage, reverse=True)
    return matches

@router.get("/talent/applications", response_model=List[Application])
async def get_applications():
    """Tracks status of submitted applications"""
    rows = await fetch_all("SELECT * FROM public.applications ORDER BY applied_date DESC")
    apps = []
    for r in rows:
        apps.append(Application(
            id=r["id"],
            company_name=r["company_name"],
            role=r["role"],
            applied_date=str(r.get("applied_date") or "2026-10-15"),
            status=r.get("status") or "Under Review",
            match_percentage=r.get("match_percentage") or 85,
            has_report=bool(r.get("has_report")),
            stage_info=r.get("stage_info")
        ))
    return apps

@router.get("/talent/applications/{application_id}/report", response_model=RejectionReport)
async def get_rejection_report(application_id: str):
    """Returns structured rejection growth report with learning timeline"""
    rep_row = await fetch_one("SELECT * FROM public.rejection_reports WHERE application_id = $1", application_id)
    if rep_row:
        raw_missing = json.loads(rep_row["missing_skills"]) if isinstance(rep_row["missing_skills"], str) else (rep_row["missing_skills"] or [])
        missing_skills = [
            MissingSkillDetail(
                skill=ms if isinstance(ms, str) else ms.get("skill", "Core System"),
                gap_description=f"Requires hands-on experience in {ms if isinstance(ms, str) else ms.get('skill')}",
                severity=rep_row.get("severity") or "moderate",
                recommended_resource=f"Official Documentation and Open-Source Reference for {ms if isinstance(ms, str) else ms.get('skill')}"
            ) if isinstance(ms, str) else MissingSkillDetail(
                skill=ms.get("skill", "Core"),
                gap_description=ms.get("gapDescription", ms.get("gap_description", "Requires hands-on depth")),
                severity=ms.get("severity", "moderate"),
                recommended_resource=ms.get("recommendedResource", ms.get("recommended_resource", "Official Documentation"))
            ) for ms in raw_missing
        ]

        raw_focus = json.loads(rep_row["focus_areas"]) if isinstance(rep_row["focus_areas"], str) else (rep_row["focus_areas"] or [])
        focus_areas = [
            FocusArea(
                title=fa.get("name") or fa.get("title", "Focus Area"),
                description=fa.get("rationale") or fa.get("description", "Targeted advancement"),
                benchmark=f"Complete {fa.get('hoursNeeded', 20)} hours hands-on code development"
            ) for fa in raw_focus
        ]

        raw_timeline = json.loads(rep_row["learning_timeline"]) if isinstance(rep_row["learning_timeline"], str) else (rep_row["learning_timeline"] or [])
        timeline = [
            LearningWeek(
                week=lw.get("week", 1),
                title=lw.get("title", "Week Objective"),
                focus=lw.get("focus") or lw.get("title", "Core System Mastery"),
                tasks=lw.get("tasks", []),
                status="current" if lw.get("status") in ("In Progress", "current") else "upcoming"
            ) for lw in raw_timeline
        ]

        return RejectionReport(
            id=rep_row["id"],
            application_id=application_id,
            role_title=rep_row["role_title"],
            company_name=rep_row["company_name"],
            stage=rep_row.get("stage") or "Technical Round",
            decision_date=str(rep_row.get("decision_date") or "2026-10-15"),
            primary_reason=rep_row["primary_reason"],
            summary=rep_row.get("summary") or "",
            severity=rep_row.get("severity") or "moderate",
            missing_skills=missing_skills,
            focus_areas=focus_areas,
            target_re_evaluation_date=str(rep_row.get("reapply_date") or rep_row.get("target_re_evaluation_date") or "2026-11-07"),
            weeks_remaining=rep_row.get("weeks_remaining") or 3,
            learning_timeline=timeline,
            recommended_mentor_id=rep_row.get("recommended_mentor_id") or "mentor_1"
        )

    # Dynamic generation fallback
    app_row = await fetch_one("SELECT * FROM public.applications WHERE id = $1", application_id)
    company = app_row["company_name"] if app_row else "HyperScale Labs"
    role = app_row["role"] if app_row else "Staff Distributed Systems Architect"

    profile = await get_talent_profile(UserClaims("tal_01", "taras@hyperscale.io", "talent"))
    return await generate_rejection_report(
        application_id=application_id,
        role_title=role,
        company_name=company,
        stage="Technical Stage 3",
        profile_skills=profile.skills,
        required_skills=["Linux kernel networking", "eBPF XDP filters", "Raft Consensus"],
        days_until_next_round=21
    )
