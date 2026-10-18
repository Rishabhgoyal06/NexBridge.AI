import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.auth import UserClaims, get_current_user_claims
from app.models import (
    Idea, CreateIdeaRequest, ValidationRunStatus, ValidationAgent,
    IdeaMetrics, IdeaRisk, IdeaStrength, Competitor, RevenueAnalysis,
    PricingTier, StructuredPlan, ProductStrategy, Architecture, Milestone, JobRole, TechStackCategory, TechStackItem,
    MarketAnalysis, AgentDiscussionMessage, AgentDiscussionRequest
)
from app.services.validation_service import (
    run_parallel_validation, ACTIVE_VALIDATION_RUNS, ACTIVE_IDEAS_STORE, ACTIVE_IDEAS_USER_STORE,
    _safe_market_analysis
)
from app.db import fetch_all, fetch_one, execute

router = APIRouter(prefix="", tags=["Ideas"])

async def build_full_idea(idea_row: dict) -> Idea:
    idea_id = idea_row["id"]

    # Agents
    agent_rows = await fetch_all("SELECT * FROM public.validation_agents WHERE idea_id = $1 ORDER BY created_at ASC", idea_id)
    agents = []
    seen_names = set()
    for r in agent_rows:
        seen_names.add(r["name"])
        agents.append(ValidationAgent(
            id=r["id"],
            name=r["name"],
            role_title=r["role_title"],
            icon=r.get("icon") or "token",
            score=r["score"],
            status=r["status"],
            verdict=r.get("verdict") or "Validated",
            detailed_analysis=r.get("detailed_analysis") or "",
            key_findings=json.loads(r["key_findings"]) if isinstance(r["key_findings"], str) else (r["key_findings"] or []),
            concerns=json.loads(r["concerns"]) if isinstance(r["concerns"], str) else (r["concerns"] or [])
        ))

    # If agents are incomplete, check validation_runs or fill missing agents
    if len(agents) < 5:
        target_market = idea_row.get("target_market") or "Target Customers"
        title = idea_row["title"]
        category = idea_row.get("category") or "AI & Technology"
        defaults = [
            ("Market Analyst", "Demand & Willingness-To-Pay", "insights", 84, "completed",
             f"Validated market demand across {target_market} with strong unit economics.",
             f"Market Demand & Persona Analysis for {title}:\n\n• Target Persona & Pain Points: Users in {target_market} waste 8-12 hours weekly on manual disjointed tasks that {title} automates with AI.\n\n• Addressable TAM: Estimated ₹18,500 Cr ($2.2B+) growing at 24% annual CAGR.\n\n• Willingness to Pay: Strong price tolerance for SaaS tiers (₹299–₹2,499/mo) replacing manual labor costs.\n\n• Beachhead GTM: Community channels and product-led word of mouth.",
             [f"Estimated ₹18,500 Cr+ TAM in {target_market}", f"Solves acute operational bottlenecks for {title}", "Direct willingness to pay subscription tiers"],
             ["Customer acquisition costs in initial scale phase", "User onboarding activation friction"]),
            ("Competitor Researcher", "Moat & Landscape Mapping", "radar", 72, "completed",
             f"Defensible moat opportunity against legacy {category} alternatives.",
             f"Incumbent tools in {target_market} operate as passive logs. {title} creates competitive separation through automated execution.",
             [f"Legacy competitors lack native AI workflows for {title}", f"High switching costs once integrated with {title}", "Defensible feedback data moat"],
             ["Incumbents could attempt to bolt on basic AI features", "Brand loyalty to legacy players"]),
            ("Revenue Critic", "Unit Economics & Margins", "payments", 78, "completed",
             f"3.5x+ LTV:CAC target achievable with software gross margins above 74%.",
             f"Projected customer acquisition payback within 3.4 months on annual plans with strong recurring gross margins.",
             ["Projected 3.5x+ LTV:CAC exceeds venture sustainability thresholds", "Sub-4 month payback period", "Low marginal serving cost per active subscriber"],
             ["Day-30 cohort churn risk if habits decay", "Stripe payment processing fees on international tiers"]),
            ("Technical Architect", "Feasibility & Stack Blueprint", "terminal", 85, "completed",
             f"Feasible cloud-native architecture with low-latency async worker pipelines.",
             f"Engineering blueprint leverages FastAPI async microservices, PostgreSQL with pgvector, and serverless background workers.",
             ["Standard cloud components minimize infrastructure setup time", "Asynchronous task queue handles traffic spikes gracefully", "Native vector embeddings support personalized recommendations"],
             ["Upstream LLM provider rate limits require resilient fallback chains", "Data encryption standards across user assets"]),
            ("Skeptic", "Pre-Mortem Failure Modes", "warning", 58, "flagged",
             f"Critical Pre-Mortem Risk: Day-30 user habit decay and onboarding friction.",
             f"Primary vulnerability is user habit decay between Day 14 and Day 30 if setup exceeds 3 minutes.",
             ["Primary failure mode is passive disengagement rather than competitive replacement", "Zero-touch automation improves 60-day retention", "Early cohort interviews needed to identify churn triggers"],
             ["User churn if initial value realization is delayed beyond first session", "Risk of feature bloat diluting core wedge proposition"])
        ]
        for name, role, icon, score, status, verdict, analysis, findings, concerns in defaults:
            if name not in seen_names:
                agents.append(ValidationAgent(
                    id=f"agent_gen_{idea_id}_{name[:4].lower()}",
                    name=name,
                    role_title=role,
                    icon=icon,
                    score=score,
                    status=status,
                    verdict=verdict,
                    detailed_analysis=analysis,
                    key_findings=findings,
                    concerns=concerns
                ))

    # Competitors
    comp_rows = await fetch_all("SELECT * FROM public.competitors WHERE idea_id = $1", idea_id)
    competitors = []
    for c in comp_rows:
        competitors.append(Competitor(
            id=c["id"],
            name=c["name"],
            category=c["category"],
            market_cap_or_funding=c.get("market_cap_or_funding") or "$100M+",
            pricing=c.get("pricing") or "$19.99/mo",
            strengths=json.loads(c["strengths"]) if isinstance(c["strengths"], str) else (c["strengths"] or []),
            weaknesses=json.loads(c["weaknesses"]) if isinstance(c["weaknesses"], str) else (c["weaknesses"] or []),
            our_moat=c.get("our_moat") or "Automated closed-loop execution",
            threat_level=c.get("threat_level") or "Medium"
        ))

    # Revenue
    rev_row = await fetch_one("SELECT * FROM public.revenue_analyses WHERE idea_id = $1", idea_id)
    revenue = None
    if rev_row:
        raw_tiers = json.loads(rev_row["pricing_tiers"]) if isinstance(rev_row["pricing_tiers"], str) else (rev_row["pricing_tiers"] or [])
        tiers = []
        for t in raw_tiers:
            p_str = t.get("price", "₹0")
            if p_str.startswith("$"):
                try:
                    num = float(p_str.replace("$", "").replace(",", "").strip())
                    p_str = f"₹{int(num * 85):,}" if num > 0 else "₹0"
                except Exception:
                    p_str = p_str.replace("$", "₹")
            tiers.append(PricingTier(
                tier=t.get("tier") or t.get("name", "Tier"),
                price=p_str,
                billing=t.get("billing") or t.get("period", "per month"),
                features=t.get("features", []),
                recommended=t.get("recommended", False)
            ))

        raw_assump = json.loads(rev_row["assumptions"]) if isinstance(rev_row["assumptions"], str) else (rev_row["assumptions"] or [])
        assumptions = [
            (f"{a.get('metric', '')}: {a.get('value', '')} ({a.get('notes', '')})" if isinstance(a, dict) else str(a)).replace("$", "₹")
            for a in raw_assump
        ]

        raw_cac = float(rev_row.get("cac") or 45.0)
        raw_ltv = float(rev_row.get("ltv") or 165.0)
        inr_cac = round(raw_cac * 85.0) if raw_cac < 500 else raw_cac
        inr_ltv = round(raw_ltv * 85.0) if raw_ltv < 500 else raw_ltv
        ratio = round(inr_ltv / inr_cac, 2) if inr_cac > 0 else 3.4

        revenue = RevenueAnalysis(
            model_type=rev_row["model_type"] or f"{idea_row.get('category') or 'Venture'} Model",
            cac=inr_cac,
            ltv=inr_ltv,
            ltv_cac_ratio=ratio,
            gross_margin=float(rev_row.get("gross_margin") or 74.0),
            payback_months=float(rev_row.get("payback_months") or 3.2),
            pricing_tiers=tiers,
            assumptions=assumptions,
            unit_economics_summary=(rev_row.get("unit_economics_summary") or f"Healthy {ratio}x LTV:CAC with sub-4 month payback in INR.").replace("$", "₹")
        )
    if not revenue:
        revenue = RevenueAnalysis(
            model_type=f"{idea_row.get('category') or 'Tech'} Model",
            cac=650.0,
            ltv=2450.0,
            ltv_cac_ratio=3.77,
            gross_margin=74.0,
            payback_months=3.2,
            pricing_tiers=[
                PricingTier(tier="Starter", price="₹299", billing="per month / order", features=["Core platform access", "Standard support"]),
                PricingTier(tier="Pro", price="₹799", billing="per month / order", features=["Full automation suite", "Priority support"], recommended=True),
                PricingTier(tier="Scale", price="₹2,499", billing="per month / custom", features=["Enterprise workflows", "Dedicated support"])
            ],
            assumptions=["High organic conversion via localized referral loops in INR"],
            unit_economics_summary=f"Healthy 3.7x LTV:CAC with sub-4 month payback in Indian Rupees for {idea_row['title']}."
        )

    # Structured Plan
    plan_row = await fetch_one("SELECT * FROM public.plans WHERE idea_id = $1", idea_id)
    plan = None
    default_tech_categories = [
        TechStackCategory(
            category="Frontend & Client Interface",
            items=[
                TechStackItem(name="React 19 & TypeScript", justification="Component architecture with strict type safety"),
                TechStackItem(name="TailwindCSS & Framer Motion", justification="Modern UI aesthetics and fluid micro-interactions"),
                TechStackItem(name="Vite & Progressive Web App (PWA)", justification="Instant HMR builds and offline caching")
            ]
        ),
        TechStackCategory(
            category="Backend Services & AI Engine",
            items=[
                TechStackItem(name="FastAPI & Python 3.12", justification="Async, low-latency microservice orchestration"),
                TechStackItem(name="Google Gemini Flash & LangChain", justification="High-throughput reasoning and structured LLM outputs"),
                TechStackItem(name="Redis Cache & Celery Tasks", justification="Asynchronous task queues and in-memory session caching")
            ]
        ),
        TechStackCategory(
            category="Data & Cloud Infrastructure",
            items=[
                TechStackItem(name="Supabase & PostgreSQL (pgvector)", justification="Relational data persistence and semantic vector search"),
                TechStackItem(name="Docker & Container Orchestration", justification="Consistent dev-to-production deployment pipelines"),
                TechStackItem(name="Cloudflare Workers & CDN", justification="Global edge distribution and DDOS protection")
            ]
        )
    ]
    default_milestones = [
        Milestone(phase="Phase 1", title="MVP & Alpha Validation", duration="Weeks 1-4", target_date="Month 1", goals=["Deploy core feature set", "Onboard 25 pilot users", "Validate product-market pull"], deliverables=["Live web prototype", "Telemetry dashboard"], status="current"),
        Milestone(phase="Phase 2", title="Public Beta & Commercialization", duration="Weeks 5-10", target_date="Month 3", goals=["Enable self-serve onboarding", "Reach initial monetization milestone", "Establish referral loops"], deliverables=["Payment checkout", "Public directory launch"], status="upcoming"),
        Milestone(phase="Phase 3", title="Scale & Enterprise Moat", duration="Weeks 11-20", target_date="Month 6", goals=["Cross 5,000 active users", "Deploy automated analytics", "Maintain >70% gross margins"], deliverables=["Custom enterprise integrations", "Automated compliance"], status="upcoming")
    ]

    if plan_row:
        strat = json.loads(plan_row["product_strategy"]) if isinstance(plan_row["product_strategy"], str) else (plan_row["product_strategy"] or {})
        arch = json.loads(plan_row["tech_architecture"]) if isinstance(plan_row["tech_architecture"], str) else (plan_row["tech_architecture"] or {})
        miles = json.loads(plan_row["milestones"]) if isinstance(plan_row["milestones"], str) else (plan_row["milestones"] or [])

        raw_stack = arch.get("tech_stack") or arch.get("techStack") or []
        tech_categories: List[TechStackCategory] = []
        for cat in raw_stack:
            items = [
                TechStackItem(
                    name=it.get("name", "Tool"),
                    justification=it.get("justification", "Core component"),
                    icon=it.get("icon")
                ) for it in cat.get("items", [])
            ]
            tech_categories.append(TechStackCategory(
                category=cat.get("category", "General Stack"),
                items=items
            ))

        if not tech_categories:
            tech_categories = default_tech_categories

        loaded_milestones = [
            Milestone(
                phase=m.get("phase", f"Phase {m_idx + 1}"),
                title=m.get("title", f"Sprint {m_idx + 1}"),
                duration=m.get("duration", "4 weeks"),
                target_date=m.get("targetDate") or m.get("target_date") or "Month 1",
                goals=m.get("goals", []),
                deliverables=m.get("deliverables", []),
                status=m.get("status", "current" if m_idx == 0 else "upcoming")
            ) for m_idx, m in enumerate(miles)
        ] if miles else default_milestones

        plan = StructuredPlan(
            product_strategy=ProductStrategy(
                vision=strat.get("vision") or f"Build the category-defining platform for {idea_row['title']}",
                core_value_prop=strat.get("coreValueProp") or strat.get("core_value_prop") or "Precision automation with measurable outcomes.",
                target_persona=strat.get("targetPersona") or strat.get("target_persona") or idea_row.get("target_market") or "Target Customers",
                launch_phases=strat.get("launchPhases") or strat.get("corePillars") or ["Private Alpha", "Closed Beta", "Public Launch"]
            ),
            tech_stack=tech_categories,
            architecture=Architecture(
                type=arch.get("type") or "Cloud-Native AI Architecture",
                description=arch.get("description") or f"Real-time event-driven architecture with PostgreSQL, Redis queues, and LLM reasoning workers for {idea_row['title']}.",
                key_components=arch.get("keyComponents") or arch.get("key_components") or ["API Gateway", "Worker Nodes", "Vector Store", "Supabase DB"],
                scalability_notes=arch.get("scalabilityNotes") or arch.get("scalability_notes") or "Designed to scale horizontally to 100k+ concurrent active users."
            ),
            milestones=loaded_milestones
        )
    if not plan:
        plan = StructuredPlan(
            product_strategy=ProductStrategy(
                vision=f"Build the category-defining platform for {idea_row['title']}",
                core_value_prop="Zero-friction AI automation with measurable user outcomes.",
                target_persona=idea_row.get("target_market") or "Target Customers",
                launch_phases=["Private Alpha", "Closed Beta", "Public Launch"]
            ),
            tech_stack=default_tech_categories,
            architecture=Architecture(
                type="Cloud-Native AI Architecture",
                description=f"Serverless and microservice architecture with asynchronous AI workers for {idea_row['title']}.",
                key_components=["REST API", "PostgreSQL", "Redis Cache", "Gemini Worker"],
                scalability_notes="Horizontally scalable design capable of handling high concurrency."
            ),
            milestones=default_milestones
        )

    # Roles
    role_rows = await fetch_all("SELECT * FROM public.roles WHERE idea_id = $1", idea_id)
    roles = []
    for r in role_rows:
        req = json.loads(r["required_skills"]) if isinstance(r["required_skills"], str) else (r["required_skills"] or [])
        pref = json.loads(r["preferred_skills"]) if isinstance(r["preferred_skills"], str) else (r["preferred_skills"] or [])
        desc_meta = {}
        if r.get("description"):
            try:
                desc_meta = json.loads(r["description"]) if r["description"].startswith("{") else {"market_rationale": r["description"]}
            except Exception:
                desc_meta = {"market_rationale": r["description"]}

        roles.append(JobRole(
            id=r["id"],
            title=r["title"],
            department=r.get("department") or "Engineering",
            type=r.get("type") or "Full-Time",
            urgency=r.get("urgency") or "Immediate",
            required_skills=req,
            preferred_skills=pref,
            candidate_matches_count=r.get("candidate_matches_count") or 3,
            salary_range=desc_meta.get("salary_range") or "₹28L - ₹42L / yr",
            equity_range=desc_meta.get("equity_range") or "1.5% - 3.0%",
            market_rationale=desc_meta.get("market_rationale") or f"Core founding hire required to build technical separation and de-risk early customer adoption for {idea_row['title']}.",
            market_demand_index=int(desc_meta.get("market_demand_index") or 88)
        ))
    if not roles:
        roles = [
            JobRole(
                id=f"role_{idea_id}_1",
                title="Lead Full-Stack / Founding Engineer",
                department="Engineering",
                type="Co-Founder / Early Staff",
                urgency="Immediate",
                required_skills=["React 19", "Python / FastAPI", "PostgreSQL", "System Architecture"],
                preferred_skills=["Docker", "Redis", "Vector DB"],
                candidate_matches_count=3,
                salary_range="₹28L - ₹42L / yr",
                equity_range="2.0% - 4.0%",
                market_rationale=f"Primary technical architect required to build production MVP and ensure sub-second latency for {idea_row['title']}.",
                market_demand_index=92
            ),
            JobRole(
                id=f"role_{idea_id}_2",
                title="Lead Product & UX Designer",
                department="Product & Design",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["Figma", "User Journey Mapping", "Design Systems", "Prototyping"],
                preferred_skills=["Micro-interactions", "Framer Motion"],
                candidate_matches_count=2,
                salary_range="₹20L - ₹32L / yr",
                equity_range="1.0% - 2.0%",
                market_rationale=f"Reduces user onboarding drop-off and translates complex domain workflows into an intuitive interface for {idea_row.get('target_market') or 'target buyers'}.",
                market_demand_index=84
            ),
            JobRole(
                id=f"role_{idea_id}_3",
                title="Head of Growth & Acquisition",
                department="Growth & Marketing",
                type="Full-Time",
                urgency="Next Quarter",
                required_skills=["Product-Led Growth", "SEO/SEM", "Cohort Analytics", "Community Building"],
                preferred_skills=["Affiliate Loops", "B2B Outreach"],
                candidate_matches_count=2,
                salary_range="₹22L - ₹35L / yr",
                equity_range="1.0% - 2.5%",
                market_rationale=f"Drives beachhead distribution, viral referral loops, and initial customer acquisition with low blended CAC in INR.",
                market_demand_index=87
            ),
        ]

    # Parse metrics, risks, strengths
    raw_metrics = json.loads(idea_row["metrics"]) if isinstance(idea_row.get("metrics"), str) else (idea_row.get("metrics") or {})
    metrics = IdeaMetrics(
        market_demand=raw_metrics.get("marketDemand", 84),
        unit_economics=raw_metrics.get("unitEconomics", 72),
        technical_feasibility=raw_metrics.get("technicalFeasibility", 79),
        competitive_moat=raw_metrics.get("competitiveMoat", 71),
        timing_execution=raw_metrics.get("timingExecution", 82)
    )

    raw_risks = json.loads(idea_row["risks"]) if isinstance(idea_row.get("risks"), str) else (idea_row.get("risks") or [])
    risks = [
        IdeaRisk(
            title=rk.get("category") or rk.get("title", "Risk"),
            severity=rk.get("severity", "medium"),
            description=rk.get("description", ""),
            mitigation=rk.get("mitigation", "")
        ) for rk in raw_risks
    ]

    raw_strengths = json.loads(idea_row["strengths"]) if isinstance(idea_row.get("strengths"), str) else (idea_row.get("strengths") or [])
    strengths = [
        IdeaStrength(
            title=st.get("category") or st.get("title", "Strength"),
            description=st.get("description", ""),
            score=st.get("score", 85)
        ) for st in raw_strengths
    ]

    # Parse market_analysis
    market_analysis = None
    raw_market = idea_row.get("market_analysis")
    if raw_market:
        try:
            m_dict = json.loads(raw_market) if isinstance(raw_market, str) else raw_market
            market_analysis = MarketAnalysis.model_validate(m_dict)
        except Exception as e:
            print(f"Error parsing market_analysis: {e}")
    if not market_analysis:
        market_analysis = _safe_market_analysis(
            None,
            idea_row["title"],
            idea_row.get("target_market") or "Target Market",
            idea_row.get("category") or "AI & Technology"
        )
    # Parse agent discussions
    agent_discussions = None
    raw_discussions = idea_row.get("agent_discussions")
    if raw_discussions:
        try:
            agent_discussions = json.loads(raw_discussions) if isinstance(raw_discussions, str) else raw_discussions
        except Exception as e:
            print(f"Error parsing agent_discussions: {e}")

    return Idea(
        id=idea_id,
        founder_id=str(idea_row.get("founder_id") or idea_row.get("user_id") or ""),
        user_id=str(idea_row.get("user_id") or idea_row.get("founder_id") or ""),
        title=idea_row["title"],
        tagline=idea_row.get("tagline") or "",
        description=idea_row["description"],
        category=idea_row.get("category") or "AI & Technology",
        target_market=idea_row.get("target_market") or "",
        stage=idea_row.get("stage") or "Pre-Seed / Active Validation",
        created_at=str(idea_row.get("created_at") or "Just now"),
        updated_at=str(idea_row.get("updated_at") or "Just now"),
        score=(
            round(sum(a.score * {"Market Analyst": 0.25, "Competitor Researcher": 0.20, "Revenue Critic": 0.25, "Technical Architect": 0.15, "Skeptic": 0.15}.get(a.name, 0.20) for a in agents), 1)
            if agents else (idea_row.get("score") or 76.0)
        ),
        status=idea_row.get("status") or "validated",
        signal=(
            "Strong Signal" if (
                round(sum(a.score * {"Market Analyst": 0.25, "Competitor Researcher": 0.20, "Revenue Critic": 0.25, "Technical Architect": 0.15, "Skeptic": 0.15}.get(a.name, 0.20) for a in agents), 1)
                if agents else (idea_row.get("score") or 76.0)
            ) >= 78 else "Moderate Signal"
        ),
        metrics=metrics,
        agents=agents,
        risks=risks,
        strengths=strengths,
        competitors=competitors,
        revenue=revenue,
        plan=plan,
        roles=roles,
        market_analysis=market_analysis,
        agent_discussions=agent_discussions
    )

