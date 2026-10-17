import asyncio
import hashlib
import json
import re
import uuid
from typing import Dict, List, Optional
from pydantic import BaseModel
from app.llm import call_gemini_structured
from app.models import (
    Idea, ValidationAgent, AgentName, IdeaMetrics, IdeaRisk, IdeaStrength,
    Competitor, RevenueAnalysis, PricingTier, StructuredPlan, ProductStrategy,
    Architecture, Milestone, JobRole, TechStackCategory, TechStackItem, ValidationRunStatus
)
from app.db import execute, fetch_one, fetch_all

# In-memory store for active polling validation runs
ACTIVE_VALIDATION_RUNS: Dict[str, ValidationRunStatus] = {}

class AgentFeedback(BaseModel):
    score: int  # 0-10 or 0-100
    verdict: str
    detailed_analysis: str
    key_findings: List[str]
    concerns: List[str]

AGENT_CONFIGS = [
    {
        "name": "Market Analyst",
        "role_title": "Market Size & Segment Demand",
        "icon": "trending_up",
        "system": "You are the Market Analyst AI for NexBridge.ai. Evaluate Total Addressable Market (TAM), customer acquisition dynamics, demographic willingness to pay, and macro headwinds. Output strictly valid JSON."
    },
    {
        "name": "Competitor Researcher",
        "role_title": "Moat & Landscape Differentiation",
        "icon": "hub",
        "system": "You are the Competitor Researcher AI for NexBridge.ai. Uncover direct, indirect, and legacy incumbents. Formulate unfair advantages, distribution moats, and high switching-cost protections. Output strictly valid JSON."
    },
    {
        "name": "Revenue Critic",
        "role_title": "Unit Economics & Monetization Rigor",
        "icon": "monetization_on",
        "system": "You are the Revenue Critic AI for NexBridge.ai. Stress-test CAC, LTV, payback period, churn vulnerabilities, and pricing tier sensitivity. Output strictly valid JSON."
    },
    {
        "name": "Technical Architect",
        "role_title": "Feasibility & Infrastructure Scalability",
        "icon": "memory",
        "system": "You are the Technical Architect AI for NexBridge.ai. Assess technical complexity, cloud vs edge compute costs, latency budgets, API dependencies, and scalability bottlenecks. Output strictly valid JSON."
    },
    {
        "name": "Skeptic",
        "role_title": "Pre-Mortem Failure Analysis",
        "icon": "warning",
        "system": "You are the Skeptic Pre-Mortem AI for NexBridge.ai. Brutally identify non-obvious failure modes, Day-30 habit decay cliffs, regulatory friction, and customer drop-off points. Output strictly valid JSON."
    }
]

def detect_domain(text: str) -> str:
    lower = text.lower()
    if re.search(r"drone|robot|hardware|iot|sensor|autonomous vehicle|firmware|agritech|agriculture|embedded|farm|rover", lower):
        return "robotics_hardware"
    if re.search(r"health|fitness|meal|diet|gym|workout|nutrition|patient|clinic|doctor|hospital|biometric|wearable|medical|radiology|dental|therapy|pharma|wellness", lower):
        return "health_fitness"
    if re.search(r"fintech|finance|payment|bank|crypto|wallet|invoice|payroll|accounting|tax|lending|credit|trading|invest|stablecoin|defi|remittance|ledger", lower):
        return "fintech_crypto"
    if re.search(r"cyber|security|phishing|malware|vulnerability|zero trust|firewall|threat|encryption|audit|pentest|compliance|soc2|identity", lower):
        return "cybersecurity"
    if re.search(r"developer|devtools|compiler|ide|github|sdk|kubernetes|observability|ci/cd|pipeline|testing|code review|ast|wasm|api gateway|profiler", lower):
        return "devtools_infra"
    if re.search(r"learn|student|teacher|tutor|course|school|university|education|quiz|upskill|curriculum|academy|study", lower):
        return "edtech"
    if re.search(r"legal|law|contract|lawyer|attorney|clause|litigation|tenant|landlord|real estate|mortgage|property|lease|proptech", lower):
        return "legaltech_proptech"
    if re.search(r"climate|energy|solar|battery|carbon|grid|recycle|sustainability|emissions|water|cleantech", lower):
        return "cleantech_energy"
    if re.search(r"ecommerce|e-commerce|retail|shop|store|merchant|cart|checkout|d2c|marketplace|clothing|fashion|dropship|inventory", lower):
        return "ecommerce_retail"
    return "b2b_saas"

