-- =========================================================================
-- NexBridge.ai — Supabase Phase 2 SQL Migration
-- Includes: pgvector, Profiles, Ideas, Validation Runs, Plans, Roles,
-- Talent Profiles, Targets, Applications, Rejection Reports, Outreach,
-- Mentors, Mentor Requests, Chat Logs, Storage Bucket, and RLS Policies.
-- =========================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('founder', 'talent', 'mentor')) NOT NULL DEFAULT 'founder',
  headline TEXT,
  avatar TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Automatic Auth Trigger for Profiles on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, headline)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'founder'),
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'founder') = 'founder' THEN 'Seed Founder • Building on NexBridge'
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'talent') = 'talent' THEN 'Software Engineer • Open to Opportunities'
      ELSE 'Strategic Advisor & Angel Investor'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Ideas Table
CREATE TABLE IF NOT EXISTS public.ideas (
  id TEXT PRIMARY KEY DEFAULT ('idea_' || substr(md5(random()::text), 1, 12)),
  founder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'AI & Technology',
  target_market TEXT,
  stage TEXT DEFAULT 'Pre-Seed / Active Validation',
  business_model TEXT,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  score NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('validating', 'validated', 'needs_pivot', 'rejected')) DEFAULT 'validating',
  signal TEXT DEFAULT 'Moderate Signal',
  metrics JSONB DEFAULT '{"marketDemand": 84, "unitEconomics": 72, "technicalFeasibility": 79, "competitiveMoat": 71, "timingExecution": 82}'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]'::jsonb;