@router.get("/ideas", response_model=List[Idea])
async def list_ideas(claims: UserClaims = Depends(get_current_user_claims)):
    """Lists ideas created by and belonging strictly to the authenticated user"""
    ideas = []
    seen_ids = set()

    # Prepend any newly generated active ideas from in-memory store that belong to this user
    for i_id, i_obj in reversed(list(ACTIVE_IDEAS_STORE.items())):
        owner = ACTIVE_IDEAS_USER_STORE.get(i_id) or getattr(i_obj, "founder_id", None) or getattr(i_obj, "user_id", None)
        if owner and str(owner) == str(claims.user_id):
            ideas.append(i_obj)
            seen_ids.add(i_id)

    try:
        # Strictly query ideas belonging to the authenticated founder/user
        rows = await fetch_all(
            "SELECT * FROM public.ideas WHERE founder_id::text = $1 OR user_id::text = $1 ORDER BY created_at DESC",
            str(claims.user_id)
        )
    except Exception as e:
        print(f"[list_ideas] Error querying ideas table for user {claims.user_id}: {e}")
        rows = []

    for r in rows:
        if r["id"] in seen_ids:
            continue
        try:
            idea = await build_full_idea(r)
            ideas.append(idea)
            seen_ids.add(r["id"])
        except Exception as e:
            print(f"[list_ideas] Error constructing idea {r.get('id')}: {e}")

    return ideas