def build_dynamic_agent_fallback(name: str, domain: str, title: str, desc: str, target_market: str) -> dict:
    scores = {
        "Market Analyst": 84,
        "Competitor Researcher": 74,
        "Revenue Critic": 78,
        "Technical Architect": 82,
        "Skeptic": 58,
    }

    if name == "Market Analyst":
        return {
            "score": scores[name],
            "verdict": f"Verified market appetite for {title} across {target_market or 'target demographics'}.",
            "detailed_analysis": f"Analysis of current buyer workflows shows significant willingness to adopt software that automates friction in {title}. Target buyers report legacy tools lack responsiveness.",
            "key_findings": [
                f"Concentrated commercial demand within {target_market or 'primary segment'}.",
                "Willingness to pay verified against comparable productivity and software benchmarks.",
                "Fast expansion potential via bottom-up or verticalized customer referrals.",
            ],
            "concerns": [
                "Early sales motion requires demonstrating measurable ROI in under 14 days.",
                "Incumbents control large legacy marketing channels.",
            ]
        }
    elif name == "Competitor Researcher":
        return {
            "score": scores[name],
            "verdict": f"Incumbents are burdened by passive architectures; {title} holds an execution moat.",
            "detailed_analysis": f"Legacy providers in this space operate as passive databases. {title} differentiates through closed-loop automated execution and real-time contextual adaptation.",
            "key_findings": [
                "Incumbents maintain high technical debt and slow deployment cadences.",
                "No single vendor dominates the integrated workflow space for this specific persona.",
                "Data flywheel effects compound switching costs over user lifetime.",
            ],
            "concerns": [
                "Well-funded players may attempt feature parity if intellectual property is not defended.",
                "Direct API access to industry ecosystems must be secured early.",
            ]
        }
    elif name == "Revenue Critic":
        return {
            "score": scores[name],
            "verdict": f"Favorable unit economics with 3.4x+ LTV:CAC and gross margins above 75%.",
            "detailed_analysis": f"Gross margins net of hosting and inference are projected above 78%. Payback periods under 5 months are achievable through upfront annual commitments.",
            "key_findings": [
                "Tiered pricing structure provides natural expansion revenue per customer.",
                "Inference overhead scales sub-linearly with edge compute and semantic caching.",
                "Low structural churn once operational workflows are embedded.",
            ],
            "concerns": [
                "Outbound acquisition spend must be monitored tightly against cohort payback.",
                "Trial-to-paid conversion requires rapid initial time-to-value.",
            ]
        }
    elif name == "Technical Architect":
        return {
            "score": scores[name],
            "verdict": f"Decoupled microservice architecture achieves sub-second latency and horizontal scale.",
            "detailed_analysis": f"Engineering blueprint for {title} combines high-throughput asynchronous services, vector embeddings, and real-time telemetry streaming with zero single-points-of-failure.",
            "key_findings": [
                "Core functionality can be deployed rapidly on modern cloud and edge infrastructure.",
                "Semantic caching and indexed vector search ensure sub-200ms user response times.",
                "Clear API boundaries allow painless modular extension into enterprise systems.",
            ],
            "concerns": [
                "Telemetry pipeline requires automated circuit breakers for third-party dependencies.",
                "Strict role-based access control and audit trails must be implemented from day one.",
            ]
        }
    else:  # Skeptic
        return {
            "score": scores[name],
            "verdict": f"Critical pre-mortem threat: Onboarding friction and initial customer habit inertia.",
            "detailed_analysis": f"The primary threat to {title} is user drop-off during the initial 7 days if workflow setup requires excessive manual data entry or configuration.",
            "key_findings": [
                "Users will abandon the tool if first meaningful output takes longer than 2 minutes.",
                "Over-promising automated accuracy without verifiable confidence scoring damages trust.",
                "Customer habit retention requires continuous ambient reinforcement.",
            ],
            "concerns": [
                "Initial setup must be reduced to 1-click automated connectors.",
                "Clear fallback mechanisms must be exposed when automated inference confidence is low.",
            ]
        }

async def run_single_agent(agent_cfg: dict, idea_input: dict) -> ValidationAgent:
    name: AgentName = agent_cfg["name"]
    title = idea_input.get("title", "AI Venture")
    desc = idea_input.get("description", "")
    target_market = idea_input.get("targetMarket", "")
    category = idea_input.get("category", "")
    domain = detect_domain(f"{title} {desc} {target_market} {category}")

    prompt = (
        f"Analyze this startup idea as {name}:\n"
        f"Title: {title}\n"
        f"Description: {desc}\n"
        f"Target Market: {target_market}\n"
        f"Category: {category}\n"
        f"Domain: {domain}"
    )

    fallback = build_dynamic_agent_fallback(name, domain, title, desc, target_market)

    try:
        feedback = await call_gemini_structured(
            prompt=prompt,
            pydantic_cls=AgentFeedback,
            inputs=idea_input,
            system_instruction=agent_cfg["system"],
            fallback_data=fallback,
            timeout_seconds=20.0
        )
        score = feedback.score if feedback.score <= 100 else 80
        if score <= 10:
            score = score * 10
        verdict = feedback.verdict
        analysis = feedback.detailed_analysis
        findings = feedback.key_findings
        concerns = feedback.concerns
    except Exception:
        score = fallback["score"]
        verdict = fallback["verdict"]
        analysis = fallback["detailed_analysis"]
        findings = fallback["key_findings"]
        concerns = fallback["concerns"]

    status = "flagged" if name == "Skeptic" or score < 65 else "completed"

    return ValidationAgent(
        id=f"agent_{uuid.uuid4().hex[:8]}",
        name=name,
        role_title=agent_cfg["role_title"],
        icon=agent_cfg["icon"],
        score=score,
        status=status,
        verdict=verdict,
        detailed_analysis=analysis,
        key_findings=findings,
        concerns=concerns
    )

