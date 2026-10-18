from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# =========================================================================
# Auth & User
# =========================================================================
UserRole = Literal['founder', 'talent', 'mentor']

class User(CamelModel):
    id: str
    name: str
    email: str
    role: UserRole
    avatar: str = ""
    headline: str = ""
    company: Optional[str] = None

class LoginRequest(CamelModel):
    email: str
    password: str
    role: Optional[UserRole] = None

class SignUpRequest(CamelModel):
    email: str
    password: str
    role: UserRole = "founder"
    name: Optional[str] = None

class AuthResponse(CamelModel):
    user: User
    access_token: str
    token_type: str = "bearer"

class SwitchRoleRequest(CamelModel):
    role: UserRole

# =========================================================================
# Validation & Agents
# =========================================================================
AgentName = Literal[
    'Market Analyst',
    'Competitor Researcher',
    'Revenue Critic',
    'Technical Architect',
    'Skeptic'
]

class ValidationAgent(CamelModel):
    id: str
    name: str
    role_title: str
    icon: str
    score: int
    status: Literal['completed', 'running', 'pending', 'flagged']
    verdict: str
    detailed_analysis: str
    key_findings: List[str] = []
    concerns: List[str] = []

class ValidationRunStatus(CamelModel):
    id: str
    idea_id: str
    status: Literal['pending', 'running', 'completed', 'flagged']
    overall_score: float | int
    agents: List[ValidationAgent] = []

# =========================================================================
# Competitors & Revenue
# =========================================================================
class Competitor(CamelModel):
    id: str
    name: str
    category: Literal['Direct', 'Indirect', 'Legacy']
    market_cap_or_funding: str
    pricing: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    our_moat: str
    threat_level: Literal['Low', 'Medium', 'High']

class PricingTier(CamelModel):
    tier: str
    price: str
    billing: str
    features: List[str] = []
    recommended: Optional[bool] = False

class RevenueAnalysis(CamelModel):
    model_type: str
    cac: float
    ltv: float
    ltv_cac_ratio: float
    gross_margin: float
    payback_months: float
    pricing_tiers: List[PricingTier] = []
    assumptions: List[str] = []
    unit_economics_summary: str

# =========================================================================
# Plan & Roles
# =========================================================================
class TechStackItem(CamelModel):
    name: str
    justification: str
    icon: Optional[str] = None

class TechStackCategory(CamelModel):
    category: str
    items: List[TechStackItem] = []

class Milestone(CamelModel):
    phase: str
    title: str
    duration: str
    target_date: str
    goals: List[str] = []
    deliverables: List[str] = []
    status: Literal['done', 'current', 'upcoming'] = 'upcoming'

    @field_validator('status', mode='before')
    @classmethod
    def normalize_status(cls, v):
        if not v:
            return 'upcoming'
        s = str(v).strip().lower()
        if s in ('done', 'completed', 'complete', 'finished'):
            return 'done'
        if s in ('current', 'in progress', 'in_progress', 'active'):
            return 'current'
        return 'upcoming'

class ProductStrategy(CamelModel):
    vision: str
    core_value_prop: str
    target_persona: str
    launch_phases: List[str] = []

class Architecture(CamelModel):
    type: str
    description: str
    key_components: List[str] = []
    scalability_notes: str

class StructuredPlan(CamelModel):
    product_strategy: ProductStrategy
    tech_stack: List[TechStackCategory] = []
    architecture: Architecture
    milestones: List[Milestone] = []

class JobRole(CamelModel):
    id: str
    title: str
    department: str
    type: str = 'Full-Time'
    urgency: str = 'Immediate'
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    candidate_matches_count: int = 0
    salary_range: Optional[str] = '₹24L - ₹36L / yr'
    equity_range: Optional[str] = '1.5% - 3.0%'
    market_rationale: Optional[str] = 'Key founding hire required to build core product and execute pilot milestones.'
    market_demand_index: Optional[int] = 88