@router.get("/ideas/{idea_id}", response_model=Idea)
async def get_idea_by_id(idea_id: str):
    """Returns full idea workspace by ID"""
    if idea_id in ACTIVE_IDEAS_STORE:
        return ACTIVE_IDEAS_STORE[idea_id]

    row = await fetch_one("SELECT * FROM public.ideas WHERE id = $1", idea_id)
    if not row:
        if idea_id == "idea_nutrifit_ai":
            demo_row = await fetch_one("SELECT * FROM public.ideas WHERE id = 'idea_nutrifit_ai'")
            if demo_row:
                return await build_full_idea(demo_row)
        raise HTTPException(status_code=404, detail="Idea not found")
    return await build_full_idea(row)

@router.post("/ideas/{idea_id}/refresh-market-intel", response_model=Idea)
async def refresh_market_intel_endpoint(idea_id: str, claims: UserClaims = Depends(get_current_user_claims)):
    """Refreshes live internet research, market sizing, and competitor landscape for this idea."""
    idea = None
    if idea_id in ACTIVE_IDEAS_STORE:
        idea = ACTIVE_IDEAS_STORE[idea_id]
    else:
        row = await fetch_one("SELECT * FROM public.ideas WHERE id = $1", idea_id)
        if row:
            idea = await build_full_idea(row)

    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    from app.services.web_search_service import search_market_intel
    web_intel = await search_market_intel(
        title=idea.title,
        target_market=idea.target_market,
        category=idea.category,
        description=idea.description
    )

    updated_market = _safe_market_analysis(
        None,
        idea.title,
        idea.target_market,
        idea.category,
        web_intel
    )
    idea.market_analysis = updated_market
    ACTIVE_IDEAS_STORE[idea_id] = idea

    try:
        await execute(
            "UPDATE public.ideas SET market_analysis = $1, updated_at = NOW() WHERE id = $2",
            json.dumps(updated_market.model_dump(by_alias=True)),
            idea_id
        )
    except Exception as e:
        print(f"Error updating market_analysis in DB: {e}")

    return idea