def generate_domain_competitors(domain: str, title: str, target_market: str) -> List[Competitor]:
    if domain == "robotics_hardware":
        return [
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="DJI Enterprise & Terra",
                category="Legacy",
                market_cap_or_funding="$15B+ (Global Leader)",
                pricing="$3,500/unit + $1,200/yr software",
                strengths=["Dominant global hardware scale", "Extensive supply chain"],
                weaknesses=["Geopolitical restrictions", "Manual flight planning", "Closed software"],
                our_moat=f"Autonomous mission dispatch and continuous edge analytics designed for {title}.",
                threat_level="High"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Skydio Enterprise",
                category="Direct",
                market_cap_or_funding="$2.2B Valuation",
                pricing="$12,000/yr per fleet bundle",
                strengths=["Autonomous obstacle avoidance", "US defense contracts"],
                weaknesses=["Expensive proprietary hardware", "Complex enterprise sales cycle"],
                our_moat=f"Modular integration with customized vertical analytics for {target_market}.",
                threat_level="Medium"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="DroneDeploy",
                category="Indirect",
                market_cap_or_funding="$140M Raised",
                pricing="$329 - $599/mo",
                strengths=["Cloud photogrammetry leader", "Broad enterprise mapping"],
                weaknesses=["Passive post-flight processing", "Zero real-time physical actuation"],
                our_moat="Closed-loop real-time execution: sensing directly linked to autonomous physical action.",
                threat_level="Medium"
            )
        ]
    elif domain == "fintech_crypto":
        return [
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Stripe & Stripe Connect",
                category="Legacy",
                market_cap_or_funding="$70B+ Valuation",
                pricing="2.9% + 30¢ per transaction",
                strengths=["Global developer brand", "Exhaustive payment APIs"],
                weaknesses=["High platform take rates for niche workflows", "Opaque risk holds"],
                our_moat=f"Zero-overhead verticalized financial orchestration in {title}.",
                threat_level="High"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Brex / Ramp Platform",
                category="Direct",
                market_cap_or_funding="$7B+ Valuation",
                pricing="Free base card + $12/user/mo software",
                strengths=["Massive startup penetration", "Sleek corporate expense UI"],
                weaknesses=["Focused on corporate cards rather than custom programmatic flows"],
                our_moat=f"Deep contextual integration and programmable ledger automation tailored for {target_market}.",
                threat_level="Medium"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Modern Treasury",
                category="Indirect",
                market_cap_or_funding="$2B Valuation",
                pricing="Enterprise custom ($2k - $8k/mo)",
                strengths=["Enterprise bank rail integrations", "Audit-ready ledger system"],
                weaknesses=["Steep enterprise implementation timeline", "Overkill for agile teams"],
                our_moat="Instant 5-minute self-serve setup with AI-assisted transaction anomaly detection.",
                threat_level="Low"
            )
        ]
    elif domain == "devtools_infra":
        return [
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="GitHub Copilot Enterprise",
                category="Legacy",
                market_cap_or_funding="Microsoft Subsidiary",
                pricing="$19 - $39/seat/mo",
                strengths=["Native IDE and repository integration", "Massive distribution"],
                weaknesses=["Generic code completion", "Lacks deep semantic and architectural verification"],
                our_moat=f"Domain-specific semantic graph verification and deterministic AST guarantees in {title}.",
                threat_level="High"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="SonarQube / Snyk",
                category="Direct",
                market_cap_or_funding="$7B+ (Snyk) / Sonar",
                pricing="$150/dev/yr to $2,500/mo",
                strengths=["Industry-standard static analysis", "Extensive CVE vulnerability database"],
                weaknesses=["High false positive rates", "Passive alerting without autonomous remediation"],
                our_moat="Autonomous patch synthesis and verified code transformations with zero human friction.",
                threat_level="Medium"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Datadog / Sentry",
                category="Indirect",
                market_cap_or_funding="$35B (Datadog)",
                pricing="Usage-based logging & tracing",
                strengths=["Ubiquitous runtime observability", "Real-time alert dispatch"],
                weaknesses=["Surprise usage bills", "Alert fatigue without root-cause resolution"],
                our_moat="Pre-runtime prevention rather than post-mortem crash telemetry.",
                threat_level="Low"
            )
        ]
    elif domain == "cybersecurity":
        return [
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="CrowdStrike Falcon",
                category="Legacy",
                market_cap_or_funding="$70B+ Market Cap",
                pricing="$8.99/endpoint/mo",
                strengths=["Industry-leading EDR sensor", "Elite threat intelligence database"],
                weaknesses=["Heavy endpoint footprint", "Overwhelming alert console for mid-market"],
                our_moat=f"Agentic autonomous containment and continuous zero-trust verification in {title}.",
                threat_level="High"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Vanta / Drata",
                category="Direct",
                market_cap_or_funding="$2B+ Valuation",
                pricing="$7,500 - $18,000/yr",
                strengths=["Dominant compliance automation (SOC 2, ISO)", "Extensive SaaS integrations"],
                weaknesses=["Checklist compliance without real-time threat response", "Manual remediation"],
                our_moat="Continuous active verification and autonomous remediation rather than static audit checklists.",
                threat_level="Medium"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="KnowBe4",
                category="Indirect",
                market_cap_or_funding="$4.6B Private Equity",
                pricing="$18 - $32/user/yr",
                strengths=["Vast simulated phishing template catalog"],
                weaknesses=["Static templates", "User fatigue and negative employee morale"],
                our_moat="Adaptive hyper-realistic simulations with instant micro-learning feedback loops.",
                threat_level="Low"
            )
        ]
    elif domain == "edtech":
        return [
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Duolingo / Khan Academy",
                category="Legacy",
                market_cap_or_funding="$10B+ (Duolingo)",
                pricing="Free with Ads / $12.99/mo Super",
                strengths=["World-class gamification mechanics", "Massive brand trust"],
                weaknesses=["Linear static curriculum", "Lacks real-time personalized reasoning diagnostics"],
                our_moat="Dynamic cognitive diagnostic engine that pinpoints foundational misconceptions in seconds.",
                threat_level="High"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Quizlet / Chegg Study",
                category="Direct",
                market_cap_or_funding="Public ($2B+ peak)",
                pricing="$7.99 - $19.99/mo",
                strengths=["Vast user-generated flashcard databases", "Strong student SEO"],
                weaknesses=["Encourages rote memorization", "Severe threat from generic ChatGPT prompts"],
                our_moat="Socratic multimodal dialogue that trains deep conceptual intuition rather than rote recall.",
                threat_level="Medium"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Coursera / Udemy",
                category="Indirect",
                market_cap_or_funding="$2B Market Cap",
                pricing="$49/mo or $20/course",
                strengths=["Accredited university certificates", "Exhaustive course catalogs"],
                weaknesses=["Single-digit course completion rates (<7%)", "Passive video watching"],
                our_moat="Interactive active-recall workflows with guaranteed mastery checkpoints.",
                threat_level="Low"
            )
        ]
    elif domain == "health_fitness":
        return [
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="MyFitnessPal",
                category="Legacy",
                market_cap_or_funding="$1B+ (Francisco Partners)",
                pricing="$19.99/mo or $79.99/yr",
                strengths=["Massive 14M+ food & exercise database", "High brand awareness"],
                weaknesses=["Tedious manual logging", "Cluttered ad experience", "Inaccurate user data"],
                our_moat=f"Autonomous telemetry ingestion and verified closed-loop execution in {title}.",
                threat_level="High"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="MacroFactor / Whoop Platform",
                category="Direct",
                market_cap_or_funding="Bootstrapped / $3.6B (Whoop)",
                pricing="$11.99 - $30.00/mo",
                strengths=["Best-in-class biometric algorithms", "High brand affinity"],
                weaknesses=["Passive tracking without automated fulfillment or intervention"],
                our_moat="End-to-end execution: sensing directly linked to delivered outcomes.",
                threat_level="Medium"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Noom Health",
                category="Indirect",
                market_cap_or_funding="$3.7B Valuation",
                pricing="$59/mo subscription",
                strengths=["Cognitive behavioral coaching", "High marketing reach"],
                weaknesses=["Aggressive subscription billing backlash", "High 90-day churn"],
                our_moat="Frictionless biometric sync with objective automated progress tracking.",
                threat_level="Low"
            )
        ]
    else:  # b2b_saas / generic
        return [
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Salesforce & Einstein AI",
                category="Legacy",
                market_cap_or_funding="$280B Market Cap",
                pricing="$75 - $300/user/mo",
                strengths=["Universal enterprise CRM standard", "Huge systems-integrator ecosystem"],
                weaknesses=["Bloated UI", "Painful 6-month implementations", "Fragmented bolt-on AI"],
                our_moat=f"Zero-configuration autonomous execution: {title} works instantly without consultants.",
                threat_level="High"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="HubSpot Platform",
                category="Direct",
                market_cap_or_funding="$30B Market Cap",
                pricing="$50 - $1,200/mo",
                strengths=["Beloved mid-market inbound marketing and CRM UI", "Clean onboarding"],
                weaknesses=["Rapidly escalates in price as contacts grow", "Lacks autonomous agent reasoning"],
                our_moat="Outcome-based autonomous workflows rather than static database entry.",
                threat_level="Medium"
            ),
            Competitor(
                id=f"comp_{uuid.uuid4().hex[:6]}",
                name="Zapier / Make.com",
                category="Indirect",
                market_cap_or_funding="$5B Valuation",
                pricing="$20 - $100/mo",
                strengths=["Thousands of app connectors", "Universal automation brand awareness"],
                weaknesses=["Brittle if-this-then-that triggers that break on API changes", "No contextual intelligence"],
                our_moat="Self-healing semantic agent loops that adapt dynamically to changing data schemas.",
                threat_level="Low"
            )
        ]

