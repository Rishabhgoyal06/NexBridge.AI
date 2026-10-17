#!/usr/bin/env python3
"""
NexBridge.ai — Supabase Seed Script (Phase 2 & Phase 3)
Populates:
- 25 Talent Profiles
- 12 Startups / Targets with Roles
- 8 Mentors & Advisors
- 1 Demo Idea ("NutriFit AI") with complete 5-agent precomputed validation results,
  competitors, unit economics, structured plans, roles, applications, rejection reports,
  and outreach pipeline.
"""

import os
import json
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
db_url = os.getenv("DATABASE_URL")
pooler_url = "postgresql://postgres.btdtaxpffwjzxyiwzvzq:5%4094Pc%21zk%236@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
except Exception as e:
    print(f"⚠️ Direct DB connection error, falling back to Supabase IPv4 pooler...")
    conn = psycopg2.connect(pooler_url)

conn.autocommit = True
cur = conn.cursor()

print("🚀 Starting NexBridge.ai Supabase Seed Script (Python)...")

# =========================================================================
# 1. Seed Demo Profiles
# =========================================================================
print("👤 Seeding Profiles...")
cur.execute("""
INSERT INTO public.profiles (id, email, name, role, headline, avatar, company)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'aarav@nexbridge.ai', 'Aarav Patel', 'founder', 'Seed Founder • Building NutriFit AI', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', 'NutriFit AI'),
  ('a0000000-0000-0000-0000-000000000002', 'taras@hyperscale.io', 'Taras Kowalski', 'talent', 'Staff Distributed Systems Architect • Open to Roles', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', 'Freelance'),
  ('a0000000-0000-0000-0000-000000000003', 'marcus@vance.io', 'Marcus Vance', 'mentor', 'Angel Investor & Product Advisor • Vance Advisory', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', 'Vance Advisory')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  headline = EXCLUDED.headline,
  avatar = EXCLUDED.avatar;
""")