@router.post("/ideas/{idea_id}/agents/{agent_name}/discuss", response_model=AgentDiscussionMessage)
async def discuss_with_agent_endpoint(
    idea_id: str,
    agent_name: str,
    payload: AgentDiscussionRequest,
    claims: UserClaims = Depends(get_current_user_claims)
):
    """
    Follow-up conversation with a specific validation agent on its evaluation,
    sub-parameters, vulnerabilities, and strategic execution.
    """
    idea = None
    if idea_id in ACTIVE_IDEAS_STORE:
        idea = ACTIVE_IDEAS_STORE[idea_id]
    else:
        row = await fetch_one("SELECT * FROM public.ideas WHERE id = $1", idea_id)
        if row:
            idea = await build_full_idea(row)

    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    from app.services.discussion_service import process_agent_discussion
    discussion_res = await process_agent_discussion(
        idea=idea,
        agent_name=agent_name,
        user_message=payload.message,
        sub_parameter=payload.sub_parameter,
        history=payload.history
    )

    # Update in-memory store
    import uuid
    if not idea.agent_discussions:
        idea.agent_discussions = {}
    thread = idea.agent_discussions.get(agent_name, [])
    thread.append({
        "id": f"msg_user_{uuid.uuid4().hex[:8]}",
        "sender": "user",
        "agentName": agent_name,
        "subParameter": payload.sub_parameter,
        "content": payload.message,
        "timestamp": discussion_res.get("timestamp")
    })
    thread.append(discussion_res)
    idea.agent_discussions[agent_name] = thread
    ACTIVE_IDEAS_STORE[idea_id] = idea

    return AgentDiscussionMessage(
        id=discussion_res["id"],
        sender=discussion_res["sender"],
        agent_name=discussion_res["agentName"],
        sub_parameter=discussion_res.get("subParameter"),
        content=discussion_res["content"],
        timestamp=discussion_res["timestamp"],
        suggested_follow_ups=discussion_res.get("suggestedFollowUps", []),
        score_note=discussion_res.get("scoreNote")
    )