# =========================================================================
# Ideas
# =========================================================================
IdeaValidationStatus = Literal['validating', 'validated', 'needs_pivot', 'rejected']
SignalTier = Literal['Strong Signal', 'Moderate Signal', 'Caution', 'High Risk']

class IdeaMetrics(CamelModel):
    market_demand: int = 80
    unit_economics: int = 70
    technical_feasibility: int = 80
    competitive_moat: int = 70
    timing_execution: int = 80

class IdeaRisk(CamelModel):
    title: str
    severity: Literal['low', 'medium', 'high', 'critical'] = 'medium'
    description: str
    mitigation: str

class IdeaStrength(CamelModel):
    title: str
    description: str
    score: int = 85

class TargetBuyerPersona(CamelModel):
    archetype: str
    acute_pain: str
    budget_vector: str

class GtmVector(CamelModel):
    id: str
    title: str
    description: str
    channel: str

class LiveWebSource(CamelModel):
    title: str
    snippet: str
    source_query: Optional[str] = None

class MarketAnalysis(CamelModel):
    tam: str = "₹18,500 Cr ($2.2B)"
    sam: str = "₹4,200 Cr ($500M)"
    som: Optional[str] = "₹580 Cr ($70M)"
    cagr: str = "+22.4% YoY"
    optimal_price_tier: str = "₹799 / mo"
    tam_rationale: Optional[str] = "Derived from real-time web search and market intelligence."
    target_buyer_persona: TargetBuyerPersona
    gtm_vectors: List[GtmVector] = []
    live_sources: List[LiveWebSource] = []
    fetched_at: Optional[str] = None

class Idea(CamelModel):
    id: str
    founder_id: Optional[str] = None
    user_id: Optional[str] = None
    title: str
    tagline: str = ""
    description: str
    category: str = "AI & Technology"
    target_market: str = ""
    stage: str = "Pre-Seed / Active Validation"
    created_at: str
    updated_at: str
    score: float | int = 75.0
    status: IdeaValidationStatus = "validated"
    signal: SignalTier = "Strong Signal"
    metrics: IdeaMetrics = IdeaMetrics()
    agents: List[ValidationAgent] = []
    risks: List[IdeaRisk] = []
    strengths: List[IdeaStrength] = []
    competitors: List[Competitor] = []
    revenue: Optional[RevenueAnalysis] = None
    plan: Optional[StructuredPlan] = None
    roles: List[JobRole] = []
    market_analysis: Optional[MarketAnalysis] = None
    agent_discussions: Optional[Dict[str, List[dict]]] = None

class AgentDiscussionMessage(CamelModel):
    id: str
    sender: Literal['user', 'agent']
    agent_name: str
    sub_parameter: Optional[str] = None
    content: str
    timestamp: str
    suggested_follow_ups: Optional[List[str]] = []
    score_note: Optional[str] = None

class AgentDiscussionRequest(CamelModel):
    message: str
    sub_parameter: Optional[str] = None
    history: List[dict] = []

class CreateIdeaRequest(CamelModel):
    id: Optional[str] = None
    title: str
    tagline: Optional[str] = ""
    description: str
    category: Optional[str] = "AI & Technology"
    target_market: Optional[str] = "Tech & Health enthusiasts"


# =========================================================================
# Candidates & Outreach
# =========================================================================
class CandidateSkill(CamelModel):
    name: str
    matched: bool = True

class Candidate(CamelModel):
    id: str
    name: str
    avatar: str = ""
    role: str
    match_score: int
    experience_years: int
    location: str
    current_company: str = "Freelance"
    skills: List[CandidateSkill] = []
    bio: str
    github: str = ""
    linkedin: str = ""
    outreach_status: Literal['none', 'contacted', 'replied', 'interviewing', 'rejected', 'accepted'] = 'none'
    applied_job_role_id: str = ""