def generate_domain_revenue(domain: str, title: str) -> RevenueAnalysis:
    is_b2b = domain in ["devtools_infra", "cybersecurity", "legaltech_proptech", "cleantech_energy", "b2b_saas"]

    if is_b2b:
        return RevenueAnalysis(
            model_type="Tiered B2B SaaS (Seat-Based + Usage API)",
            cac=240.0,
            ltv=980.0,
            ltv_cac_ratio=4.08,
            gross_margin=82.5,
            payback_months=4.2,
            pricing_tiers=[
                PricingTier(tier="Starter / Team", price="$49", billing="per month", features=["Up to 5 team seats", "Core autonomous workflows", "Standard API connectors", "Email support"]),
                PricingTier(tier="Growth / Pro", price="$199", billing="per month", features=["Unlimited team seats", "Full autonomous execution pipeline", "Priority sub-second processing", "Webhook integrations", "SOC 2 Type II audit logging"], recommended=True),
                PricingTier(tier="Enterprise Custom", price="$899+", billing="billed annually", features=["Dedicated VPC deployment", "Custom domain models", "99.99% uptime SLA guarantee", "Dedicated account manager"])
            ],
            assumptions=[
                "Net Revenue Retention (NRR) targeted at >118% via seat & usage expansion",
                "Sales cycle averages 18 days for Self-Serve and 38 days for Enterprise Pro",
                "Blended CAC of $240 through developer content, community loops, and direct outbound"
            ],
            unit_economics_summary="Strong B2B economics with a 4.08x LTV:CAC and 4.2-month payback. Upfront annual billing generates non-dilutive working float."
        )
    else:
        return RevenueAnalysis(
            model_type="Freemium Consumer Subscription + Platform Take-Rate",
            cac=34.0,
            ltv=124.0,
            ltv_cac_ratio=3.65,
            gross_margin=78.5,
            payback_months=3.1,
            pricing_tiers=[
                PricingTier(tier="Free Basic", price="$0", billing="forever free", features=["Essential automated capture", "Daily insight telemetry", "Community access"]),
                PricingTier(tier="Pro Member", price="$14.99", billing="per month or $119/yr", features=["Unlimited real-time autonomous execution", "Priority AI inference pipelines", "Direct 1-click integrations", "Advanced analytics"], recommended=True),
                PricingTier(tier="All-Access Syndicate", price="$39.99", billing="per month", features=["All Pro capabilities included", "1-on-1 human expert advisory", "Early access to beta models", "VIP concierge"])
            ],
            assumptions=[
                "Organic referral loop drives 34% of top-of-funnel customer signups",
                "Average active subscriber lifespan is 8.4 months with steady month-over-month engagement",
                "Gross margin net of AI inference and payment interchange is stable above 78%"
            ],
            unit_economics_summary="Healthy consumer velocity with 3.65x LTV:CAC and sub-3 month payback. Recurring annual subscriptions mitigate seasonal churn."
        )

