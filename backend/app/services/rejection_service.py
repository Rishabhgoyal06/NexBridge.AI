import json
from typing import Dict, List, Optional
from pydantic import BaseModel
from app.llm import call_gemini_structured
from app.models import (
    RejectionReport, MissingSkillDetail, FocusArea, LearningWeek
)

class GeneratedReport(BaseModel):
    primary_reason: str
    summary: str
    severity: str # 'minor' | 'moderate' | 'major'
    missing_skills: List[dict]
    focus_areas: List[dict]
    learning_timeline: List[dict]

async def generate_rejection_report(
    application_id: str,
    role_title: str,
    company_name: str,
    stage: str,
    profile_skills: List[str],
    required_skills: List[str],
    days_until_next_round: int = 21,
    recommended_mentor_id: str = "mentor_1"
) -> RejectionReport:
    """
    Generates dynamic AI Rejection Growth Report:
    Input: profile + role requirements + days until next hiring round.
    Output: summary, comparison, severity, focus areas, week-by-week timeline
    with real, verifiable resources.
    """
    weeks_remaining = max(1, round(days_until_next_round / 7))
    missing = [s for s in required_skills if s.lower() not in [p.lower() for p in profile_skills]]
    if not missing:
        missing = ["Low-Latency Edge Case Optimization", "Kernel Telemetry under Saturation"]

    fallback_data = {
        "primary_reason": f"Demonstrated deep proficiency in core systems, but fell short on deep hands-on expertise in {missing[0]} under extreme production workloads.",
        "summary": f"Your architectural fundamentals were exceptional. However, {company_name}'s {role_title} role requires deep specialized execution in {', '.join(missing[:2])}. With {weeks_remaining} weeks until our next intake round, focused practical execution will position you as a prime contender.",
        "severity": "moderate" if len(missing) <= 2 else "major",
        "missing_skills": [
            {
                "skill": m,
                "gapDescription": f"Need proven production experience handling concurrency and failure scenarios in {m}.",
                "severity": "moderate",
                "recommendedResource": f"Official documentation and practical GitHub demo project for {m}"
            }
            for m in missing[:3]
        ],
        "focus_areas": [
            {
                "title": f"{missing[0]} Deep Dive",
                "description": f"Master high-throughput concurrency models and latency profiling.",
                "benchmark": "Deploy a working open-source implementation with benchmarks"
            },
            {
                "title": "System Resiliency & Quorum",
                "description": "Handle asymmetric network partitions and split-brain recovery.",
                "benchmark": "Pass automated chaos tests inducing packet drops"
            }
        ],
        "learning_timeline": [
            {
                "week": 1,
                "title": f"Foundations & Architecture in {missing[0]}",
                "focus": "Core primitives and memory semantics",
                "tasks": [
                    f"Study official reference specifications for {missing[0]}",
                    "Build a minimal working prototype measuring baseline round-trip latency",
                    "Inspect system call overhead and CPU context-switching"
                ],
                "status": "current"
            },
            {
                "week": 2,
                "title": "Stress-Testing & Ring Buffers",
                "focus": "Throughput maximization and zero-copy pipelines",
                "tasks": [
                    "Implement ring buffers for asynchronous event emission",
                    "Benchmark pipeline under 500k simulated requests/second",
                    "Profile memory allocations using valgrind/perf"
                ],
                "status": "upcoming"
            },
            {
                "week": min(weeks_remaining, 3),
                "title": "Mock Architectural Defense & Reapplication",
                "focus": "Executive review and re-submission",
                "tasks": [
                    "Schedule a 45-minute architectural review with an advisor",
                    "Publish repository demo with reproducible benchmarks on GitHub",
                    f"Submit re-application package directly to {company_name}"
                ],
                "status": "upcoming"
            }
        ]
    }

    prompt = (
        f"Generate a rigorous, empathetic Rejection Growth Report for candidate applying to {role_title} at {company_name}.\n"
        f"Candidate Skills: {', '.join(profile_skills)}\n"
        f"Required Skills: {', '.join(required_skills)}\n"
        f"Missing Skills: {', '.join(missing)}\n"
        f"Days Remaining Until Next Intake: {days_until_next_round} days ({weeks_remaining} weeks).\n"
        f"Requirements: Output strictly JSON with primary_reason, summary, severity ('minor'|'moderate'|'major'), "
        f"missing_skills, focus_areas, and a {weeks_remaining}-week learning_timeline. "
        f"All resource suggestions must be real well-known sources or generic items like 'official docs' or 'build a small project' (do not invent URLs)."
    )

    try:
        report_data: GeneratedReport = await call_gemini_structured(
            prompt=prompt,
            pydantic_cls=GeneratedReport,
            inputs={"company": company_name, "missing": missing, "weeks": weeks_remaining},
            fallback_data=fallback_data,
            timeout_seconds=20.0
        )
        data = report_data.model_dump()
    except Exception:
        data = fallback_data

    # Map to RejectionReport model
    missing_items = [
        MissingSkillDetail(
            skill=ms.get("skill", "Core Skill"),
            gap_description=ms.get("gapDescription", ms.get("gap_description", "Requires hands-on production depth")),
            severity=ms.get("severity", "moderate"),
            recommended_resource=ms.get("recommendedResource", ms.get("recommended_resource", "Official Documentation"))
        )
        for ms in data.get("missing_skills", fallback_data["missing_skills"])
    ]

    focus_items = [
        FocusArea(
            title=fa.get("title", "Focus Area"),
            description=fa.get("description", "Targeted technical advancement"),
            benchmark=fa.get("benchmark", "Working code repository")
        )
        for fa in data.get("focus_areas", fallback_data["focus_areas"])
    ]

    timeline_items = [
        LearningWeek(
            week=lw.get("week", 1),
            title=lw.get("title", f"Week {lw.get('week', 1)} Mastery"),
            focus=lw.get("focus", "Foundational execution"),
            tasks=lw.get("tasks", ["Read documentation", "Build demo"]),
            status="current" if lw.get("week", 1) == 1 else "upcoming"
        )
        for lw in data.get("learning_timeline", fallback_data["learning_timeline"])
    ]

    return RejectionReport(
        id=f"rep_{application_id}",
        application_id=application_id,
        role_title=role_title,
        company_name=company_name,
        stage=stage,
        decision_date="2026-10-15",
        primary_reason=data.get("primary_reason", fallback_data["primary_reason"]),
        summary=data.get("summary", fallback_data["summary"]),
        severity=data.get("severity", "moderate"),
        missing_skills=missing_items,
        focus_areas=focus_items,
        target_re_evaluation_date="2026-11-07",
        weeks_remaining=weeks_remaining,
        learning_timeline=timeline_items,
        recommended_mentor_id=recommended_mentor_id
    )
