export type UserRole = 'founder' | 'talent' | 'mentor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  headline: string;
  company?: string;
}

export type IdeaValidationStatus = 'validating' | 'validated' | 'needs_pivot' | 'rejected';
export type SignalTier = 'Strong Signal' | 'Moderate Signal' | 'Caution' | 'High Risk';

export interface ValidationAgent {
  id: string;
  name: string;
  roleTitle: string;
  icon: string;
  score: number;
  status: 'completed' | 'running' | 'pending' | 'flagged';
  verdict: string;
  detailedAnalysis: string;
  keyFindings: string[];
  concerns: string[];
}

export interface Competitor {
  id: string;
  name: string;
  category: 'Direct' | 'Indirect' | 'Legacy';
  marketCapOrFunding: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  ourMoat: string;
  threatLevel: 'Low' | 'Medium' | 'High';
}

export interface PricingTier {
  tier: string;
  price: string;
  billing: string;
  features: string[];
  recommended?: boolean;
}

export interface RevenueAnalysis {
  modelType: string;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  grossMargin: number;
  paybackMonths: number;
  pricingTiers: PricingTier[];
  assumptions: string[];
  unitEconomicsSummary: string;
}

export interface TechStackItem {
  name: string;
  justification: string;
  icon?: string;
}

export interface TechStackCategory {
  category: string;
  items: TechStackItem[];
}

export interface Milestone {
  phase: string;
  title: string;
  duration: string;
  targetDate: string;
  goals: string[];
  deliverables: string[];
  status: 'done' | 'current' | 'upcoming';
}

export interface StructuredPlan {
  productStrategy: {
    vision: string;
    coreValueProp: string;
    targetPersona: string;
    launchPhases: string[];
  };
  techStack: TechStackCategory[];
  architecture: {
    type: string;
    description: string;
    keyComponents: string[];
    scalabilityNotes: string;
  };
  milestones: Milestone[];
}

export interface JobRole {
  id: string;
  title: string;
  department: string;
  type: 'Full-Time' | 'Co-Founder' | 'Contract' | string;
  urgency: 'Immediate' | 'Next Quarter' | 'Post-Seed' | string;
  requiredSkills: string[];
  preferredSkills?: string[];
  candidateMatchesCount: number;
  salaryRange?: string;
  equityRange?: string;
  marketRationale?: string;
  marketDemandIndex?: number;
}

export interface CandidateSkill {
  name: string;
  matched: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  matchScore: number;
  experienceYears: number;
  location: string;
  currentCompany: string;
  skills: CandidateSkill[];
  bio: string;
  github: string;
  linkedin: string;
  outreachStatus: 'none' | 'contacted' | 'replied' | 'interviewing' | 'rejected' | 'accepted';
  appliedJobRoleId: string;
}

export interface OutreachMessage {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'opened' | 'responded';
  sentAt: string;
  stage: 'Drafts' | 'Sent' | 'In Conversation' | 'Offer / Hired';
}

export interface Idea {
  id: string;
  founderId?: string;
  userId?: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  targetMarket: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
  score: number;
  status: IdeaValidationStatus;
  signal: SignalTier;
  metrics: {
    marketDemand: number;
    unitEconomics: number;
    technicalFeasibility: number;
    competitiveMoat: number;
    timingExecution: number;
  };
  agents: ValidationAgent[];
  risks: {
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation: string;
  }[];
  strengths: {
    title: string;
    description: string;
    score: number;
  }[];
  competitors: Competitor[];
  revenue: RevenueAnalysis;
  plan: StructuredPlan;
  roles: JobRole[];
  marketAnalysis?: MarketAnalysis;
  agentDiscussions?: Record<string, AgentDiscussionMessage[]>;
}

export interface AgentDiscussionMessage {
  id: string;
  sender: 'user' | 'agent';
  agentName: string;
  subParameter?: string;
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  scoreNote?: string;
}

export interface TargetBuyerPersona {
  archetype: string;
  acutePain: string;
  budgetVector: string;
}

export interface GtmVector {
  id?: string;
  title: string;
  description: string;
  channel: string;
}

export interface LiveWebSource {
  title: string;
  snippet: string;
  sourceQuery?: string;
}

export interface MarketAnalysis {
  tam: string;
  sam: string;
  som?: string;
  cagr: string;
  optimalPriceTier: string;
  tamRationale?: string;
  targetBuyerPersona: TargetBuyerPersona;
  gtmVectors: GtmVector[];
  liveSources: LiveWebSource[];
  fetchedAt?: string;
}

export interface TalentProfile {
  id: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  experienceYears: number;
  skills: string[];
  resumeFileName?: string;
  parsedAt?: string;
  agents?: ValidationAgent[];
}

export interface StartupMatch {
  id: string;
  startupName: string;
  role: string;
  matchPercentage: number;
  fundingStage: string;
  location: string;
  equityRange: string;
  salaryRange: string;
  keySkillsMatched: string[];
  missingSkills: string[];
  companyBio: string;
  founderName: string;
  logoUrl?: string;
}

export interface Application {
  id: string;
  companyName: string;
  role: string;
  appliedDate: string;
  status: 'Under Review' | 'Interviewing' | 'Offer' | 'Rejected';
  matchPercentage: number;
  hasReport: boolean;
  stageInfo?: string;
}

export interface LearningWeek {
  week: number;
  title: string;
  focus: string;
  tasks: string[];
  status: 'completed' | 'current' | 'upcoming';
}

export interface RejectionReport {
  id: string;
  applicationId: string;
  roleTitle: string;
  companyName: string;
  stage: string;
  decisionDate: string;
  primaryReason: string;
  summary: string;
  severity: 'minor' | 'moderate' | 'major';
  missingSkills: {
    skill: string;
    gapDescription: string;
    severity: 'minor' | 'moderate' | 'major';
    recommendedResource: string;
  }[];
  focusAreas: {
    title: string;
    description: string;
    benchmark: string;
  }[];
  targetReEvaluationDate: string;
  weeksRemaining: number;
  learningTimeline: LearningWeek[];
  recommendedMentorId?: string;
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  domains: string[];
  pastExits: string[];
  availability: string;
  availableSlots: string[];
}

export interface MentorRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  founderName: string;
  startupName: string;
  topic: string;
  message: string;
  proposedTime: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

export interface PageContextType {
  pageKey: string;
  title: string;
  summary: string;
  data?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickActions?: string[];
}