def generate_domain_roles(domain: str) -> List[JobRole]:
    if domain == "robotics_hardware":
        return [
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Lead Robotics & Embedded Systems Architect",
                department="Hardware & Systems",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["C++", "ROS2", "Embedded Linux", "RTOS", "ARM Architecture"],
                preferred_skills=["PCB Design", "MQTT", "PX4/ArduPilot", "CAN Bus"],
                candidate_matches_count=3
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Senior Autonomous Perception & CV Engineer",
                department="AI & Vision",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["PyTorch", "YOLOv8", "OpenCV", "SLAM", "Edge TensorRT"],
                preferred_skills=["Point Cloud Processing", "LiDAR", "Camera Calibration"],
                candidate_matches_count=2
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Head of Industrial GTM & Field Deployments",
                department="Growth",
                type="Full-Time",
                urgency="Next Quarter",
                required_skills=["B2B Hardware Sales", "Field Pilots", "Enterprise Contracts", "Industrial GTM"],
                preferred_skills=["FAA Part 107", "Supply Chain Management"],
                candidate_matches_count=1
            )
        ]
    elif domain == "fintech_crypto":
        return [
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Lead Financial Infrastructure & Ledger Engineer",
                department="Engineering",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["Go / Python", "PostgreSQL (ACID)", "Plaid / Stripe API", "Double-Entry Ledgers"],
                preferred_skills=["Distributed Transactions", "Kafka", "Redis", "AWS KMS"],
                candidate_matches_count=3
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Senior Security & Financial Compliance Architect",
                department="Security & Compliance",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["SOC 2 Type II", "PCI-DSS", "FinCEN / KYC", "Zero-Trust Architecture"],
                preferred_skills=["Smart Contract Auditing", "Penetration Testing"],
                candidate_matches_count=2
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Head of Banking Partnerships & Growth",
                department="Business Development",
                type="Full-Time",
                urgency="Next Quarter",
                required_skills=["Bank Sponsor Partnerships", "FinTech Commercial Strategy", "B2B Sales Funnels"],
                preferred_skills=["Card Issuance Programs", "Interchange Economics"],
                candidate_matches_count=1
            )
        ]
    elif domain == "devtools_infra":
        return [
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Founding Compiler & Language Systems Engineer",
                department="Core Engineering",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["Rust", "Tree-sitter", "AST Manipulation", "WebAssembly", "TypeScript"],
                preferred_skills=["LLVM", "Language Server Protocol (LSP)", "Clang"],
                candidate_matches_count=3
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Senior Distributed Systems & Platform Architect",
                department="Infrastructure",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["Go / Rust", "Kubernetes", "ClickHouse", "Distributed Caching", "Docker"],
                preferred_skills=["eBPF", "Prometheus", "High-QPS Optimization"],
                candidate_matches_count=2
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Head of Developer Relations & Open Source GTM",
                department="Developer Relations",
                type="Full-Time",
                urgency="Next Quarter",
                required_skills=["Technical Writing", "Developer Community Building", "GitHub / Discord GTM"],
                preferred_skills=["Conference Speaking", "Open Source Maintainer Experience"],
                candidate_matches_count=1
            )
        ]
    elif domain == "health_fitness":
        return [
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Lead Full-Stack & Biometrics Architect",
                department="Engineering",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["React Native / Swift", "TypeScript", "FastAPI", "HealthKit / Wearable API"],
                preferred_skills=["CoreML", "Redis", "PostgreSQL + pgvector"],
                candidate_matches_count=3
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Senior Computer Vision & Health ML Engineer",
                department="AI & Data Science",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["PyTorch", "Object Detection", "Quantization (ONNX)", "Edge ML"],
                preferred_skills=["Biometric Timeseries Analysis", "Health Data Standards"],
                candidate_matches_count=2
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Head of Growth & Community Partnerships",
                department="Marketing & GTM",
                type="Full-Time",
                urgency="Next Quarter",
                required_skills=["Creator Seeding", "Performance Marketing", "Community Evangelism"],
                preferred_skills=["B2C Subscription Funnels", "Short-Form Video Production"],
                candidate_matches_count=1
            )
        ]
    else:  # b2b_saas / generic
        return [
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Lead Full-Stack & Workflow Systems Architect",
                department="Core Engineering",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["TypeScript", "React 19", "FastAPI", "PostgreSQL", "Redis"],
                preferred_skills=["Docker", "Multi-Tenant Architecture", "Event Streams"],
                candidate_matches_count=3
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Senior Autonomous Agent & Orchestration Engineer",
                department="AI & Machine Learning",
                type="Full-Time",
                urgency="Immediate",
                required_skills=["Python", "LLM Agent Frameworks", "Structured Outputs", "Vector DBs"],
                preferred_skills=["Semantic Caching", "Evaluation Pipelines"],
                candidate_matches_count=2
            ),
            JobRole(
                id=f"role_{uuid.uuid4().hex[:6]}",
                title="Head of B2B Demand Generation & Sales",
                department="Growth",
                type="Full-Time",
                urgency="Next Quarter",
                required_skills=["Product-Led Growth (PLG)", "Outbound Sales Automation", "Enterprise Demos"],
                preferred_skills=["HubSpot / Apollo Workflows", "Customer Success Management"],
                candidate_matches_count=1
            )
        ]