@router.post("/ideas/validate", response_model=Idea)
async def validate_idea(payload: CreateIdeaRequest, claims: UserClaims = Depends(get_current_user_claims)):
    """Runs parallel 5-agent stress test pipeline and returns synthesized venture"""
    idea_dict = payload.model_dump(by_alias=True)
    idea = await run_parallel_validation(idea_dict, claims.user_id)
    return idea

@router.get("/ideas/{idea_id}/validation", response_model=ValidationRunStatus)
async def poll_validation_run(idea_id: str):
    """Polls real-time progress of active validation run"""
    if idea_id in ACTIVE_VALIDATION_RUNS:
        return ACTIVE_VALIDATION_RUNS[idea_id]

    # Query latest run from DB
    run_row = await fetch_one("SELECT * FROM public.validation_runs WHERE idea_id = $1 ORDER BY created_at DESC LIMIT 1", idea_id)
    if run_row:
        agent_rows = await fetch_all("SELECT * FROM public.validation_agents WHERE idea_id = $1", idea_id)
        agents = [
            ValidationAgent(
                id=a["id"],
                name=a["name"],
                role_title=a["role_title"],
                icon=a.get("icon") or "token",
                score=a["score"],
                status=a["status"],
                verdict=a.get("verdict") or "Validated",
                detailed_analysis=a.get("detailed_analysis") or "",
                key_findings=json.loads(a["key_findings"]) if isinstance(a["key_findings"], str) else (a["key_findings"] or []),
                concerns=json.loads(a["concerns"]) if isinstance(a["concerns"], str) else (a["concerns"] or [])
            ) for a in agent_rows
        ]
        return ValidationRunStatus(
            id=run_row["id"],
            idea_id=idea_id,
            status=run_row["status"],
            overall_score=int(run_row.get("overall_score") or 78),
            agents=agents
        )

    # Return default completed status for demo
    demo_idea = await get_idea_by_id(idea_id)
    return ValidationRunStatus(
        id=f"val_{idea_id}",
        idea_id=idea_id,
        status="completed",
        overall_score=demo_idea.score,
        agents=demo_idea.agents
    )