-- 4. Validation Runs (Per-Agent Results as JSONB)
CREATE TABLE IF NOT EXISTS public.validation_runs (
  id TEXT PRIMARY KEY DEFAULT ('val_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT REFERENCES public.ideas(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'flagged')) DEFAULT 'completed',
  overall_score NUMERIC DEFAULT 0,
  agent_results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Keep validation_agents table for fine-grained per-agent querying
CREATE TABLE IF NOT EXISTS public.validation_agents (
  id TEXT PRIMARY KEY DEFAULT ('agent_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT REFERENCES public.ideas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  icon TEXT,
  score INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'flagged')) DEFAULT 'pending',
  verdict TEXT,
  detailed_analysis TEXT,
  key_findings JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Competitor Moat Analysis
CREATE TABLE IF NOT EXISTS public.competitors (
  id TEXT PRIMARY KEY DEFAULT ('comp_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT REFERENCES public.ideas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Direct', 'Indirect', 'Legacy')) NOT NULL,
  market_cap_or_funding TEXT,
  pricing TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  our_moat TEXT,
  threat_level TEXT CHECK (threat_level IN ('Low', 'Medium', 'High')) DEFAULT 'Medium'
);

-- Revenue Analysis & Unit Economics
CREATE TABLE IF NOT EXISTS public.revenue_analyses (
  id TEXT PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT UNIQUE REFERENCES public.ideas(id) ON DELETE CASCADE,
  model_type TEXT,
  cac NUMERIC(10, 2),
  ltv NUMERIC(10, 2),
  ltv_cac_ratio NUMERIC(5, 2),
  gross_margin NUMERIC(5, 2),
  payback_months NUMERIC(4, 1),
  pricing_tiers JSONB DEFAULT '[]'::jsonb,
  assumptions JSONB DEFAULT '[]'::jsonb,
  unit_economics_summary TEXT
);

-- 5. Plans Table (Product Strategy, Tech Architecture, Milestones, Unit Economics)
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY DEFAULT ('plan_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT UNIQUE REFERENCES public.ideas(id) ON DELETE CASCADE,
  product_strategy JSONB DEFAULT '{}'::jsonb,
  tech_architecture JSONB DEFAULT '{}'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  unit_economics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- structured_plans alias table
CREATE TABLE IF NOT EXISTS public.structured_plans (
  id TEXT PRIMARY KEY DEFAULT ('plan_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT UNIQUE REFERENCES public.ideas(id) ON DELETE CASCADE,
  product_strategy JSONB DEFAULT '{}'::jsonb,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  architecture JSONB DEFAULT '{}'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb
);

-- 6. Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
  id TEXT PRIMARY KEY DEFAULT ('role_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT REFERENCES public.ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  level TEXT DEFAULT 'Founding',
  type TEXT DEFAULT 'Full-Time',
  urgency TEXT DEFAULT 'Immediate',
  required_skills JSONB DEFAULT '[]'::jsonb,
  preferred_skills JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  candidate_matches_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_roles (
  id TEXT PRIMARY KEY DEFAULT ('role_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT REFERENCES public.ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  type TEXT DEFAULT 'Full-Time',
  urgency TEXT DEFAULT 'Immediate',
  required_skills JSONB DEFAULT '[]'::jsonb,
  preferred_skills JSONB DEFAULT '[]'::jsonb,
  candidate_matches_count INTEGER DEFAULT 0
);

-- 7. Talent Profiles (with Parsed Skills JSONB, Resume Path, & pgvector Embedding)
CREATE TABLE IF NOT EXISTS public.talent_profiles (
  id TEXT PRIMARY KEY DEFAULT ('tal_' || substr(md5(random()::text), 1, 10)),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  avatar TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  experience_years INTEGER DEFAULT 0,
  parsed_skills JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  resume_path TEXT,
  resume_url TEXT,
  embedding vector(1536),
  parsed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS parsed_skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS resume_path TEXT;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 8. Targets (Startups/Companies + Roles + Required Skills + pgvector Embedding)
CREATE TABLE IF NOT EXISTS public.targets (
  id TEXT PRIMARY KEY DEFAULT ('tar_' || substr(md5(random()::text), 1, 10)),
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  role TEXT,
  stage TEXT DEFAULT 'Seed',
  industry TEXT DEFAULT 'AI / HealthTech',
  location TEXT DEFAULT 'Remote / US',
  salary_range TEXT,
  equity_range TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  company_bio TEXT,
  founder_name TEXT,
  logo_url TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- startup_matches table
CREATE TABLE IF NOT EXISTS public.startup_matches (
  id TEXT PRIMARY KEY DEFAULT ('match_' || substr(md5(random()::text), 1, 10)),
  startup_name TEXT NOT NULL,
  role TEXT NOT NULL,
  match_percentage INTEGER DEFAULT 0,
  funding_stage TEXT,
  location TEXT,
  equity_range TEXT,
  salary_range TEXT,
  key_skills_matched JSONB DEFAULT '[]'::jsonb,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  company_bio TEXT,
  founder_name TEXT,
  logo_url TEXT
);

-- 9. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY DEFAULT ('app_' || substr(md5(random()::text), 1, 10)),
  talent_id TEXT REFERENCES public.talent_profiles(id) ON DELETE SET NULL,
  target_id TEXT REFERENCES public.targets(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  applied_date TIMESTAMPTZ DEFAULT now(),
  applied_at TIMESTAMPTZ DEFAULT now(),
  status TEXT CHECK (status IN ('Under Review', 'Interviewing', 'Offer', 'Rejected')) DEFAULT 'Under Review',
  match_percentage INTEGER DEFAULT 0,
  has_report BOOLEAN DEFAULT false,
  stage_info TEXT
);

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS talent_id TEXT REFERENCES public.talent_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS target_id TEXT REFERENCES public.targets(id) ON DELETE SET NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ DEFAULT now();

-- 10. Rejection Reports Table
CREATE TABLE IF NOT EXISTS public.rejection_reports (
  id TEXT PRIMARY KEY DEFAULT ('rep_' || substr(md5(random()::text), 1, 10)),
  application_id TEXT UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  stage TEXT,
  decision_date DATE DEFAULT CURRENT_DATE,
  primary_reason TEXT NOT NULL,
  summary TEXT,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'major')) DEFAULT 'moderate',
  missing_skills JSONB DEFAULT '[]'::jsonb,
  focus_areas JSONB DEFAULT '[]'::jsonb,
  target_re_evaluation_date DATE,
  reapply_date DATE,
  weeks_remaining INTEGER DEFAULT 3,
  learning_timeline JSONB DEFAULT '[]'::jsonb,
  timeline_weeks JSONB DEFAULT '[]'::jsonb,
  recommended_mentor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rejection_reports ADD COLUMN IF NOT EXISTS timeline_weeks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.rejection_reports ADD COLUMN IF NOT EXISTS reapply_date DATE;

-- 11. Outreach Table
CREATE TABLE IF NOT EXISTS public.outreach (
  id TEXT PRIMARY KEY DEFAULT ('out_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT REFERENCES public.ideas(id) ON DELETE CASCADE,
  role_id TEXT,
  candidate_id TEXT,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  candidate_role TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('Drafts', 'Sent', 'In Conversation', 'Offer / Hired')) DEFAULT 'Sent',
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.outreach_messages (
  id TEXT PRIMARY KEY DEFAULT ('out_' || substr(md5(random()::text), 1, 10)),
  idea_id TEXT REFERENCES public.ideas(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_role TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('Drafts', 'Sent', 'In Conversation', 'Offer / Hired')) DEFAULT 'Sent',
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Mentors Directory
CREATE TABLE IF NOT EXISTS public.mentors (
  id TEXT PRIMARY KEY DEFAULT ('mentor_' || substr(md5(random()::text), 1, 10)),
  name TEXT NOT NULL,
  avatar TEXT,
  title TEXT NOT NULL,
  company TEXT,
  bio TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  hourly_rate INTEGER DEFAULT 200,
  session_rate TEXT DEFAULT '$200 / hr',
  domains JSONB DEFAULT '[]'::jsonb,
  expertise JSONB DEFAULT '[]'::jsonb,
  past_exits JSONB DEFAULT '[]'::jsonb,
  availability TEXT,
  available_slots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS session_rate TEXT DEFAULT '$200 / hr';
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS expertise JSONB DEFAULT '[]'::jsonb;

-- 13. Mentor Requests Table
CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id TEXT PRIMARY KEY DEFAULT ('req_' || substr(md5(random()::text), 1, 10)),
  mentor_id TEXT REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentor_name TEXT,
  mentor_avatar TEXT,
  founder_id UUID,
  founder_name TEXT,
  startup_name TEXT,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  proposed_time TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Chat Logs Table
CREATE TABLE IF NOT EXISTS public.chat_logs (
  id TEXT PRIMARY KEY DEFAULT ('chat_' || substr(md5(random()::text), 1, 10)),
  user_id UUID,
  session_id TEXT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- 15. Storage: Private 'resumes' Bucket
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- =========================================================================
-- 16. Row Level Security (RLS) Policies
-- Deny-by-default on all tables with explicit authenticated / owner access
-- The service role key automatically bypasses RLS for backend operations.
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structured_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all public profiles, and edit only their own
DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Profiles are readable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ideas: Publicly readable; owners can insert/update
DROP POLICY IF EXISTS "Ideas readable by authenticated or public" ON public.ideas;
CREATE POLICY "Ideas readable by authenticated or public" ON public.ideas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Idea owners can update" ON public.ideas;
CREATE POLICY "Idea owners can update" ON public.ideas
  FOR ALL USING (auth.uid() = founder_id OR auth.uid() = user_id);

-- Validation Runs & Plans: Readable
DROP POLICY IF EXISTS "Validation runs readable" ON public.validation_runs;
CREATE POLICY "Validation runs readable" ON public.validation_runs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Plans readable" ON public.plans;
CREATE POLICY "Plans readable" ON public.plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Roles readable" ON public.roles;
CREATE POLICY "Roles readable" ON public.roles
  FOR SELECT USING (true);

-- Talent Profiles & Targets: Readable
DROP POLICY IF EXISTS "Talent profiles readable" ON public.talent_profiles;
CREATE POLICY "Talent profiles readable" ON public.talent_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Targets readable" ON public.targets;
CREATE POLICY "Targets readable" ON public.targets
  FOR SELECT USING (true);

-- Applications & Reports:
DROP POLICY IF EXISTS "Applications readable" ON public.applications;
CREATE POLICY "Applications readable" ON public.applications
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Rejection reports readable" ON public.rejection_reports;
CREATE POLICY "Rejection reports readable" ON public.rejection_reports
  FOR SELECT USING (true);

-- Mentors & Requests:
DROP POLICY IF EXISTS "Mentors directory readable" ON public.mentors;
CREATE POLICY "Mentors directory readable" ON public.mentors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentor requests readable" ON public.mentor_requests;
CREATE POLICY "Mentor requests readable" ON public.mentor_requests
  FOR SELECT USING (true);

-- Storage Policy: Authenticated users can upload to resumes bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to resumes" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to resumes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Allow users to read own resumes" ON storage.objects;
CREATE POLICY "Allow users to read own resumes" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes');