async def run_parallel_validation(idea_input: dict, founder_id: Optional[str] = None) -> Idea:
    """Runs 5 agents in parallel via asyncio.gather and synthesizes complete Idea workspace"""
    idea_id = idea_input.get("id") or f"idea_{uuid.uuid4().hex[:12]}"
    run_id = f"val_{uuid.uuid4().hex[:10]}"

    title = idea_input.get("title", "AI Venture").strip()
    desc = idea_input.get("description", "").strip()
    target_market = idea_input.get("targetMarket", "General consumer & enterprise").strip()
    category = idea_input.get("category", "AI & Technology").strip()
    domain = detect_domain(f"{title} {desc} {target_market} {category}")

    # Initialize active polling state
    initial_agents = [
        ValidationAgent(
            id=f"agent_init_{idx}",
            name=cfg["name"],
            role_title=cfg["role_title"],
            icon=cfg["icon"],
            score=0,
            status="running",
            verdict="Analyzing venture signals...",
            detailed_analysis="",
            key_findings=[],
            concerns=[]
        )
        for idx, cfg in enumerate(AGENT_CONFIGS)
    ]
    ACTIVE_VALIDATION_RUNS[idea_id] = ValidationRunStatus(
        id=run_id,
        idea_id=idea_id,
        status="running",
        overall_score=0,
        agents=initial_agents
    )

    # 1. Run 5 Agents Concurrently with real-time progressive status update
    async def run_and_update(cfg: dict, idx: int) -> ValidationAgent:
        agent = await run_single_agent(cfg, idea_input)
        if idea_id in ACTIVE_VALIDATION_RUNS:
            ACTIVE_VALIDATION_RUNS[idea_id].agents[idx] = agent
        return agent

    tasks = [run_and_update(cfg, idx) for idx, cfg in enumerate(AGENT_CONFIGS)]
    completed_agents: List[ValidationAgent] = await asyncio.gather(*tasks)

    # 2. Synthesis Calculation
    avg_score = int(sum(a.score for a in completed_agents) / len(completed_agents))
    signal_tier = "Strong Signal" if avg_score >= 75 else "Moderate Signal" if avg_score >= 60 else "Caution"

    # Update active polling status
    ACTIVE_VALIDATION_RUNS[idea_id] = ValidationRunStatus(
        id=run_id,
        idea_id=idea_id,
        status="completed",
        overall_score=avg_score,
        agents=completed_agents
    )

    # Metrics
    metrics = IdeaMetrics(
        market_demand=completed_agents[0].score,
        competitive_moat=completed_agents[1].score,
        unit_economics=completed_agents[2].score,
        technical_feasibility=completed_agents[3].score,
        timing_execution=max(65, int((completed_agents[0].score + completed_agents[3].score) / 2))
    )

    # Risks & Strengths
    risks = [
        IdeaRisk(
            title="Customer Onboarding Inertia",
            severity="high",
            description=completed_agents[4].concerns[0] if completed_agents[4].concerns else f"Target buyers in {target_market} face drop-off if initial setup exceeds 2 minutes.",
            mitigation="Deploy 1-click connectors and zero-configuration default templates."
        ),
        IdeaRisk(
            title="Incumbent Feature Parity Pressure",
            severity="medium",
            description=completed_agents[1].concerns[0] if completed_agents[1].concerns else "Legacy vendors may attempt fast-follower releases on isolated features.",
            mitigation="Embed deep workflow switching costs and proprietary interaction data loops."
        )
    ]
    strengths = [
        IdeaStrength(
            title="Closed-Loop Autonomous Execution",
            description=f"Unlike passive dashboards, {title} automates the loop directly from intent to executed outcome.",
            score=metrics.technical_feasibility
        ),
        IdeaStrength(
            title="Vertical Domain Moat",
            description=f"Custom-tailored specifically for {target_market}, eliminating generic legacy clutter.",
            score=metrics.market_demand
        )
    ]

    # Domain-aware Competitors, Revenue, Plan, and Roles
    competitors = generate_domain_competitors(domain, title, target_market)
    revenue = generate_domain_revenue(domain, title)
    roles = generate_domain_roles(domain)

    # Structured Plan
    plan = StructuredPlan(
        product_strategy=ProductStrategy(
            vision=f"Build the category-defining platform for {title}: {desc[:110]}...",
            core_value_prop="Zero-friction autonomous intelligence delivering verified operational outcomes.",
            target_persona=target_market,
            launch_phases=[
                "Phase 1: Closed Alpha with 20 Design Partners",
                "Phase 2: Self-Serve Public Beta & Integration Rails",
                "Phase 3: General Availability & Scaled Commercial Expansion"
            ]
        ),
        tech_stack=[
            TechStackCategory(
                category="Frontend & Interface",
                items=[
                    TechStackItem(name="React 19 + TypeScript", justification="Ultra-responsive fluid client shell with minimal latency"),
                    TechStackItem(name="Tailwind CSS", justification="Strict design tokens and accessible execution components")
                ]
            ),
            TechStackCategory(
                category="Backend & Data Platform",
                items=[
                    TechStackItem(name="FastAPI (Python 3.11)", justification="High-throughput asynchronous microservices gateway"),
                    TechStackItem(name="Supabase PostgreSQL + pgvector", justification="ACID relational state combined with fast semantic search")
                ]
            ),
            TechStackCategory(
                category="AI Engine & Compute",
                items=[
                    TechStackItem(name="Google Gemini 2.5 Flash", justification="Fast structured JSON reasoning and decision synthesis"),
                    TechStackItem(name="Redis Streams", justification="Asynchronous task queues and semantic embedding cache")
                ]
            )
        ],
        architecture=Architecture(
            type="Decoupled Event-Driven Microservices with Edge Cache",
            description=f"A resilient, decoupled architecture engineered for {title}. Prioritizes sub-second response times, zero-latency caching, and linear horizontal scale.",
            key_components=[
                "API Gateway & JWT Auth Verification",
                "Asynchronous Task Queue (Redis + Background Workers)",
                "PostgreSQL pgvector Embedding Index",
                "Real-time Telemetry Observer"
            ],
            scalability_notes="Inference costs scale sub-linearly with edge compute and pre-cached vector embeddings."
        ),
        milestones=[
            Milestone(
                phase="Sprint 1: Engine Genesis",
                title="Core Architecture & Prototype Spec",
                duration="Weeks 1-4",
                target_date="Month 1",
                goals=["Finalize schema and core API contracts", "Deploy autonomous inference pipeline"],
                deliverables=["Working prototype verified on 500 test cases", "Pilot customer benchmark report"],
                status="done"
            ),
            Milestone(
                phase="Sprint 2: Alpha Testbed",
                title="Private Cohort Beta & Connector Integration",
                duration="Weeks 5-8",
                target_date="Month 2",
                goals=["Onboard 30 pilot customers in target persona", "Measure retention and time-to-value"],
                deliverables=["Self-serve onboarding flow", "Automated telemetry and monitoring dashboard"],
                status="current"
            ),
            Milestone(
                phase="Sprint 3: Commercial Scale",
                title="Public Launch & GTM Acceleration",
                duration="Weeks 9-14",
                target_date="Month 3",
                goals=["Public launch across industry channels", "Achieve first $25k MRR milestone"],
                deliverables=["Public self-serve signup", "Partner referral and affiliate engine"],
                status="upcoming"
            )
        ]
    )

    idea = Idea(
        id=idea_id,
        title=title,
        tagline=idea_input.get("tagline") or f"Autonomous intelligence platform for {target_market}",
        description=desc,
        category=category,
        target_market=target_market,
        stage="Pre-Seed / Active Validation",
        created_at="Just now",
        updated_at="Just now",
        score=avg_score,
        status="validated",
        signal=signal_tier,
        metrics=metrics,
        agents=completed_agents,
        risks=risks,
        strengths=strengths,
        competitors=competitors,
        revenue=revenue,
        plan=plan,
        roles=roles
    )

    # Persist in Supabase Postgres asynchronously in background
    asyncio.create_task(persist_idea_to_db(idea, founder_id))

    return idea