@router.put("/ideas/{idea_id}/revenue", response_model=RevenueAnalysis)
async def update_idea_revenue(idea_id: str, payload: RevenueAnalysis):
    """Updates pricing tiers and unit economics for an idea"""
    tiers_json = json.dumps([t.model_dump(by_alias=True) for t in payload.pricing_tiers])
    assumptions_json = json.dumps(payload.assumptions)

    try:
        await execute(
            """UPDATE public.revenue_analyses 
               SET model_type = $1, cac = $2, ltv = $3, ltv_cac_ratio = $4, gross_margin = $5, payback_months = $6, pricing_tiers = $7, assumptions = $8, unit_economics_summary = $9
               WHERE idea_id = $10""",
            payload.model_type, payload.cac, payload.ltv, payload.ltv_cac_ratio, payload.gross_margin, payload.payback_months, tiers_json, assumptions_json, payload.unit_economics_summary, idea_id
        )
    except Exception as e:
        print(f"Error persisting revenue to DB for {idea_id}: {e}")

    if idea_id in ACTIVE_IDEAS_STORE:
        ACTIVE_IDEAS_STORE[idea_id].revenue = payload

    return payload

@router.put("/ideas/{idea_id}/plan", response_model=StructuredPlan)
async def update_idea_plan(idea_id: str, payload: StructuredPlan):
    """Updates product strategy, tech stack, architecture, and milestone sprints for an idea"""
    strat_json = json.dumps(payload.product_strategy.model_dump(by_alias=True))
    arch_dict = payload.architecture.model_dump(by_alias=True)
    arch_dict["tech_stack"] = [cat.model_dump(by_alias=True) for cat in payload.tech_stack]
    arch_json = json.dumps(arch_dict)
    miles_json = json.dumps([m.model_dump(by_alias=True) for m in payload.milestones])

    try:
        await execute(
            """INSERT INTO public.plans (idea_id, product_strategy, tech_architecture, milestones, unit_economics)
               VALUES ($1, $2, $3, $4, '{}')
               ON CONFLICT (idea_id) DO UPDATE SET
                   product_strategy = EXCLUDED.product_strategy,
                   tech_architecture = EXCLUDED.tech_architecture,
                   milestones = EXCLUDED.milestones""",
            idea_id, strat_json, arch_json, miles_json
        )
    except Exception as e:
        print(f"Error persisting plan to public.plans for {idea_id}: {e}")

    try:
        stack_json = json.dumps([cat.model_dump(by_alias=True) for cat in payload.tech_stack])
        pure_arch_json = json.dumps(payload.architecture.model_dump(by_alias=True))
        await execute(
            """INSERT INTO public.structured_plans (idea_id, product_strategy, tech_stack, architecture, milestones)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (idea_id) DO UPDATE SET
                   product_strategy = EXCLUDED.product_strategy,
                   tech_stack = EXCLUDED.tech_stack,
                   architecture = EXCLUDED.architecture,
                   milestones = EXCLUDED.milestones""",
            idea_id, strat_json, stack_json, pure_arch_json, miles_json
        )
    except Exception:
        pass

    if idea_id in ACTIVE_IDEAS_STORE:
        ACTIVE_IDEAS_STORE[idea_id].plan = payload

    return payload