class OutreachMessage(CamelModel):
    id: str
    candidate_id: str
    candidate_name: str
    candidate_role: str
    subject: str
    body: str
    status: Literal['draft', 'sent', 'opened', 'responded'] = 'sent'
    sent_at: str
    stage: Literal['Drafts', 'Sent', 'In Conversation', 'Offer / Hired'] = 'Sent'

class SendOutreachRequest(CamelModel):
    candidate_id: str
    candidate_name: str
    candidate_role: str
    subject: str
    body: str

class UpdateStageRequest(CamelModel):
    stage: Literal['Drafts', 'Sent', 'In Conversation', 'Offer / Hired']

# =========================================================================
# Talent & Matching
# =========================================================================
class TalentProfile(CamelModel):
    id: str
    name: str
    headline: str
    bio: str
    location: str
    experience_years: int
    skills: List[str] = []
    resume_file_name: Optional[str] = None
    parsed_at: Optional[str] = None
    agents: List[ValidationAgent] = []

class ParsedProfile(CamelModel):
    name: str
    headline: str
    bio: str
    location: str
    experience_years: int
    skills: List[str] = []

class StartupMatch(CamelModel):
    id: str
    startup_name: str
    role: str
    match_percentage: int
    funding_stage: str
    location: str
    equity_range: str
    salary_range: str
    key_skills_matched: List[str] = []
    missing_skills: List[str] = []
    company_bio: str
    founder_name: str
    logo_url: Optional[str] = None

class Application(CamelModel):
    id: str
    company_name: str
    role: str
    applied_date: str
    status: Literal['Under Review', 'Interviewing', 'Offer', 'Rejected']
    match_percentage: int
    has_report: bool = False
    stage_info: Optional[str] = None

class LearningWeek(CamelModel):
    week: int
    title: str
    focus: str
    tasks: List[str] = []
    status: Literal['completed', 'current', 'upcoming']

class MissingSkillDetail(CamelModel):
    skill: str
    gap_description: str
    severity: Literal['minor', 'moderate', 'major']
    recommended_resource: str

class FocusArea(CamelModel):
    title: str
    description: str
    benchmark: str

class RejectionReport(CamelModel):
    id: str
    application_id: str
    role_title: str
    company_name: str
    stage: str
    decision_date: str
    primary_reason: str
    summary: str
    severity: Literal['minor', 'moderate', 'major']
    missing_skills: List[MissingSkillDetail] = []
    focus_areas: List[FocusArea] = []
    target_re_evaluation_date: str
    weeks_remaining: int
    learning_timeline: List[LearningWeek] = []
    recommended_mentor_id: Optional[str] = None

# =========================================================================
# Mentors & Advisory
# =========================================================================
class Mentor(CamelModel):
    id: str
    name: str
    avatar: str
    title: str
    company: str
    bio: str
    rating: float
    reviews_count: int
    hourly_rate: int
    domains: List[str] = []
    past_exits: List[str] = []
    availability: str
    available_slots: List[str] = []

class MentorRequest(CamelModel):
    id: str
    mentor_id: str
    mentor_name: str
    mentor_avatar: str = ""
    founder_name: str
    startup_name: str
    topic: str
    message: str
    proposed_time: str
    status: Literal['pending', 'accepted', 'declined', 'completed'] = 'pending'
    created_at: str

class RequestSessionPayload(CamelModel):
    mentor_id: str
    topic: str
    message: str
    proposed_time: str
    founder_name: Optional[str] = "Aarav Patel"
    startup_name: Optional[str] = "NutriFit AI"

class UpdateMentorStatusPayload(CamelModel):
    status: Literal['accepted', 'declined', 'completed']

# =========================================================================
# Context-Aware Chatbot
# =========================================================================
class PageContextType(CamelModel):
    page_key: str
    title: str
    summary: str
    data: Optional[Any] = None

class ChatMessage(CamelModel):
    id: str
    sender: Literal['user', 'assistant']
    content: str
    timestamp: str
    quick_actions: Optional[List[str]] = []

class ChatSendPayload(CamelModel):
    message: str
    context: PageContextType
    history: List[ChatMessage] = []