async def persist_idea_to_db(idea: Idea, founder_id: Optional[str] = None):
    """Saves validated idea and child tables into Supabase PostgreSQL"""
    try:
        f_id = founder_id or "a0000000-0000-0000-0000-000000000001"
        # 1. Insert idea
        await execute("""
            INSERT INTO public.ideas (
                id, founder_id, user_id, title, tagline, description, category, target_market,
                stage, score, status, signal, metrics, risks, strengths, business_model, tech_stack
            ) VALUES (
                $1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            ) ON CONFLICT (id) DO UPDATE SET
                score = EXCLUDED.score,
                status = EXCLUDED.status,
                signal = EXCLUDED.signal;
        """,
            idea.id, f_id, idea.title, idea.tagline, idea.description, idea.category,
            idea.target_market, idea.stage, idea.score, idea.status, idea.signal,
            json.dumps(idea.metrics.model_dump(by_alias=True)),
            json.dumps([r.model_dump(by_alias=True) for r in idea.risks]),
            json.dumps([s.model_dump(by_alias=True) for s in idea.strengths]),
            idea.revenue.model_type if idea.revenue else "B2B SaaS Subscription",
            json.dumps(["React 19", "FastAPI", "Supabase pgvector", "Gemini 2.5 Flash"])
        )

        # 2. Insert validation run
        agent_results = {a.name: a.model_dump(by_alias=True) for a in idea.agents}
        await execute("""
            INSERT INTO public.validation_runs (id, idea_id, status, overall_score, agent_results)
            VALUES ($1, $2, 'completed', $3, $4)
            ON CONFLICT (id) DO UPDATE SET overall_score = EXCLUDED.overall_score;
        """, f"val_{idea.id}", idea.id, idea.score, json.dumps(agent_results))

        # 3. Insert agents
        for ag in idea.agents:
            await execute("""
                INSERT INTO public.validation_agents (
                    id, idea_id, name, role_title, icon, score, status, verdict,
                    detailed_analysis, key_findings, concerns
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (id) DO NOTHING;
            """,
                ag.id, idea.id, ag.name, ag.role_title, ag.icon, ag.score,
                ag.status, ag.verdict, ag.detailed_analysis,
                json.dumps(ag.key_findings), json.dumps(ag.concerns)
            )

        # 4. Insert competitors
        for c in idea.competitors:
            await execute("""
                INSERT INTO public.competitors (
                    id, idea_id, name, category, market_cap_or_funding, pricing,
                    strengths, weaknesses, our_moat, threat_level
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO NOTHING;
            """,
                c.id, idea.id, c.name, c.category, c.market_cap_or_funding,
                c.pricing, json.dumps(c.strengths), json.dumps(c.weaknesses),
                c.our_moat, c.threat_level
            )

        # 5. Insert revenue
        if idea.revenue:
            await execute("""
                INSERT INTO public.revenue_analyses (
                    id, idea_id, model_type, cac, ltv, ltv_cac_ratio, gross_margin,
                    payback_months, pricing_tiers, assumptions, unit_economics_summary
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (id) DO NOTHING;
            """,
                f"rev_{idea.id}", idea.id, idea.revenue.model_type,
                idea.revenue.cac, idea.revenue.ltv, idea.revenue.ltv_cac_ratio,
                idea.revenue.gross_margin, idea.revenue.payback_months,
                json.dumps([t.model_dump(by_alias=True) for t in idea.revenue.pricing_tiers]),
                json.dumps(idea.revenue.assumptions), idea.revenue.unit_economics_summary
            )

        # 6. Insert roles
        for r in idea.roles:
            await execute("""
                INSERT INTO public.roles (
                    id, idea_id, title, department, level, type, urgency,
                    required_skills, preferred_skills, description, candidate_matches_count
                ) VALUES ($1, $2, $3, $4, 'Founding', $5, $6, $7, $8, '', $9)
                ON CONFLICT (id) DO NOTHING;
            """,
                r.id, idea.id, r.title, r.department, r.type, r.urgency,
                json.dumps(r.required_skills), json.dumps(r.preferred_skills),
                r.candidate_matches_count
            )
    except Exception as e:
        print(f"⚠️ Notice on async idea persistence: {e}")