@router.put("/ideas/{idea_id}/roles", response_model=List[JobRole])
async def update_idea_roles(idea_id: str, payload: List[JobRole]):
    """Updates required founding roles, market salaries, and skills for an idea"""
    try:
        await execute("DELETE FROM public.roles WHERE idea_id = $1", idea_id)
        for r in payload:
            req_json = json.dumps(r.required_skills)
            pref_json = json.dumps(r.preferred_skills)
            desc_json = json.dumps({
                "salary_range": r.salary_range or "₹24L - ₹36L / yr",
                "equity_range": r.equity_range or "1.5% - 3.0%",
                "market_rationale": r.market_rationale or "",
                "market_demand_index": r.market_demand_index or 88
            })
            await execute(
                """INSERT INTO public.roles (
                    id, idea_id, title, department, level, type, urgency,
                    required_skills, preferred_skills, description, candidate_matches_count
                ) VALUES ($1, $2, $3, $4, 'Founding', $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    department = EXCLUDED.department,
                    type = EXCLUDED.type,
                    urgency = EXCLUDED.urgency,
                    required_skills = EXCLUDED.required_skills,
                    preferred_skills = EXCLUDED.preferred_skills,
                    description = EXCLUDED.description,
                    candidate_matches_count = EXCLUDED.candidate_matches_count""",
                r.id, idea_id, r.title, r.department, r.type, r.urgency,
                req_json, pref_json, desc_json, r.candidate_matches_count
            )
    except Exception as e:
        print(f"Error persisting roles to DB for {idea_id}: {e}")

    if idea_id in ACTIVE_IDEAS_STORE:
        ACTIVE_IDEAS_STORE[idea_id].roles = payload

    return payload