# =========================================================================
# 2. Seed 25 Talent Profiles
# =========================================================================
print("💼 Seeding 25 Talent Profiles...")
talents = [
    ("tal_01", "Taras Kowalski", "taras@hyperscale.io", "Staff Distributed Systems Architect", "Specialized in asynchronous distributed protocols, Linux eBPF telemetry, and sub-millisecond low-latency proxy architectures in Rust and Go.", "San Francisco, CA", 8, ["Distributed Systems", "Rust", "Go", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Linux eBPF", "Raft Consensus"], "taras_kowalski_staff_systems_resume.pdf"),
    ("tal_02", "Elena Rostova", "elena.rostova@techmail.com", "Staff Mobile Architect & Cross-Platform Lead", "Specialized in sub-60fps React Native rendering, Swift CoreML bridging, and HealthKit background synchronization.", "Austin, TX", 7, ["React Native", "Swift", "CoreML", "HealthKit", "TypeScript", "Redux Toolkit", "GraphQL"], "elena_rostova_mobile_lead.pdf"),
    ("tal_03", "Dr. Devin Zhao", "devin.zhao@visionlabs.org", "Senior Computer Vision Engineer", "Specialized in real-time food and retail item recognition under challenging lighting. Author of 3 CVPR papers on zero-shot instance segmentation.", "Seattle, WA", 6, ["PyTorch", "OpenCV", "TensorRT", "YOLOv8", "CoreML", "Python", "C++", "Edge AI"], "devin_zhao_cv_phd.pdf"),
    ("tal_04", "Priya Sharma", "priya.sharma@growthpilot.co", "Founding GTM & Athletic Community Lead", "Scaled Whoop affiliate program from $2M to $18M ARR by building authentic ambassador networks with competitive athletes.", "New York, NY", 5, ["Community Growth", "Affiliate Partnerships", "Athletic GTM", "Klaviyo", "Notion", "HubSpot", "CAC Optimization"], "priya_sharma_gtm_lead.pdf"),
    ("tal_05", "Liam Chen", "liam.chen@distrib.io", "Cloud Infrastructure & Site Reliability Lead", "Built Kubernetes microservice meshes processing 120k requests/sec with 99.995% uptime.", "San Jose, CA", 9, ["Kubernetes", "Terraform", "AWS", "Prometheus", "Golang", "Grafana", "Helm"], "liam_chen_sre.pdf"),
    ("tal_06", "Sophia Dubois", "sophia.dubois@ai-foundry.eu", "Senior Applied LLM Researcher", "Focused on RAG pipelines, semantic caching, and LLM fine-tuning for biomedical diagnosis.", "Paris, France", 5, ["LangChain", "LlamaIndex", "HuggingFace", "Python", "Vector Databases", "Qdrant", "vLLM"], "sophia_dubois_llm.pdf"),
    ("tal_07", "Alex Rivera", "alex.rivera@finsec.net", "Principal Rust Security & Cryptography Engineer", "Audited multi-sig smart contracts and low-level cryptographic protocols for sovereign finance.", "Miami, FL", 10, ["Rust", "Zero-Knowledge Proofs", "Cryptography", "C++", "Memory Safety", "Wasm"], "alex_rivera_security.pdf"),
    ("tal_08", "Maya Patel", "maya.patel@uxprecision.design", "Lead Product Designer & Design Systems Architect", "Designed high-density financial interfaces and consumer health apps with 4.9 App Store ratings.", "Chicago, IL", 6, ["Figma", "Design Systems", "Prototyping", "Tailwind CSS", "User Research", "Micro-interactions"], "maya_patel_ux.pdf"),
    ("tal_09", "James Wilson", "james.wilson@healthdev.io", "Lead iOS CoreAudio & Sensor Specialist", "Engineered real-time respiratory rate estimators using accelerometer and microphone sensors on Apple Watch.", "Boston, MA", 8, ["Swift", "CoreAudio", "CoreMotion", "WatchOS", "C++", "DSP"], "james_wilson_ios.pdf"),
    ("tal_10", "Aisha Al-Mansoor", "aisha.mansoor@datalake.ae", "Staff Data Architect & Pipeline Lead", "Architected real-time Kafka event streams aggregating 500 million daily telemetry points.", "Dubai, UAE", 7, ["Apache Kafka", "ClickHouse", "dbt", "Snowflake", "Python", "Airflow", "SQL"], "aisha_mansoor_data.pdf"),
    ("tal_11", "Lucas Novak", "lucas.novak@kernelops.cz", "eBPF Kernel & Low-Latency Network Engineer", "Author of open-source XDP packet filters mitigating DDoS spikes in kernel space.", "Prague, Czechia", 7, ["C", "eBPF", "Linux Kernel", "BGP", "Rust", "WireGuard"], "lucas_novak_ebpf.pdf"),
    ("tal_12", "Chloe Bennett", "chloe.bennett@growthlab.com", "Head of Product Marketing", "Led product launches for 3 B2B AI SaaS unicorns resulting in $40M total ARR pipelines.", "London, UK", 8, ["Product Marketing", "Positioning", "Competitive Intelligence", "Sales Enablement", "Content Strategy"], "chloe_bennett_pmm.pdf"),
    ("tal_13", "Mateo Rossi", "mateo.rossi@robotics-ai.it", "Robotics Navigation & SLAM Specialist", "Developed LiDAR-inertial odometry packages for autonomous delivery robots in urban terrain.", "Turin, Italy", 6, ["ROS2", "SLAM", "C++", "Point Cloud Library", "Gazebo", "Python"], "mateo_rossi_slam.pdf"),
    ("tal_14", "Emily Zhang", "emily.zhang@finai.ca", "Quantitative Risk & Financial Modeling Lead", "Built Monte Carlo simulation engines and unit economic projections for Series B fintechs.", "Toronto, Canada", 7, ["Python", "NumPy", "Pandas", "Stochastic Calculus", "SQL", "Tableau"], "emily_zhang_quant.pdf"),
    ("tal_15", "Vikram Malhotra", "vikram.m@cloudscale.in", "Senior Full-Stack TypeScript Architect", "Created low-latency real-time collaboration engines using WebSockets, CRDTs, and Node.", "Bangalore, India", 6, ["TypeScript", "Node.js", "React", "Next.js", "CRDTs", "PostgreSQL", "Docker"], "vikram_malhotra_ts.pdf"),
    ("tal_16", "Hannah Schmidt", "hannah.schmidt@berlin-nlp.de", "NLP & Multi-Lingual Entity Extraction Lead", "Trained domain-adapted BERT models for automated contract clause parsing across 8 languages.", "Berlin, Germany", 6, ["PyTorch", "spaCy", "Transformers", "FastAPI", "Docker", "Python"], "hannah_schmidt_nlp.pdf"),
    ("tal_17", "Diego Santos", "diego.santos@latamtech.br", "Full-Stack React Native & Golang Engineer", "Shipped offline-first logistics app deployed across 40,000 field technicians in South America.", "São Paulo, Brazil", 5, ["React Native", "Golang", "SQLite", "WatermelonDB", "GraphQL"], "diego_santos_mobile.pdf"),
    ("tal_18", "Zara Khan", "zara.khan@biogen.sg", "Bioinformatics & Genomic Pipeline Architect", "Developed Nextflow cloud workflows for variant calling on whole-genome sequencing cohorts.", "Singapore", 7, ["Python", "Nextflow", "AWS Batch", "BioPython", "R", "Docker"], "zara_khan_bio.pdf"),
    ("tal_19", "Noah Kim", "noah.kim@seoul-embedded.kr", "Embedded Firmware & Sensor Fusion Engineer", "Designed ultra-low-power BLE sensor hubs with 18-month coin cell battery longevity.", "Seoul, South Korea", 8, ["Embedded C", "FreeRTOS", "Nordic nRF52", "BLE", "I2C", "SPI"], "noah_kim_embedded.pdf"),
    ("tal_20", "Olivia Martin", "olivia.martin@sydney-ai.au", "Founding AI Growth & Acquisition Specialist", "Built programmatic SEO and programmatic AI content generation engines driving 1M monthly visits.", "Sydney, Australia", 5, ["Growth Engineering", "SEO", "Python", "Google Analytics 4", "Mixpanel"], "olivia_martin_growth.pdf"),
    ("tal_21", "Ethan Wright", "ethan.wright@denver-sec.io", "DevSecOps & Zero-Trust Cloud Engineer", "Engineered automated ephemeral credential brokers and compliance-as-code for SOC2 Type II.", "Denver, CO", 6, ["Vault", "AWS", "Terraform", "GitHub Actions", "OPA", "Python"], "ethan_wright_security.pdf"),
    ("tal_22", "Sarah Jenkins", "sarah.jenkins@cambridge-ml.uk", "Reinforcement Learning & Recommendation Lead", "Deployed contextual bandit models improving user re-engagement by 34% on mobile streaming.", "Cambridge, UK", 6, ["Ray RLlib", "PyTorch", "Python", "Spark", "Feature Stores", "Redis"], "sarah_jenkins_rl.pdf"),
    ("tal_23", "Daniel O'Connor", "daniel.oconnor@dublin-scale.ie", "Senior Backend Architect (Elixir & Rust)", "Engineered real-time chat infrastructure handling 2M concurrent WebSocket connections.", "Dublin, Ireland", 9, ["Elixir", "Phoenix Channels", "Rust", "PostgreSQL", "Docker"], "daniel_oconnor_backend.pdf"),
    ("tal_24", "Fatima Zahra", "fatima.zahra@casatech.ma", "Lead QA & Chaos Engineering Specialist", "Implemented automated resilience testing suites inducing network partitions and database fails.", "Casablanca, Morocco", 6, ["Chaos Mesh", "Playwright", "Python", "TypeScript", "k6", "Grafana"], "fatima_zahra_qa.pdf"),
    ("tal_25", "Julian Thorne", "julian.thorne@ny-healthtech.com", "Clinical Operations & HIPAA Compliance Lead", "Led FDA 510(k) software clearance workflows for digital therapeutic prescription apps.", "New York, NY", 8, ["HIPAA", "FDA 510(k)", "Clinical Trials", "GCP Healthcare API", "HL7/FHIR"], "julian_thorne_clinical.pdf")
]

for tal in talents:
    cur.execute("""
    INSERT INTO public.talent_profiles (
      id, name, full_name, email, headline, bio, location, experience_years, 
      skills, parsed_skills, resume_path, resume_url
    ) VALUES (
      %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      headline = EXCLUDED.headline,
      bio = EXCLUDED.bio,
      location = EXCLUDED.location,
      experience_years = EXCLUDED.experience_years,
      skills = EXCLUDED.skills,
      parsed_skills = EXCLUDED.parsed_skills,
      resume_path = EXCLUDED.resume_path;
    """, (
        tal[0], tal[1], tal[1], tal[2], tal[3], tal[4], tal[5], tal[6],
        json.dumps(tal[7]), json.dumps(tal[7]), tal[8], f"https://resumes.nexbridge.ai/{tal[8]}"
    ))

# =========================================================================
# 3. Seed 12 Startups / Targets with Roles
# =========================================================================
print("🏢 Seeding 12 Startups & Targets...")
startups = [
    ("tar_01", "NutriFit AI", "Lead Mobile Architect", "Seed ($3.2M)", "San Francisco, CA / Remote", "$160k - $190k", "1.5% - 2.5%", ["React Native", "Swift", "CoreML", "HealthKit", "TypeScript"], "Building closed-loop automated nutrition coaching combining computer vision with grocery fulfillment.", "Aarav Patel", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", 94),
    ("tar_02", "HyperScale Labs", "Staff Distributed Systems Architect", "Series A ($14M)", "San Francisco, CA", "$180k - $220k", "0.8% - 1.5%", ["Distributed Systems", "Rust", "Go", "Linux eBPF", "Raft Consensus", "Kubernetes"], "Sub-millisecond low latency networking proxies and streaming mesh for global finance.", "Ksenia Petrova", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80", 91),
    ("tar_03", "BioSync Wearables", "Founding Sensor Firmware Lead", "Seed ($2.8M)", "Austin, TX", "$140k - $175k", "2.0% - 3.5%", ["Embedded C", "FreeRTOS", "BLE", "Sensor Fusion", "DSP"], "Continuous metabolic monitoring patches with 14-day wear time and real-time lactate tracking.", "Dr. Michael Vance", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", 88),
    ("tar_04", "Cerebro Health", "Clinical NLP & Medical LLM Lead", "Series A ($18M)", "Boston, MA", "$170k - $210k", "0.5% - 1.2%", ["PyTorch", "Transformers", "NLP", "HL7/FHIR", "FastAPI", "Python"], "Ambient clinical AI scribe extracting structured EHR diagnoses during patient consultations.", "Dr. Maya Raman", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80", 85),
    ("tar_05", "Chrono Logistics", "Autonomous Routing & Dispatch Architect", "Series B ($35M)", "Chicago, IL", "$190k - $230k", "0.3% - 0.7%", ["Golang", "Algorithms", "PostGIS", "Kafka", "Docker", "Microservices"], "Dynamic hyper-local freight dispatch powered by predictive traffic flow models.", "David Sterling", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", 82),
    ("tar_06", "Apex Quantum", "Quantum Algorithms Researcher", "Seed ($5.0M)", "Boulder, CO", "$165k - $200k", "1.0% - 2.0%", ["Python", "Qiskit", "Linear Algebra", "C++", "Quantum Computing"], "Hybrid classical-quantum optimization algorithms for supply chain routing and drug discovery.", "Elena Fischer", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", 79),
    ("tar_07", "Synapse Audio", "Real-Time DSP & Spatial Audio Engineer", "Pre-Seed ($1.2M)", "Los Angeles, CA", "$130k - $160k", "3.0% - 5.0%", ["C++", "DSP", "CoreAudio", "JUCE", "Python", "Wasm"], "Binaural spatial sound synthesis engine for AR gaming and remote collaboration headsets.", "Julian Mercer", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", 76),
    ("tar_08", "Aura Fashion", "3D NeRF & Generative Cloth Reconstruction Lead", "Seed ($4.1M)", "New York, NY", "$155k - $185k", "1.2% - 2.2%", ["PyTorch", "NeRF", "Gaussian Splatting", "CUDA", "Computer Vision"], "Instant 3D photo-realistic digital try-ons rendered from single smartphone video clips.", "Camille Laurent", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80", 73),
    ("tar_09", "Lattice Robotics", "Lead Embedded ROS2 Architect", "Series A ($12M)", "Pittsburgh, PA", "$175k - $215k", "0.6% - 1.4%", ["ROS2", "C++", "Linux Kernel", "SLAM", "Real-Time OS"], "Heavy industrial autonomous forklifts operating safely alongside human warehouse operators.", "Marcus Brody", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80", 70),
    ("tar_10", "Horizon Security", "Senior eBPF Kernel Observability Engineer", "Series A ($16M)", "Remote / US", "$180k - $215k", "0.5% - 1.0%", ["eBPF", "C", "Linux Kernel", "Kubernetes", "Golang", "Grafana"], "Zero-overhead cloud-native runtime intrusion detection operating directly inside the Linux kernel.", "Rachel Adams", "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80", 68),
    ("tar_11", "Pulse Payments", "High-Throughput Ledger Architect", "Series B ($42M)", "New York, NY", "$200k - $250k", "0.2% - 0.5%", ["Rust", "PostgreSQL", "Kafka", "Distributed Systems", "Financial Cryptography"], "Sub-second cross-border fiat-to-stablecoin merchant settlement infrastructure.", "Tariq Mansour", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", 65),
    ("tar_12", "CarbonTrace AI", "Earth Observation & Geospatial ML Lead", "Seed ($3.6M)", "Seattle, WA", "$150k - $180k", "1.5% - 2.5%", ["Python", "PyTorch", "GDAL", "Rasterio", "Satellite Imagery", "AWS"], "Verifying planetary carbon offsets in real-time using multi-spectral satellite imagery pipelines.", "Dr. Arthur Bell", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", 62)
]

for s in startups:
    # Insert target
    cur.execute("""
    INSERT INTO public.targets (
      id, company_name, role_title, role, stage, location, salary_range, 
      equity_range, required_skills, description, company_bio, founder_name, logo_url
    ) VALUES (
      %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    ) ON CONFLICT (id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      role_title = EXCLUDED.role_title,
      salary_range = EXCLUDED.salary_range,
      required_skills = EXCLUDED.required_skills;
    """, (
        s[0], s[1], s[2], s[2], s[3], s[4], s[5], s[6], json.dumps(s[7]), s[8], s[8], s[9], s[10]
    ))

    # Insert startup_matches
    match_id = s[0].replace("tar_", "match_")
    cur.execute("""
    INSERT INTO public.startup_matches (
      id, startup_name, role, match_percentage, funding_stage, location, 
      equity_range, salary_range, key_skills_matched, missing_skills, company_bio, founder_name, logo_url
    ) VALUES (
      %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    ) ON CONFLICT (id) DO UPDATE SET
      match_percentage = EXCLUDED.match_percentage,
      salary_range = EXCLUDED.salary_range;
    """, (
        match_id, s[1], s[2], s[11], s[3], s[4], s[6], s[5],
        json.dumps(s[7][:3]), json.dumps(s[7][3:] if len(s[7]) > 3 else []),
        s[8], s[9], s[10]
    ))

# =========================================================================
# 4. Seed 8 Mentors & Advisors
# =========================================================================
print("🎓 Seeding 8 Mentors & Advisors...")
mentors = [
    ("mentor_1", "Marcus Vance", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", "ex-VP Product at Peloton & Strava", "Vance Advisory", "Advised 14 consumer health apps through Series A/B. Obsessed with habit formation, push notification psychology, and Day-30 retention mechanics.", 4.98, 48, 250, "$250 / hr", ["Consumer Health", "Retention & Churn", "Product Strategy", "Wearables"], ["Peloton (IPO)", "Strava (Growth Stage)"], "Next available: Tomorrow at 2:00 PM EST", ["Tomorrow, 2:00 PM EST", "Thursday, 10:00 AM EST", "Friday, 4:30 PM EST"]),
    ("mentor_2", "Dr. Sarah Lin", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80", "ex-Chief Architect at MyFitnessPal", "BioData Capital", "Architect of nutrition databases serving 200M+ users. Expert in USDA FoodData grounding, barcode indexing, and high-concurrency mobile sync.", 4.95, 36, 220, "$220 / hr", ["Nutrition Databases", "Distributed Systems", "USDA APIs", "Scalability"], ["MyFitnessPal (Acq by Under Armour $475M)"], "Next available: Thursday at 11:00 AM EST", ["Thursday, 11:00 AM EST", "Friday, 1:00 PM EST"]),
    ("mentor_3", "David Kroll", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", "Partner at Andreessen Horowitz (Bio+Health)", "a16z", "Invests in Seed-to-Series-A software eat health. Evaluates 400+ decks yearly. Deep focus on defensible unit economics and healthcare distribution.", 4.92, 52, 350, "$350 / hr", ["Venture Capital", "Fundraising Pitch", "Unit Economics", "B2B Health"], ["Seed Investor in 3 Health Unicorns"], "Next available: Monday at 3:00 PM EST", ["Monday, 3:00 PM EST", "Wednesday, 4:00 PM EST"]),
    ("mentor_4", "Elena Vasquez", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80", "ex-Head of Growth at Whoop", "Vasquez Growth Labs", "Built Whoop's athletic ambassador engine from zero to $18M ARR. Master of community-led growth, influencer affiliate structures, and CAC reduction.", 4.89, 29, 200, "$200 / hr", ["Community GTM", "Affiliate Channels", "Influencer Economics", "CAC Optimization"], ["Whoop (Series E Unicorn)"], "Next available: Wednesday at 1:00 PM EST", ["Wednesday, 1:00 PM EST", "Thursday, 3:00 PM EST"]),
    ("mentor_5", "Alex Thorne", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", "Founder & CEO at HealthScale (Exited $140M)", "Thorne Ventures", "Built HealthScale from dorm room to $140M acquisition by Optum. Mentors first-time founders on co-founder equity, early hiring, and enterprise GTM.", 4.96, 42, 280, "$280 / hr", ["Founder Psychology", "M&A Execution", "Early Hiring", "Pre-Seed Strategy"], ["HealthScale ($140M Exit to Optum)"], "Next available: Tomorrow at 4:00 PM EST", ["Tomorrow, 4:00 PM EST", "Friday, 11:00 AM EST"]),
    ("mentor_6", "Jessica Miller", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", "ex-VP Engineering at Oura", "Nordic Tech Advisors", "Led wearable firmware and iOS/Android client engineering for Oura Ring Gen 2 and Gen 3. Specialist in Bluetooth Low Energy (BLE) and battery life.", 4.91, 31, 240, "$240 / hr", ["Wearable Firmware", "BLE Architecture", "Mobile Client Reliability", "Health Sensors"], ["Oura Ring (Growth Stage)"], "Next available: Friday at 10:00 AM EST", ["Friday, 10:00 AM EST", "Monday, 2:00 PM EST"]),
    ("mentor_7", "Ryan Sterling", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80", "GTM Advisor at Sequoia Capital", "Sterling Advisory", "Helped 22 enterprise and consumer startups formulate pricing tiers, multi-sided network effects, and enterprise pilot contracts.", 4.94, 64, 300, "$300 / hr", ["Pricing Strategy", "Network Effects", "Pilot Agreements", "GTM Sales"], ["Advised 6 Sequoia Portfolio Companies"], "Next available: Thursday at 9:00 AM EST", ["Thursday, 9:00 AM EST", "Friday, 2:00 PM EST"]),
    ("mentor_8", "Dr. Aris Thorne", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", "ML Research Fellow at Stanford AI Lab", "Stanford Bio-AI", "Expert on fine-tuning vision-language models on edge hardware. Advises on dataset curation, synthetic data generation, and latency profiling.", 4.97, 24, 275, "$275 / hr", ["Edge AI", "Computer Vision", "Synthetic Data", "Latency Profiling"], ["Author of 12 Top-Tier AI Papers"], "Next available: Tuesday at 11:30 AM EST", ["Tuesday, 11:30 AM EST", "Thursday, 1:30 PM EST"])
]

for m in mentors:
    cur.execute("""
    INSERT INTO public.mentors (
      id, name, avatar, title, company, bio, rating, reviews_count, hourly_rate, 
      session_rate, domains, expertise, past_exits, availability, available_slots
    ) VALUES (
      %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      title = EXCLUDED.title,
      hourly_rate = EXCLUDED.hourly_rate,
      session_rate = EXCLUDED.session_rate,
      domains = EXCLUDED.domains,
      expertise = EXCLUDED.expertise;
    """, (
        m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9],
        json.dumps(m[10]), json.dumps(m[10]), json.dumps(m[11]), m[12], json.dumps(m[13])
    ))

# =========================================================================
# 5. Seed Demo Idea ("NutriFit AI") & 5 AI Validation Agents
# =========================================================================
print("💡 Seeding Demo Idea (NutriFit AI) & 5-Agent Validation Engine...")

idea_id = "idea_nutrifit_ai"
metrics = {
    "marketDemand": 84,
    "unitEconomics": 72,
    "technicalFeasibility": 79,
    "competitiveMoat": 71,
    "timingExecution": 82
}
risks = [
    {"category": "Retention Risk", "description": "71% of fitness nutrition users abandon manual logging within 28 days due to cognitive overhead.", "mitigation": "Automate meal capture using on-device multimodal CoreML vision combined with continuous glucose/strain telemetry."},
    {"category": "CAC Sensitivity", "description": "Meta and Google ad inventory costs for health & fitness have escalated 34% YoY.", "mitigation": "Partner directly with marathon clubs and functional fitness boxes via athletic ambassador affiliate engine."},
    {"category": "Database Grounding", "description": "Generic LLM hallucination of micronutrients can trigger dietary trust collapse.", "mitigation": "Ground all ingredient outputs strictly against USDA FoodData Central and verified laboratory nutritional tables."}
]
strengths = [
    {"category": "Frictionless Workflow", "description": "Instant meal logging via camera + voice reduces Day-1 onboarding time from 12 minutes to 45 seconds."},
    {"category": "Biometric Synchronization", "description": "Direct bidirectional API integrations with Apple HealthKit, Whoop 4.0, and Oura Gen 3 for dynamic strain adjustments."},
    {"category": "Negative Working Capital", "description": "Upfront annual subscriptions ($119.99/yr) paired with grocery fulfillment affiliate fees provide rapid non-dilutive liquidity."}
]

cur.execute("SELECT id FROM public.profiles WHERE email = 'aarav@nexbridge.ai'")
row = cur.fetchone()
founder_uuid = row[0] if row else 'a0000000-0000-0000-0000-000000000001'

cur.execute("""
INSERT INTO public.ideas (
  id, founder_id, user_id, title, tagline, description, category, target_market, 
  stage, score, status, signal, metrics, risks, strengths, business_model, tech_stack
) VALUES (
  %s, %s, %s,
  'NutriFit AI - Precision Nutrition Platform',
  'Biometric-synced nutritional intelligence with automated grocery dispatch',
  'NutriFit AI eliminates manual food tracking by combining on-device computer vision for instant plate recognition with continuous biometric strain data from Whoop and Apple Watch. It dynamically adjusts caloric and macronutrient targets based on daily recovery, automatically populating and dispatching meal ingredients via Instacart and Amazon Fresh.',
  'AI & HealthTech',
  'Endurance athletes, CrossFit athletes, and metabolic health optimizers',
  'Pre-Seed / Active Validation',
  78, 'validated', 'Strong Signal', %s, %s, %s,
  'Freemium B2C Subscription ($14.99/mo or $119.99/yr) + 4-6%% grocery delivery affiliate commission',
  '["React Native", "FastAPI", "PyTorch", "Supabase", "Redis", "CoreML"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  score = EXCLUDED.score,
  status = EXCLUDED.status,
  metrics = EXCLUDED.metrics,
  risks = EXCLUDED.risks,
  strengths = EXCLUDED.strengths;
""", (idea_id, founder_uuid, founder_uuid, json.dumps(metrics), json.dumps(risks), json.dumps(strengths)))

# 5 Agents Run in Parallel
agents = [
    ("agent_1", "Market Analyst", "Market Size & Segment Demand", "trending_up", 84, "completed", "Large & Expanding TAM ($11.2B by 2028)", "The intersection of quantified self wearables and personalized metabolic nutrition represents one of the fastest-growing health segments globally. Macro trends show high consumer willingness to pay ($12-25/mo) for automated compliance.", [
        "Wearable device adoption is growing at 19.4% CAGR globally",
        "Target ICP spends an average of $84/mo on fitness and nutrition supplements",
        "Clear willingness to pay premium subscription for eliminated manual tracking"
    ], [
        "Fitness subscription fatigue may require annual upfront incentives",
        "Saturated ad channels require non-traditional athletic community GTM"
    ]),
    ("agent_2", "Competitor Researcher", "Moat & Landscape Differentiation", "hub", 68, "completed", "Differentiated Moat via Automated Fulfillment", "Incumbents like MyFitnessPal are burdened by legacy manual text entry and inaccurate community-entered databases. MacroFactor offers solid algorithms but leaves execution entirely to the user. NutriFit wins by closing the loop directly to grocery fulfillment.", [
        "MyFitnessPal has 200M+ users but 4.1-star fatigue over ad clutter",
        "MacroFactor has cult following but zero automated grocery integration",
        "No major competitor closes the loop from biometric burn to grocery delivery"
    ], [
        "High switching costs for users with years of historical logs in MyFitnessPal",
        "Instacart API affiliate margins can fluctuate based on regional fulfillment deals"
    ]),
    ("agent_3", "Revenue Critic", "Unit Economics & Monetization Rigor", "monetization_on", 72, "completed", "Healthy 3.2x LTV:CAC with Grocery Upside", "Blended CAC of $38 against an estimated 14-month retention ($122.90 LTV) yields a healthy 3.23x LTV:CAC ratio. Grocery affiliate margins provide an incremental $4.20 per dispatched cart, bolstering gross margins to 78.4%.", [
        "Payback period achieved in 3.1 months on blended CAC",
        "Grocery cart affiliate commission provides anti-churn retention lock-in",
        "Annual upfront payment tier significantly improves working capital"
    ], [
        "Churn spikes typically occur between Day 21 and Day 35",
        "Paid user acquisition costs can double during Q1 resolution season"
    ]),
    ("agent_4", "Technical Architect", "Feasibility & Infrastructure Scalability", "memory", 82, "completed", "Feasible via Edge CoreML & USDA Microservices", "Running lightweight YOLOv8 models on-device via Apple Neural Engine keeps inference costs near zero ($0.004/scan) while preserving user dietary privacy. USDA FoodData Central provides an authoritative nutritional bedrock.", [
        "On-device CoreML inference executes in <120ms with 91.2% food category recall",
        "HealthKit background observer queries allow zero-battery-drain strain sync",
        "USDA FoodData Central API enables verified micronutrient grounding"
    ], [
        "Mixed plate segmentation (stews, casseroles) requires fallback LLM reasoning",
        "Handling multi-item lighting variations requires continuous shadow augmentation"
    ]),
    ("agent_5", "Skeptic", "Pre-Mortem Failure Analysis", "warning", 59, "flagged", "Flagged: Day-30 Habit Decay & Churn Cliff", "Historical data shows 71% of nutrition app users abandon manual logging by week 4. If image recognition requires constant manual correction, users will uninstall. The product must make meal confirmation frictionless (under 3 seconds per meal).", [
        "71% of fitness nutrition users quit within first 28 days",
        "Users will not manually weigh individual ingredients long-term",
        "Grocery fulfillment failures (out-of-stock items) degrade trust"
    ], [
        "Must offer 1-tap confirmation with intelligent portion defaults",
        "Need automated fallback recipe suggestions when grocery items are unavailable"
    ])
]

# Validation Runs Table
agent_results_json = {
    ag[1]: {
        "score": ag[4],
        "verdict": ag[6],
        "analysis": ag[7],
        "findings": ag[8],
        "concerns": ag[9]
    } for ag in agents
}

cur.execute("""
INSERT INTO public.validation_runs (id, idea_id, status, overall_score, agent_results)
VALUES ('val_nutrifit_run1', %s, 'completed', 78, %s)
ON CONFLICT (id) DO UPDATE SET
  overall_score = EXCLUDED.overall_score,
  agent_results = EXCLUDED.agent_results;
""", (idea_id, json.dumps(agent_results_json)))

for ag in agents:
    cur.execute("""
    INSERT INTO public.validation_agents (
      id, idea_id, name, role_title, icon, score, status, verdict, 
      detailed_analysis, key_findings, concerns
    ) VALUES (
      %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    ) ON CONFLICT (id) DO UPDATE SET
      score = EXCLUDED.score,
      status = EXCLUDED.status,
      verdict = EXCLUDED.verdict,
      detailed_analysis = EXCLUDED.detailed_analysis,
      key_findings = EXCLUDED.key_findings,
      concerns = EXCLUDED.concerns;
    """, (
        ag[0], idea_id, ag[1], ag[2], ag[3], ag[4], ag[5], ag[6], ag[7],
        json.dumps(ag[8]), json.dumps(ag[9])
    ))

# =========================================================================
# 6. Seed Competitors, Revenue, Plans, Roles, Applications
# =========================================================================
print("⚔️ Seeding Competitors & Execution Plans...")

competitors = [
    ("comp_1", "MyFitnessPal", "Direct", "$475M (Acquired)", "$19.99/mo or $79.99/yr", ["Massive 200M+ community database", "High brand recognition", "Extensive barcode library"], ["Severe ad clutter", "Crowdsourced database has rampant nutritional inaccuracies", "Manual text entry causes high user burnout"], "Zero-friction computer vision capture + verified USDA grounding with zero banner ads.", "High"),
    ("comp_2", "MacroFactor", "Direct", "Bootstrapped ($8M ARR)", "$11.99/mo or $71.99/yr", ["Algorithmic dynamic expenditure calculation", "Scientific adherence-neutral UX", "High user loyalty among powerlifters"], ["Zero grocery delivery or meal preparation integration", "No wearable strain bi-directional integration", "Complex learning curve for mainstream users"], "Closed-loop grocery fulfillment + automated Whoop/Oura strain compensation.", "Medium"),
    ("comp_3", "Noom", "Indirect", "$3.7B Valuation", "$59/mo", ["Strong cognitive behavioral psychology curriculum", "Extensive human coaching network"], ["Extremely aggressive billing tactics", "Oversimplified red/yellow/green food scoring without macro precision", "High customer churn"], "Hard mathematical precision for athletic performance rather than restrictive weight loss guilt.", "Low"),
    ("comp_4", "Carbon Diet Coach", "Direct", "$4M ARR", "$9.99/mo", ["Evidence-based metabolic adjustment algorithms", "Co-founded by Dr. Layne Norton"], ["Clunky mobile UI", "Manual weigh-in requirements", "No automated computer vision logging"], "Modern executive design aesthetic with automated multimodal meal capture in <3 seconds.", "Medium")
]

for c in competitors:
    cur.execute("""
    INSERT INTO public.competitors (
      id, idea_id, name, category, market_cap_or_funding, pricing, strengths, weaknesses, our_moat, threat_level
    ) VALUES (
      %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    ) ON CONFLICT (id) DO UPDATE SET
      pricing = EXCLUDED.pricing,
      strengths = EXCLUDED.strengths,
      weaknesses = EXCLUDED.weaknesses,
      our_moat = EXCLUDED.our_moat;
    """, (
        c[0], idea_id, c[1], c[2], c[3], c[4], json.dumps(c[5]), json.dumps(c[6]), c[7], c[8]
    ))

# Revenue Model
pricing_tiers = [
    {"name": "Free Tier", "price": "$0", "period": "forever", "features": ["Barcode scanning", "Basic macro tracking", "3 AI meal scans/day", "Apple HealthKit sync"]},
    {"name": "Pro Annual (Hero)", "price": "$119.99", "period": "per year ($9.99/mo)", "features": ["Unlimited on-device CoreML scans", "Bi-directional Whoop strain adjustment", "Instacart 1-tap cart creation", "Micronutrient bio-reports"]},
    {"name": "Performance Monthly", "price": "$14.99", "period": "per month", "features": ["All Pro features", "Month-to-month flexibility", "Priority AI inference gateway"]}
]
assumptions = [
    {"metric": "Blended CAC", "value": "$38.00", "notes": "Driven by 40% organic referral via fitness box ambassadors and $54 paid Meta acquisition."},
    {"metric": "Average Retention", "value": "13.8 months", "notes": "Grocery integration increases Day-90 retention by an estimated 22% over baseline."},
    {"metric": "Monthly Server/Inference Cost", "value": "$0.62 / active user", "notes": "CoreML on-device processing minimizes central GPU compute expenses."}
]

cur.execute("""
INSERT INTO public.revenue_analyses (
  id, idea_id, model_type, cac, ltv, ltv_cac_ratio, gross_margin, payback_months, 
  pricing_tiers, assumptions, unit_economics_summary
) VALUES (
  'rev_nutrifit_1', %s, 'Freemium B2C Subscription + Grocery Fulfillment Affiliate',
  38.00, 122.90, 3.23, 78.40, 3.1,
  %s, %s,
  'Healthy unit economics with strong 3.23x LTV:CAC and 3.1 month payback. Upfront annual billing generates strong non-dilutive float.'
) ON CONFLICT (id) DO UPDATE SET
  cac = EXCLUDED.cac,
  ltv = EXCLUDED.ltv,
  ltv_cac_ratio = EXCLUDED.ltv_cac_ratio,
  pricing_tiers = EXCLUDED.pricing_tiers;
""", (idea_id, json.dumps(pricing_tiers), json.dumps(assumptions)))

# Structured Plan
product_strategy = {
    "corePillars": [
        "Zero-Friction Ingestion: Sub-3 second multimodal food logging via edge CoreML",
        "Biometric Feedback Loop: Real-time caloric and carb adjustment synced to Apple Watch & Whoop",
        "Automated Execution: 1-tap grocery cart assembly dispatched through Instacart and Amazon Fresh"
    ],
    "targetAudience": "CrossFit athletes, marathoners, and quantified-self high performers (24-42 years old)",
    "primaryDifferentiator": "Closing the intent-to-action gap by delivering actual ingredients directly to the door"
}
tech_architecture = {
    "frontend": "React Native (TypeScript) with Reanimated 3 for sub-60fps fluid UI",
    "edgeCompute": "Apple Neural Engine (ANE) CoreML vision model for on-device segmentation",
    "backend": "Python FastAPI microservices deployed on AWS ECS with Redis semantic cache",
    "database": "Supabase PostgreSQL with pgvector embeddings for nutritional semantic retrieval",
    "integrations": ["Apple HealthKit", "Whoop 4.0 API", "USDA FoodData Central", "Instacart Connect API"]
}
milestones = [
    {"phase": "Sprint 1 (Weeks 1-4)", "title": "Edge Vision Engine & HealthKit Sync", "status": "Completed", "deliverables": ["YOLOv8 CoreML export", "Background HealthKit strain ingestion", "Baseline UI design system"]},
    {"phase": "Sprint 2 (Weeks 5-8)", "title": "USDA Grounding & Closed Beta", "status": "In Progress", "deliverables": ["USDA FoodData Redis cache", "50-athlete beta cohort", "Instacart cart deeplinking"]},
    {"phase": "Sprint 3 (Weeks 9-12)", "title": "Public Launch & Ambassador GTM", "status": "Upcoming", "deliverables": ["App Store submission", "20 affiliate athlete partnerships", "$50k ARR milestone"]}
]

cur.execute("""
INSERT INTO public.plans (
  id, idea_id, product_strategy, tech_architecture, milestones, unit_economics
) VALUES (
  'plan_nutrifit_1', %s, %s, %s, %s, %s
) ON CONFLICT (id) DO UPDATE SET
  product_strategy = EXCLUDED.product_strategy,
  tech_architecture = EXCLUDED.tech_architecture,
  milestones = EXCLUDED.milestones;
""", (idea_id, json.dumps(product_strategy), json.dumps(tech_architecture), json.dumps(milestones), json.dumps({"ltvCac": 3.23, "payback": 3.1})))

cur.execute("""
INSERT INTO public.structured_plans (
  id, idea_id, product_strategy, tech_stack, architecture, milestones
) VALUES (
  'plan_nutrifit_1', %s, %s, '["React Native", "FastAPI", "CoreML", "Supabase", "Redis"]'::jsonb, %s, %s
) ON CONFLICT (id) DO UPDATE SET
  product_strategy = EXCLUDED.product_strategy,
  architecture = EXCLUDED.architecture;
""", (idea_id, json.dumps(product_strategy), json.dumps(tech_architecture), json.dumps(milestones)))

# Job Roles
cur.execute("""
INSERT INTO public.roles (
  id, idea_id, title, department, level, type, urgency, required_skills, preferred_skills, description, candidate_matches_count
) VALUES 
  ('role_1', %s, 'Lead Mobile Architect', 'Engineering', 'Founding Staff', 'Full-Time', 'Immediate', '["React Native", "Swift", "CoreML", "HealthKit", "TypeScript"]'::jsonb, '["Redux Toolkit", "GraphQL", "Reanimated 3"]'::jsonb, 'Architect sub-60fps fluid logging interfaces and bridge native Apple HealthKit telemetry with CoreML meal scanning.', 4),
  ('role_2', %s, 'Senior Computer Vision Engineer', 'AI & Core ML', 'Founding Staff', 'Full-Time', 'Immediate', '["PyTorch", "OpenCV", "TensorRT", "YOLOv8", "CoreML"]'::jsonb, '["Edge AI", "C++", "Instance Segmentation"]'::jsonb, 'Train and optimize lightweight multi-item plate recognition models runnable entirely on consumer smartphones in <120ms.', 2),
  ('role_3', %s, 'Founding GTM & Community Lead', 'Growth & Marketing', 'Head of', 'Full-Time', 'Next 30 Days', '["Community Growth", "Affiliate Partnerships", "Athletic GTM", "Klaviyo"]'::jsonb, '["HubSpot", "CAC Optimization", "CrossFit Box GTM"]'::jsonb, 'Build and orchestrate ambassador programs with competitive athletic boxes, marathon clubs, and fitness creators.', 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  required_skills = EXCLUDED.required_skills;
""", (idea_id, idea_id, idea_id))

cur.execute("""
INSERT INTO public.job_roles (
  id, idea_id, title, department, type, urgency, required_skills, preferred_skills, candidate_matches_count
) VALUES 
  ('role_1', %s, 'Lead Mobile Architect', 'Engineering', 'Full-Time', 'Immediate', '["React Native", "Swift", "CoreML", "HealthKit", "TypeScript"]'::jsonb, '["Redux Toolkit"]'::jsonb, 4),
  ('role_2', %s, 'Senior Computer Vision Engineer', 'AI & Core ML', 'Full-Time', 'Immediate', '["PyTorch", "OpenCV", "TensorRT", "YOLOv8", "CoreML"]'::jsonb, '["Edge AI"]'::jsonb, 2),
  ('role_3', %s, 'Founding GTM & Community Lead', 'Growth & Marketing', 'Full-Time', 'Next 30 Days', '["Community Growth", "Affiliate Partnerships", "Athletic GTM"]'::jsonb, '["HubSpot"]'::jsonb, 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title;
""", (idea_id, idea_id, idea_id))

# Applications & Rejection Growth Reports
print("📄 Seeding Applications & Growth Reports...")
cur.execute("""
INSERT INTO public.applications (
  id, talent_id, target_id, company_name, role, status, match_percentage, has_report, stage_info
) VALUES 
  ('app_1', 'tal_01', 'tar_02', 'HyperScale Labs', 'Staff Distributed Systems Architect', 'Rejected', 91, true, 'System Architecture Deep Dive (Stage 3)'),
  ('app_2', 'tal_01', 'tar_03', 'BioSync Wearables', 'Founding Sensor Firmware Lead', 'Rejected', 88, true, 'Embedded Kernel Coding Round (Stage 2)'),
  ('app_3', 'tal_01', 'tar_04', 'Cerebro Health', 'Clinical NLP Lead', 'Interviewing', 85, false, 'Technical Screen with VP Eng scheduled for Thursday'),
  ('app_4', 'tal_01', 'tar_01', 'NutriFit AI', 'Lead Mobile Architect', 'Under Review', 94, false, 'Submitted resume and portfolio. Founder review pending.'),
  ('app_5', 'tal_01', 'tar_06', 'Apex Quantum', 'Quantum Algorithms Researcher', 'Under Review', 79, false, 'Application received. Reviewing mathematics background.')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  match_percentage = EXCLUDED.match_percentage,
  has_report = EXCLUDED.has_report;
""")

# Rejection Report 1 (HyperScale Labs)
cur.execute("""
INSERT INTO public.rejection_reports (
  id, application_id, role_title, company_name, stage, primary_reason, summary, severity, 
  missing_skills, focus_areas, weeks_remaining, learning_timeline, timeline_weeks, recommended_mentor_id, reapply_date
) VALUES (
  'rep_1', 'app_1', 'Staff Distributed Systems Architect', 'HyperScale Labs', 'Technical Stage 3: Raft Consensus & eBPF Telemetry',
  'Candidate demonstrated elite knowledge of distributed streaming with Kafka and Go, but fell short on deep Linux kernel eBPF packet-filtering under saturation.',
  'While your architectural thinking around consensus mechanisms was among the top 5%% of candidates, our proxy layer requires direct in-kernel XDP packet interception in C/Rust without userspace context-switching. We encourage you to build hands-on eBPF socket filters and reapply in 3 weeks for our Winter intake.',
  'moderate',
  '["eBPF XDP filters", "Linux kernel networking", "Kernel-bypass DPDK"]'::jsonb,
  '[
    {"name": "Kernel Networking", "priority": "High", "hoursNeeded": 24, "rationale": "HyperScale proxies process 2M pkts/sec using XDP. Userspace packet copies create unacceptable tail latency."},
    {"name": "Raft Edge Cases", "priority": "Medium", "hoursNeeded": 14, "rationale": "Need mastery over split-brain quorum recovery during asymmetric network partitions."}
  ]'::jsonb,
  3,
  '[
    {"week": 1, "title": "eBPF & XDP Foundations", "status": "In Progress", "tasks": ["Build minimal XDP packet dropper in C", "Inspect kernel sk_buff structures", "Profile packet drop latency using bpftool"], "resources": ["Official Linux Kernel eBPF Documentation", "Cilium BPF and XDP Reference Guide"]},
    {"week": 2, "title": "High-Throughput Ring Buffers", "status": "Pending", "tasks": ["Implement BPF ringbuf for userspace stats emission", "Benchmark against perf buffer throughput under 500k req/s"], "resources": ["BCC Tools Repository", "Brendan Gregg Systems Performance (2nd Ed)"]},
    {"week": 3, "title": "Live Mock Architecture & Re-evaluation", "status": "Pending", "tasks": ["Schedule 45-min review with Marcus Vance", "Deploy working demo to GitHub", "Submit re-application to HyperScale Labs"], "resources": ["Book Session with Advisor Marcus Vance"]}
  ]'::jsonb,
  '[
    {"week": 1, "title": "eBPF & XDP Foundations", "status": "In Progress", "tasks": ["Build minimal XDP packet dropper in C", "Inspect kernel sk_buff structures", "Profile packet drop latency using bpftool"], "resources": ["Official Linux Kernel eBPF Documentation", "Cilium BPF and XDP Reference Guide"]},
    {"week": 2, "title": "High-Throughput Ring Buffers", "status": "Pending", "tasks": ["Implement BPF ringbuf for userspace stats emission", "Benchmark against perf buffer throughput under 500k req/s"], "resources": ["BCC Tools Repository", "Brendan Gregg Systems Performance (2nd Ed)"]},
    {"week": 3, "title": "Live Mock Architecture & Re-evaluation", "status": "Pending", "tasks": ["Schedule 45-min review with Marcus Vance", "Deploy working demo to GitHub", "Submit re-application to HyperScale Labs"], "resources": ["Book Session with Advisor Marcus Vance"]}
  ]'::jsonb,
  'mentor_1', '2026-11-07'
) ON CONFLICT (application_id) DO UPDATE SET
  primary_reason = EXCLUDED.primary_reason,
  summary = EXCLUDED.summary,
  learning_timeline = EXCLUDED.learning_timeline;
""")

# Rejection Report 2 (BioSync)
cur.execute("""
INSERT INTO public.rejection_reports (
  id, application_id, role_title, company_name, stage, primary_reason, summary, severity, 
  missing_skills, focus_areas, weeks_remaining, learning_timeline, timeline_weeks, recommended_mentor_id, reapply_date
) VALUES (
  'rep_2', 'app_2', 'Founding Sensor Firmware Lead', 'BioSync Wearables', 'Embedded Kernel Coding Round',
  'Deep software expertise, but lacked hands-on FreeRTOS power state optimization for ultra-low voltage coin cell devices.',
  'Your software systems experience is world-class, but BioSync continuous glucose patches require severe sub-microamp sleep state cycles on Nordic nRF52 platforms.',
  'minor',
  '["FreeRTOS Low-Power Tickless Idle", "Nordic nRF52 SDK", "I2C Sensor Calibration"]'::jsonb,
  '[
    {"name": "Ultra-Low Power Firmware", "priority": "High", "hoursNeeded": 18, "rationale": "Battery longevity is our primary hardware consumer selling point."}
  ]'::jsonb,
  4,
  '[
    {"week": 1, "title": "Tickless Idle FreeRTOS", "status": "Pending", "tasks": ["Configure low-power tickless mode on nRF52", "Measure standby current on oscilloscope"], "resources": ["Nordic Semiconductor Official SDK Docs"]},
    {"week": 2, "title": "BLE Connection Interval Tuning", "status": "Pending", "tasks": ["Tune slave latency and supervision timeout to minimize radio wakeups"], "resources": ["Bluetooth Core Specification v5.3"]}
  ]'::jsonb,
  '[
    {"week": 1, "title": "Tickless Idle FreeRTOS", "status": "Pending", "tasks": ["Configure low-power tickless mode on nRF52", "Measure standby current on oscilloscope"], "resources": ["Nordic Semiconductor Official SDK Docs"]},
    {"week": 2, "title": "BLE Connection Interval Tuning", "status": "Pending", "tasks": ["Tune slave latency and supervision timeout to minimize radio wakeups"], "resources": ["Bluetooth Core Specification v5.3"]}
  ]'::jsonb,
  'mentor_6', '2026-11-14'
) ON CONFLICT (application_id) DO UPDATE SET
  primary_reason = EXCLUDED.primary_reason;
""")

# Outreach Pipeline
print("✉️ Seeding Outreach Pipeline...")
cur.execute("""
INSERT INTO public.outreach (
  id, idea_id, candidate_id, candidate_name, candidate_role, subject, message, stage, status
) VALUES 
  ('out_1', %s, 'tal_02', 'Elena Rostova', 'Staff Mobile Architect', 'Founding Mobile Architect opportunity at NutriFit AI', 'Hi Elena, I saw your CVPR-referenced work on real-time mobile segmentation. We are building NutriFit AI (backed by high-conviction angels) to bring automated multimodal meal capture to endurance athletes. Would love to chat for 15 mins this week.', 'In Conversation', 'sent'),
  ('out_2', %s, 'tal_03', 'Dr. Devin Zhao', 'Senior Computer Vision Engineer', 'Exploring founding CV role with NutriFit AI', 'Hi Devin, your research on zero-shot instance segmentation directly addresses our core plate recognition pipeline. Are you open to exploring founding equity roles?', 'Sent', 'sent'),
  ('out_3', %s, 'tal_04', 'Priya Sharma', 'Founding GTM & Athletic Lead', 'Scaling athletic communities with NutriFit AI', 'Hi Priya, your track record scaling Whoop athlete affiliate programs from $2M to $18M ARR is unmatched. We are assembling an advisory and founding team—lets connect.', 'Drafts', 'draft')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage;
""", (idea_id, idea_id, idea_id))

cur.execute("""
INSERT INTO public.outreach_messages (
  id, idea_id, candidate_id, candidate_name, candidate_role, subject, body, stage, status
) VALUES 
  ('out_1', %s, 'tal_02', 'Elena Rostova', 'Staff Mobile Architect', 'Founding Mobile Architect opportunity at NutriFit AI', 'Hi Elena, I saw your CVPR-referenced work on real-time mobile segmentation. We are building NutriFit AI (backed by high-conviction angels) to bring automated multimodal meal capture to endurance athletes. Would love to chat for 15 mins this week.', 'In Conversation', 'sent'),
  ('out_2', %s, 'tal_03', 'Dr. Devin Zhao', 'Senior Computer Vision Engineer', 'Exploring founding CV role with NutriFit AI', 'Hi Devin, your research on zero-shot instance segmentation directly addresses our core plate recognition pipeline. Are you open to exploring founding equity roles?', 'Sent', 'sent'),
  ('out_3', %s, 'tal_04', 'Priya Sharma', 'Founding GTM & Athletic Lead', 'Scaling athletic communities with NutriFit AI', 'Hi Priya, your track record scaling Whoop athlete affiliate programs from $2M to $18M ARR is unmatched. We are assembling an advisory and founding team—lets connect.', 'Drafts', 'draft')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage;
""", (idea_id, idea_id, idea_id))

# Mentor Requests
print("🤝 Seeding Mentor Requests...")
cur.execute("""
INSERT INTO public.mentor_requests (
  id, mentor_id, mentor_name, mentor_avatar, founder_id, founder_name, startup_name, topic, message, proposed_time, status
) VALUES 
  ('req_1', 'mentor_1', 'Marcus Vance', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', %s, 'Aarav Patel', 'NutriFit AI', 'Day-30 Retention & Push Notification Triggers', 'Hey Marcus, our 5-agent stress test flagged Day-28 user habit decay. We would love your guidance on our automated grocery confirmation loops.', 'Tomorrow, 2:00 PM EST', 'accepted'),
  ('req_2', 'mentor_2', 'Dr. Sarah Lin', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', %s, 'Aarav Patel', 'NutriFit AI', 'USDA Database Grounding & Sub-50ms Sync', 'Hi Sarah, wanting to review our Redis caching layer for 350k food items to avoid hallucination.', 'Thursday, 11:00 AM EST', 'pending')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;
""", (founder_uuid, founder_uuid))

conn.close()
print("🎉 Successfully seeded 25 Talent Profiles, 12 Startups/Targets, 8 Mentors, and Demo Idea!")
