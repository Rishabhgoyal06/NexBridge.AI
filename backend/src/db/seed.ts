import { pool } from './supabase.js';

async function seed() {
  console.log('🌱 Seeding initial database data into Supabase...');

  try {
    // 1. Profile
    const profileRes = await pool.query(`
      INSERT INTO profiles (email, name, role, headline, avatar, company)
      VALUES (
        'aarav@nexbridge.ai',
        'Aarav Patel',
        'founder',
        'Seed Founder • Building NutriFit AI',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'NutriFit AI'
      )
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const founderId = profileRes.rows[0].id;

    // 2. Demo Idea
    const ideaId = 'idea_gym_meal_planner';
    await pool.query(`
      INSERT INTO ideas (
        id, founder_id, title, tagline, description, category, target_market, stage, score, status, signal, metrics, risks, strengths
      ) VALUES (
        $1, $2,
        'NutriFit AI',
        'AI meal planner for gym-goers with dynamic carb-cycling & 1-click cart prep',
        'An intelligent nutrition platform engineered specifically for strength training and bodybuilding athletes. Combines real-time workout telemetry from Apple Watch & Whoop with computer vision plate-scanning to automatically adjust macro targets and dispatch exact grocery orders via Instacart.',
        'HealthTech & Consumer AI',
        'Strength athletes, bodybuilders, functional fitness enthusiasts (US TAM: $4.2B)',
        'Pre-Seed / Active Validation',
        78,
        'validated',
        'Strong Signal',
        '{"marketDemand": 84, "unitEconomics": 72, "technicalFeasibility": 79, "competitiveMoat": 71, "timingExecution": 82}'::jsonb,
        '[
          {"title": "Day-30 Retention Cliff", "severity": "high", "description": "Fitness tracking burnout causes steep churn after initial novelty fades.", "mitigation": "Implement passive friction-free logging, streak wagering, and peer gym partner check-ins."},
          {"title": "Vision Model Inference Overhead", "severity": "medium", "description": "Cloud vision calls on every meal scan can eat 18-25% of monthly subscription revenue.", "mitigation": "Run food classification on-device via CoreML; query cloud only for ambiguous composite dishes."},
          {"title": "Nutritional Inaccuracy Liability", "severity": "medium", "description": "Under-calculating allergens or diabetes-sensitive carbs could trigger complaints.", "mitigation": "Explicit medical disclaimer, confidence interval display, and human review tier."}
        ]'::jsonb,
        '[
          {"title": "Closed-Loop Grocery Cart Fulfillment", "description": "First app that transforms raw macro math directly into delivered grocery ingredients.", "score": 95},
          {"title": "Dynamic Biometric Carb-Cycling", "description": "Automatically shifts heavy carb allowance to deadlift/leg days based on wearable telemetry.", "score": 91},
          {"title": "High Intent Community Organic Moat", "description": "Targeted directly at barbell clubs and CrossFit boxes who evangelize effective tools.", "score": 87}
        ]'::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
    `, [ideaId, founderId]);

    // 3. Validation Agents
    const agents = [
      {
        id: 'agent_market',
        name: 'Market Analyst',
        role_title: 'Demand & Willingness-To-Pay',
        icon: 'insights',
        score: 84,
        status: 'completed',
        verdict: 'Validated willingness to pay; fitness segment spends $80-$150/mo on supplements.',
        detailed_analysis: 'Interviews with 42 regular gym-goers reveal macro tracking friction is their #1 daily dropout cause. 68% currently pay for MyFitnessPal or MacroFactor, but 89% express extreme frustration with manual portion estimation.',
        key_findings: JSON.stringify([
          'Fitness demographic has high disposable income ($85k+ median household)',
          'Willingness to pay $14.99 - $19.99/mo is verified across 42 user interviews',
          'Direct grocery affiliate integration creates a secondary high-margin revenue flywheel'
        ]),
        concerns: JSON.stringify([
          'Gym seasonality (January spikes followed by February drop-offs)',
          'CAC on Meta/Instagram has risen 32% year-over-year in the fitness category'
        ])
      },
      {
        id: 'agent_competitors',
        name: 'Competitor Researcher',
        role_title: 'Moat & Landscape Mapping',
        icon: 'radar',
        score: 68,
        status: 'completed',
        verdict: 'Legacy apps are passive databases; whitespace exists for proactive autonomous planners.',
        detailed_analysis: 'Incumbents like MyFitnessPal operate as passive retrospective food logs. MacroFactor provides algorithmic adjustments but does not generate meals or grocery lists.',
        key_findings: JSON.stringify([
          'Incumbents burdened by bloated 15-year-old databases with inaccurate user entries',
          'No competitor offers real-time bi-directional Whoop/Garmin strain sync for carb-cycling',
          'Moat must be built around proprietary verified recipe macros and fast local vision models'
        ]),
        concerns: JSON.stringify([
          'MyFitnessPal could copy basic AI features with their massive distribution',
          'MacroFactor has high brand loyalty among powerlifters'
        ])
      },
      {
        id: 'agent_revenue',
        name: 'Revenue Critic',
        role_title: 'Unit Economics & Margins',
        icon: 'payments',
        score: 74,
        status: 'completed',
        verdict: 'Healthy 3.2x LTV:CAC if Day-90 churn is mitigated via social accountability streaks.',
        detailed_analysis: 'Blended CAC of $38 against an average subscriber lifetime of 8.2 months ($122.90 LTV) yields a 3.2x ratio with a 3.1 month payback period.',
        key_findings: JSON.stringify([
          'Base subscription: $14.99/mo with 78% gross margins',
          'Grocery delivery partner affiliates add ~$4.20 per user/month in pure profit',
          'Enterprise gym chain white-label potential (Equinox, Lifetime) at $8/seat/mo'
        ]),
        concerns: JSON.stringify([
          'OpenAI API vision costs could erode gross margins if users upload 6+ meals daily',
          'Stripe processing and chargeback risks on yearly plans if user ceases gym attendance'
        ])
      },
      {
        id: 'agent_architect',
        name: 'Technical Architect',
        role_title: 'Feasibility & Stack Blueprint',
        icon: 'terminal',
        score: 82,
        status: 'completed',
        verdict: 'Architecture is highly viable; requires hybrid on-device vision + cloud macro engine.',
        detailed_analysis: 'A mobile-first React Native architecture backed by a Python FastAPI microservice layer. Use on-device CoreML/TensorFlow Lite for immediate edge bounding-box detection.',
        key_findings: JSON.stringify([
          'Sub-800ms meal recognition is achievable via quantized edge embeddings',
          'Postgres with pgvector enables semantic recipe search and macro ingredient substitution',
          'Webhooks from Apple HealthKit and Whoop provide non-intrusive caloric expenditure streams'
        ]),
        concerns: JSON.stringify([
          'Accurately estimating hidden cooking oils and sauces from photographs remains challenging',
          'Data privacy compliance regarding biometric health streams requires strict encryption at rest'
        ])
      },
      {
        id: 'agent_skeptic',
        name: 'Skeptic',
        role_title: 'Pre-Mortem & Threat Model',
        icon: 'warning',
        score: 59,
        status: 'flagged',
        verdict: 'Danger Zone: Fitness app churn is brutal. You must solve behavior compliance, not just math.',
        detailed_analysis: 'Founders repeatedly build sophisticated macro solvers that fail because users refuse to weigh chicken breast for more than three weeks. Your true product is habit reinforcement.',
        key_findings: JSON.stringify([
          '71% of nutrition tracker users quit within the first 28 days',
          'Plate photography fails in dimly lit restaurants and social dinners',
          'Gym-goers often eat the same 5 meals on repeat; initial wow-factor wears off fast'
        ]),
        concerns: JSON.stringify([
          'High reliance on third-party grocery APIs',
          'Liability for nutritional deficiency recommendations if users input extreme deficits'
        ])
      }
    ];

    for (const a of agents) {
      await pool.query(`
        INSERT INTO validation_agents (id, idea_id, name, role_title, icon, score, status, verdict, detailed_analysis, key_findings, concerns)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score, verdict = EXCLUDED.verdict;
      `, [a.id, ideaId, a.name, a.role_title, a.icon, a.score, a.status, a.verdict, a.detailed_analysis, a.key_findings, a.concerns]);
    }

    // 4. Competitors
    const comps = [
      {
        id: 'comp_1',
        name: 'MyFitnessPal',
        category: 'Legacy',
        market_cap_or_funding: '$1B+ (Francisco Partners)',
        pricing: '$19.99/mo or $79.99/yr',
        strengths: JSON.stringify(['Massive 14M+ food database', 'Global brand awareness']),
        weaknesses: JSON.stringify(['Bloated UI full of ads', 'No auto meal generation', 'Inaccurate user-submitted data']),
        our_moat: 'Frictionless automated planning instead of tedious retrospective manual logging.',
        threat_level: 'Medium'
      },
      {
        id: 'comp_2',
        name: 'MacroFactor',
        category: 'Direct',
        market_cap_or_funding: 'Bootstrapped / Profitable',
        pricing: '$11.99/mo or $71.99/yr',
        strengths: JSON.stringify(['Adherence-neutral expenditure algorithm', 'Cult following among lifters']),
        weaknesses: JSON.stringify(['Does not generate recipes', 'No grocery delivery integration']),
        our_moat: 'End-to-end execution: we cook and shop for your plan rather than just updating targets.',
        threat_level: 'High'
      },
      {
        id: 'comp_3',
        name: 'Carbon Diet Coach',
        category: 'Direct',
        market_cap_or_funding: 'Self-Funded (Layne Norton)',
        pricing: '$9.99/mo',
        strengths: JSON.stringify(['Celebrity trainer endorsement', 'Algorithmic weekly check-in logic']),
        weaknesses: JSON.stringify(['Rudimentary UI/UX', 'Manual food logging', 'Zero biometric wearable telemetry']),
        our_moat: 'Real-time wearable sync and instant meal visual scanning.',
        threat_level: 'Medium'
      },
      {
        id: 'comp_4',
        name: 'Eat This Much',
        category: 'Indirect',
        market_cap_or_funding: 'Early Seed',
        pricing: '$8.99/mo',
        strengths: JSON.stringify(['Automated daily meal plan generator', 'Basic grocery list export']),
        weaknesses: JSON.stringify(['Outdated recipe catalog', 'No athletic periodization']),
        our_moat: 'Tailored for strength sports with dynamic daily carb-cycling.',
        threat_level: 'Low'
      }
    ];

    for (const c of comps) {
      await pool.query(`
        INSERT INTO competitors (id, idea_id, name, category, market_cap_or_funding, pricing, strengths, weaknesses, our_moat, threat_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
      `, [c.id, ideaId, c.name, c.category, c.market_cap_or_funding, c.pricing, c.strengths, c.weaknesses, c.our_moat, c.threat_level]);
    }

    // 5. Revenue Analysis
    await pool.query(`
      INSERT INTO revenue_analyses (
        idea_id, model_type, cac, ltv, ltv_cac_ratio, gross_margin, payback_months, pricing_tiers, assumptions, unit_economics_summary
      ) VALUES (
        $1,
        'Consumer B2C Subscription + Grocery Affiliate Take-Rate',
        38.00,
        122.90,
        3.23,
        78.40,
        3.1,
        '[
          {"tier": "Free Starter", "price": "$0", "billing": "Forever free", "features": ["Basic barcode & plate scan", "Standard macro tracking", "Manual workout entry"]},
          {"tier": "Athlete Pro", "price": "$14.99", "billing": "per month or $119/year", "recommended": true, "features": ["Unlimited multimodal visual meal analysis", "Apple Health, Whoop & Garmin sync", "Dynamic daily carb & hydration cycling", "1-Click Instacart & Whole Foods cart export", "AI recipe generator with leftover matching"]},
          {"tier": "Coaching Club", "price": "$39.99", "billing": "per month", "features": ["Everything in Athlete Pro", "Monthly 1-on-1 sports nutritionist review", "Custom biomarker integration", "Priority feature access"]}
        ]'::jsonb,
        '[
          "Conversion rate from free trial to paid: 6.4%",
          "Monthly user churn rate: 4.8% after onboarding optimization",
          "Average grocery affiliate commission: 3.5% per fulfilled cart ($4.20/order)",
          "Blended cost per AI visual analysis: $0.0075"
        ]'::jsonb,
        'With a 3.2x LTV:CAC and a rapid 3.1 month payback window, the model achieves profitability on subscriber cohorts by month 4, well ahead of typical consumer subscription benchmarks.'
      )
      ON CONFLICT (idea_id) DO UPDATE SET ltv = EXCLUDED.ltv;
    `, [ideaId]);

    // 6. Structured Plan
    await pool.query(`
      INSERT INTO structured_plans (idea_id, product_strategy, tech_stack, architecture, milestones)
      VALUES (
        $1,
        '{"vision": "Eliminate all nutritional friction for strength athletes through autonomous biometrics and automated fulfillment.", "coreValueProp": "You lift the weights; NutriFit handles the macro calculation, recipe design, and grocery shopping.", "targetPersona": "Dedicated gym athlete (ages 22-42) training 4-6 days weekly.", "launchPhases": ["Closed TestFlight Beta with 500 competitive powerlifters", "Creator seeding with 25 evidence-based fitness YouTubers", "Public App Store launch with Instacart partnership"]}'::jsonb,
        '[
          {"category": "Client & Mobile", "items": [{"name": "React Native / Expo", "justification": "Cross-platform iOS & Android velocity with 60fps native performance"}, {"name": "CoreML / TFLite", "justification": "On-device meal bounding-box edge inference"}, {"name": "Tailwind / NativeWind", "justification": "Consistent design system tokens"}]},
          {"category": "Backend & Compute", "items": [{"name": "Python FastAPI", "justification": "High-throughput async endpoints for biometric ingestion"}, {"name": "PostgreSQL + pgvector", "justification": "Relational user records combined with recipe semantic embeddings"}, {"name": "Redis / Celery", "justification": "Background worker queues for image pipeline processing"}]},
          {"category": "AI & External APIs", "items": [{"name": "Claude 3.5 Sonnet / Vision", "justification": "Deep visual breakdown of complex mixed meals and sauce detection"}, {"name": "USDA FoodData Central", "justification": "Authoritative micronutrient and macronutrient grounding"}, {"name": "Instacart Connect API", "justification": "Direct programmatic grocery cart insertion"}]}
        ]'::jsonb,
        '{"type": "Event-Driven Microservices with Local Edge ML", "description": "Decoupled architecture prioritizing mobile responsiveness. Heavy image crunching is partitioned between on-device edge classification and distributed background workers.", "keyComponents": ["Mobile Client (React Native + HealthKit observer)", "API Gateway & Auth Service", "Biometric Ingestion Pipeline", "Macro Calculator & Meal Dispatcher", "Instacart Partner Connector"], "scalabilityNotes": "Stateless containerized services deployed on Kubernetes with Postgres read replicas."}'::jsonb,
        '[
          {"phase": "Sprint 1: Core Engine", "title": "Biometric Telemetry & Algorithm Grounding", "duration": "Weeks 1-4", "targetDate": "Nov 15, 2024", "goals": ["Connect HealthKit & Whoop webhooks", "Finalize carb-cycling dynamic solver algorithm"], "deliverables": ["Working algorithm spec", "Verified benchmark on 1,000 synthetic workout profiles"], "status": "done"},
          {"phase": "Sprint 2: MVP App", "title": "Multimodal Logging & Closed Alpha", "duration": "Weeks 5-8", "targetDate": "Dec 15, 2024", "goals": ["Ship TestFlight build to 500 powerlifters", "Achieve <800ms meal recognition"], "deliverables": ["iOS TestFlight binary", "Integrated Instacart cart export flow"], "status": "current"},
          {"phase": "Sprint 3: GTM & Scale", "title": "Public Launch & Fitness Creator Campaign", "duration": "Weeks 9-14", "targetDate": "Jan 15, 2025", "goals": ["Launch on Product Hunt & App Store", "Reach 5,000 active monthly subscribers"], "deliverables": ["Public marketing site", "Affiliate referral engine for gym coaches"], "status": "upcoming"}
        ]'::jsonb
      )
      ON CONFLICT (idea_id) DO UPDATE SET architecture = EXCLUDED.architecture;
    `, [ideaId]);

    // 7. Job Roles
    const roles = [
      {
        id: 'role_1',
        title: 'Lead Full-Stack / Mobile Architect',
        department: 'Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        required_skills: JSON.stringify(['React Native', 'TypeScript', 'FastAPI', 'PostgreSQL', 'HealthKit API']),
        preferred_skills: JSON.stringify(['CoreML', 'Tailwind CSS', 'Redis', 'Docker']),
        candidate_matches_count: 3
      },
      {
        id: 'role_2',
        title: 'Senior Computer Vision Engineer',
        department: 'AI & Data Science',
        type: 'Full-Time',
        urgency: 'Immediate',
        required_skills: JSON.stringify(['PyTorch', 'Object Detection', 'Food Recognition Models', 'Model Quantization', 'ONNX']),
        preferred_skills: JSON.stringify(['Edge AI', 'USDA Database API', 'CLIP', 'C++']),
        candidate_matches_count: 2
      },
      {
        id: 'role_3',
        title: 'Head of Growth & Fitness Creator Partnerships',
        department: 'Marketing & GTM',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        required_skills: JSON.stringify(['Creator Seeding', 'Performance Marketing', 'Community Building', 'Fitness Niche Mastery']),
        preferred_skills: JSON.stringify(['B2C Subscription Funnels', 'TikTok/Reels Production', 'Affiliate Programs']),
        candidate_matches_count: 1
      }
    ];

    for (const r of roles) {
      await pool.query(`
        INSERT INTO job_roles (id, idea_id, title, department, type, urgency, required_skills, preferred_skills, candidate_matches_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
      `, [r.id, ideaId, r.title, r.department, r.type, r.urgency, r.required_skills, r.preferred_skills, r.candidate_matches_count]);
    }

    // 8. Candidates / Talent Profiles
    const candidates = [
      {
        id: 'cand_1',
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        headline: 'Staff Mobile Architect • ex-Strava & Peloton',
        bio: 'Built real-time telemetry syncing for Strava segments with over 15M MAUs. Passionate marathoner and functional fitness competitor.',
        location: 'San Francisco, CA (Remote)',
        experience_years: 8,
        skills: JSON.stringify([
          {"name": "React Native", "matched": true},
          {"name": "TypeScript", "matched": true},
          {"name": "HealthKit API", "matched": true},
          {"name": "FastAPI", "matched": true},
          {"name": "CoreML", "matched": true},
          {"name": "GraphQL", "matched": false}
        ])
      },
      {
        id: 'cand_2',
        name: 'David Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        headline: 'Senior Computer Vision & Edge ML Lead • ex-Amazon Go',
        bio: 'Specialized in real-time food and retail item recognition under challenging lighting. Author of 3 CVPR papers on zero-shot instance segmentation.',
        location: 'Seattle, WA',
        experience_years: 7,
        skills: JSON.stringify([
          {"name": "PyTorch", "matched": true},
          {"name": "Object Detection", "matched": true},
          {"name": "Model Quantization", "matched": true},
          {"name": "ONNX", "matched": true},
          {"name": "Food Recognition Models", "matched": true},
          {"name": "TensorRT", "matched": false}
        ])
      },
      {
        id: 'cand_3',
        name: 'Maya Lin',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        headline: 'Head of Growth & Creator Partnerships • ex-Whoop',
        bio: 'Scaled Whoop affiliate program from $2M to $18M ARR by building authentic ambassador networks with competitive athletes.',
        location: 'Austin, TX',
        experience_years: 6,
        skills: JSON.stringify([
          {"name": "Creator Seeding", "matched": true},
          {"name": "Performance Marketing", "matched": true},
          {"name": "Fitness Niche Mastery", "matched": true},
          {"name": "B2C Subscription Funnels", "matched": true},
          {"name": "SEO & App Store Optimization", "matched": false}
        ])
      },
      {
        id: 'cand_4',
        name: 'Alexander Wright',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        headline: 'Distributed Systems & Data Platform Engineer • ex-Datadog',
        bio: 'Architected high-throughput ingestion pipelines processing 40k events/sec. Eager to partner with seed-stage founders on zero-to-one infrastructure.',
        location: 'New York, NY',
        experience_years: 9,
        skills: JSON.stringify([
          {"name": "FastAPI", "matched": true},
          {"name": "PostgreSQL", "matched": true},
          {"name": "Redis", "matched": true},
          {"name": "Docker", "matched": true},
          {"name": "React Native", "matched": false}
        ])
      },
      {
        id: 'cand_5',
        name: 'Sarah Jenkins',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        headline: 'Full-Stack React & Node Engineer • ex-ClassPass',
        bio: 'Built user-facing booking reservation flows and fitness recommendation feeds. Active powerlifter and open-source contributor.',
        location: 'Denver, CO (Remote)',
        experience_years: 5,
        skills: JSON.stringify([
          {"name": "TypeScript", "matched": true},
          {"name": "React Native", "matched": true},
          {"name": "PostgreSQL", "matched": true},
          {"name": "Tailwind CSS", "matched": true},
          {"name": "CoreML", "matched": false}
        ])
      },
      {
        id: 'cand_6',
        name: 'Kevin Patel',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        headline: 'Senior ML Ops & Quantization Engineer • ex-Apple CoreML',
        bio: 'Specialist in taking large multimodal transformers and compressing them to run in under 20ms on mobile Neural Engine chips.',
        location: 'Toronto, Canada',
        experience_years: 6,
        skills: JSON.stringify([
          {"name": "PyTorch", "matched": true},
          {"name": "Model Quantization", "matched": true},
          {"name": "ONNX", "matched": true},
          {"name": "CoreML", "matched": true},
          {"name": "Food Recognition Models", "matched": false}
        ])
      }
    ];

    for (const c of candidates) {
      await pool.query(`
        INSERT INTO talent_profiles (id, name, avatar, headline, bio, location, experience_years, skills)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
      `, [c.id, c.name, c.avatar, c.headline, c.bio, c.location, c.experience_years, c.skills]);
    }

    // 9. Startup Matches
    const matches = [
      {
        id: 'match_1',
        startup_name: 'NutriFit AI',
        role: 'Lead Full-Stack / Mobile Architect',
        match_percentage: 94,
        funding_stage: 'Pre-Seed ($750k raised)',
        location: 'San Francisco, CA (Hybrid / Remote)',
        equity_range: '1.5% - 3.0%',
        salary_range: '$140k - $175k',
        key_skills_matched: JSON.stringify(['React Native', 'TypeScript', 'HealthKit API', 'FastAPI']),
        missing_skills: JSON.stringify(['CoreML Model Optimization']),
        company_bio: 'Building the autonomous nutrition planner for serious lifters with dynamic carb-cycling and 1-click cart prep.',
        founder_name: 'Aarav Patel',
        logo_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=80&auto=format&fit=crop&q=80'
      },
      {
        id: 'match_2',
        startup_name: 'Lumina Health',
        role: 'Senior Computer Vision Engineer',
        match_percentage: 89,
        funding_stage: 'Seed ($3.2M, Founders Fund)',
        location: 'New York, NY',
        equity_range: '0.8% - 1.5%',
        salary_range: '$160k - $190k',
        key_skills_matched: JSON.stringify(['PyTorch', 'Object Detection', 'Food Recognition Models', 'ONNX']),
        missing_skills: JSON.stringify(['TensorRT High-Throughput Batching']),
        company_bio: 'Point-of-care dermatological and nutritional camera diagnostics on mobile.',
        founder_name: 'Dr. Camille Vance',
        logo_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=80&auto=format&fit=crop&q=80'
      },
      {
        id: 'match_3',
        startup_name: 'PulseMetrics',
        role: 'Founding Mobile Engineer',
        match_percentage: 86,
        funding_stage: 'Pre-Seed ($1M, Sequoia Scout)',
        location: 'Austin, TX (Remote)',
        equity_range: '2.0% - 4.0%',
        salary_range: '$130k - $160k',
        key_skills_matched: JSON.stringify(['React Native', 'TypeScript', 'Bluetooth LE', 'HealthKit API']),
        missing_skills: JSON.stringify(['Firmware OTA Protocol Handling']),
        company_bio: 'Real-time telemetry and barbell velocity tracker for Olympic weightlifting.',
        founder_name: 'Jackson Reed',
        logo_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=80&auto=format&fit=crop&q=80'
      },
      {
        id: 'match_4',
        startup_name: 'HyperScale Labs',
        role: 'Staff Distributed Systems Architect',
        match_percentage: 81,
        funding_stage: 'Seed ($4.5M, Founders Fund)',
        location: 'San Francisco, CA',
        equity_range: '1.0% - 2.0%',
        salary_range: '$180k - $220k',
        key_skills_matched: JSON.stringify(['Distributed Cache', 'FastAPI', 'PostgreSQL', 'Docker']),
        missing_skills: JSON.stringify(['eBPF Kernel Tracing', 'Raft Consensus Protocols', 'Rust Concurrency']),
        company_bio: 'Sub-millisecond model routing and caching mesh for enterprise generative AI.',
        founder_name: 'Taras Kowalski',
        logo_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=80&auto=format&fit=crop&q=80'
      },
      {
        id: 'match_5',
        startup_name: 'BioSync Dynamics',
        role: 'Senior ML Platform Lead',
        match_percentage: 77,
        funding_stage: 'Series A ($8M, Khosla)',
        location: 'Boston, MA',
        equity_range: '0.5% - 1.2%',
        salary_range: '$170k - $210k',
        key_skills_matched: JSON.stringify(['PyTorch', 'Model Quantization', 'PostgreSQL']),
        missing_skills: JSON.stringify(['Edge ONNX Quantization', 'HIPAA Architecture', 'TensorRT Serving']),
        company_bio: 'Continuous glucose monitoring insights paired with sleep staging AI.',
        founder_name: 'Sophia Sterling',
        logo_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=80&auto=format&fit=crop&q=80'
      },
      {
        id: 'match_6',
        startup_name: 'FitCore Engine',
        role: 'Full-Stack Platform Engineer',
        match_percentage: 74,
        funding_stage: 'Seed ($2.8M, Craft Ventures)',
        location: 'Remote',
        equity_range: '0.6% - 1.2%',
        salary_range: '$135k - $165k',
        key_skills_matched: JSON.stringify(['TypeScript', 'FastAPI', 'PostgreSQL', 'Redis']),
        missing_skills: JSON.stringify(['GraphQL Federation', 'Stripe Connect Multi-Tenant Payouts']),
        company_bio: 'Modern gym club management OS replacing legacy Mindbody systems.',
        founder_name: 'Garrett Holt',
        logo_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=80&auto=format&fit=crop&q=80'
      }
    ];

    for (const m of matches) {
      await pool.query(`
        INSERT INTO startup_matches (id, startup_name, role, match_percentage, funding_stage, location, equity_range, salary_range, key_skills_matched, missing_skills, company_bio, founder_name, logo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET match_percentage = EXCLUDED.match_percentage;
      `, [m.id, m.startup_name, m.role, m.match_percentage, m.funding_stage, m.location, m.equity_range, m.salary_range, m.key_skills_matched, m.missing_skills, m.company_bio, m.founder_name, m.logo_url]);
    }

    // 10. Applications & Rejection Reports
    const apps = [
      { id: 'app_1', company_name: 'HyperScale Labs', role: 'Staff Distributed Systems Architect', applied_date: '2024-10-08T00:00:00Z', status: 'Rejected', match_percentage: 81, has_report: true, stage_info: 'Technical Systems Architecture Interview' },
      { id: 'app_2', company_name: 'BioSync Dynamics', role: 'Senior ML Platform Lead', applied_date: '2024-10-04T00:00:00Z', status: 'Rejected', match_percentage: 77, has_report: true, stage_info: 'Take-Home Model Quantization Challenge' },
      { id: 'app_3', company_name: 'NutriFit AI', role: 'Lead Full-Stack / Mobile Architect', applied_date: '2024-10-14T00:00:00Z', status: 'Interviewing', match_percentage: 94, has_report: false, stage_info: 'Founder Technical Alignment with Aarav Patel' },
      { id: 'app_4', company_name: 'Lumina Health', role: 'Senior Computer Vision Engineer', applied_date: '2024-10-15T00:00:00Z', status: 'Under Review', match_percentage: 89, has_report: false, stage_info: 'Resume & Portfolio Screen' },
      { id: 'app_5', company_name: 'PulseMetrics', role: 'Founding Mobile Engineer', applied_date: '2024-09-28T00:00:00Z', status: 'Offer', match_percentage: 86, has_report: false, stage_info: 'Offer Extended • Equity Review in Progress' }
    ];

    for (const ap of apps) {
      await pool.query(`
        INSERT INTO applications (id, company_name, role, applied_date, status, match_percentage, has_report, stage_info)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
      `, [ap.id, ap.company_name, ap.role, ap.applied_date, ap.status, ap.match_percentage, ap.has_report, ap.stage_info]);
    }

    // Rejection report for app_1
    await pool.query(`
      INSERT INTO rejection_reports (
        id, application_id, role_title, company_name, stage, decision_date, primary_reason, summary, severity, missing_skills, focus_areas, target_re_evaluation_date, weeks_remaining, learning_timeline, recommended_mentor_id
      ) VALUES (
        'rep_hyperscale_01', 'app_1',
        'Staff Distributed Systems Architect',
        'HyperScale Labs',
        'Technical Systems Architecture Interview',
        '2024-10-12',
        'Candidate demonstrated deep expertise in application-tier caching and Python async services, but lacked hands-on production depth in low-level distributed consensus protocols (Raft/Paxos) and sub-millisecond eBPF network packet routing required for HyperScale’s L4 inference proxy.',
        'HyperScale Labs operates at the absolute frontier of high-throughput AI model routing. While your systems architecture score was strong (81%), the Staff role requires having diagnosed and mitigated p99 packet stalls directly in kernel space.',
        'moderate',
        '[
          {"skill": "eBPF Kernel Network Tracing", "gapDescription": "HyperScale filters 100k requests/sec at the XDP/eBPF layer. Did not pass kernel bypass design questions.", "severity": "major", "recommendedResource": "Brendan Gregg’s BPF Performance Tools & Cilium Deep Dive"},
          {"skill": "Raft Distributed Consensus Internals", "gapDescription": "Lacked concrete experience handling split-brain recovery and log compaction in custom Raft clusters.", "severity": "moderate", "recommendedResource": "MIT 6.824 Distributed Systems Lab (Implement Raft in Go/Rust)"},
          {"skill": "Rust Async Concurrency & Memory Safety", "gapDescription": "HyperScale’s proxy core is rewritten in Rust; candidate relied primarily on Python and Go examples.", "severity": "minor", "recommendedResource": "Tokio.rs architectural patterns and Tokio tracing crate"}
        ]'::jsonb,
        '[
          {"title": "Kernel-Level Network Acceleration", "description": "Build and deploy a proof-of-concept eBPF XDP filter that drops or routes SYN floods at wire speed.", "benchmark": "Demonstrate <20 microsecond latency overhead under 50k packets/sec load testing."},
          {"title": "Distributed State Machine Replication", "description": "Complete a functional Raft implementation passing network partition and leader election fuzz tests.", "benchmark": "Zero data loss during simulated 3-node chaos kill experiments."}
        ]'::jsonb,
        '2024-11-07',
        3,
        '[
          {"week": 1, "title": "eBPF & XDP Network Foundations", "focus": "Kernel socket programming & Cilium inspection", "tasks": ["Study Linux kernel networking stack & XDP hook points", "Build an eBPF program with BCC/libbpf that logs TCP round-trip delays", "Profile cache misses with perf and flamegraphs"], "status": "current"},
          {"week": 2, "title": "Raft Consensus from Scratch", "focus": "Leader election, log replication, and heartbeats", "tasks": ["Implement core RPCs: RequestVote and AppendEntries", "Write automated chaos test script simulating dropped packets", "Add persistent WAL state and snapshotting to disk"], "status": "upcoming"},
          {"week": 3, "title": "Rust Network Proxy Benchmark & Demo Project", "focus": "High-throughput async event loop with Tokio", "tasks": ["Build a lightweight TCP load balancer in Rust with zero-copy buffer sharing", "Benchmark with wrk2 to prove sub-millisecond p99 latency", "Schedule mock technical review with Mentor Marcus Vance"], "status": "upcoming"}
        ]'::jsonb,
        'mentor_1'
      )
      ON CONFLICT (application_id) DO UPDATE SET summary = EXCLUDED.summary;
    `);

    // 11. Mentors
    const mentors = [
      {
        id: 'mentor_1',
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: 'ex-VP Product at Peloton & Strava',
        company: 'Vance Advisory Group',
        bio: 'Led hardware & software subscriber retention at Peloton from $100M to $1B+ revenue. Expert in fitness community flywheel design, subscription pricing tier optimization, and mitigating Day-30 churn cliffs.',
        rating: 4.95,
        reviews_count: 48,
        hourly_rate: 250,
        domains: JSON.stringify(['B2C Fitness Subscriptions', 'Hardware & App Ecosystems', 'Retention Mechanics', 'GTM Strategy']),
        past_exits: JSON.stringify(['Peloton (IPO)', 'FitSync (Acquired by Under Armour)']),
        availability: 'Next slot tomorrow at 2:00 PM EST',
        available_slots: JSON.stringify(['Tomorrow, 2:00 PM EST', 'Thursday, 10:30 AM EST', 'Friday, 4:00 PM EST'])
      },
      {
        id: 'mentor_2',
        name: 'Sarah Lin',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        title: 'Founding Partner at Apex Seed & ex-Chief Architect at MyFitnessPal',
        company: 'Apex Ventures',
        bio: 'Architected the nutritional indexing engine powering 200M food logs daily. Now investing in early-stage consumer health tech and AI application layers.',
        rating: 5.0,
        reviews_count: 36,
        hourly_rate: 300,
        domains: JSON.stringify(['Nutrition Database Arch', 'Early-Stage Fundraising', 'Technical Diligence', 'Food Vision AI']),
        past_exits: JSON.stringify(['MyFitnessPal (Acquired for $475M)']),
        availability: 'Available Thursday',
        available_slots: JSON.stringify(['Thursday, 1:00 PM EST', 'Friday, 11:00 AM EST'])
      },
      {
        id: 'mentor_3',
        name: 'Dr. Aris Thorne',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        title: 'PhD Sports Biomechanics & Chief Nutrition Advisor',
        company: 'Human Performance Lab',
        bio: 'Advises Olympic track athletes and UFC champions on periodized caloric expenditure and hypertrophy timing.',
        rating: 4.88,
        reviews_count: 29,
        hourly_rate: 200,
        domains: JSON.stringify(['Sports Science', 'Nutritional Physiology', 'Metabolic Rate Modeling', 'Clinical Regulatory']),
        past_exits: JSON.stringify(['BioMetric Health (Acquired)']),
        availability: 'Available next Monday',
        available_slots: JSON.stringify(['Monday, 9:00 AM EST', 'Tuesday, 3:00 PM EST'])
      },
      {
        id: 'mentor_4',
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        title: 'ex-Head of Growth at Noom',
        company: 'Sharma Growth Advisory',
        bio: 'Architect of Noom psychology-driven onboarding quiz funnel that reduced customer acquisition costs by 45%.',
        rating: 4.92,
        reviews_count: 42,
        hourly_rate: 220,
        domains: JSON.stringify(['Onboarding Funnel Optimization', 'Behavioral Psychology', 'Paid Acquisition', 'LTV Expansion']),
        past_exits: JSON.stringify(['Noom (Unicorn Scale)']),
        availability: 'Available Wednesday',
        available_slots: JSON.stringify(['Wednesday, 11:00 AM EST', 'Thursday, 3:00 PM EST'])
      },
      {
        id: 'mentor_5',
        name: "Liam O'Connor",
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        title: 'Founder of FitScale & Angel Investor',
        company: 'O’Connor Ventures',
        bio: 'Built and scaled smart connected gym equipment and companion software. Angel investor in 14 consumer health startups with 3 exits.',
        rating: 4.97,
        reviews_count: 51,
        hourly_rate: 350,
        domains: JSON.stringify(['Hardware Integration', 'Seed Fundraising', 'Board Governance', 'Founder Scaling']),
        past_exits: JSON.stringify(['FitScale (Acquired by Under Armour)', 'GymOS (Acquired)']),
        availability: 'Available in 3 days',
        available_slots: JSON.stringify(['Friday, 1:30 PM EST', 'Saturday, 11:00 AM EST'])
      },
      {
        id: 'mentor_6',
        name: 'Rachel Green',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        title: 'Head of Enterprise GTM at HealthTech Collective',
        company: 'HealthTech Collective',
        bio: 'Negotiated B2B enterprise wellness contracts with Fortune 500 employer benefits teams and luxury gym chains.',
        rating: 4.79,
        reviews_count: 22,
        hourly_rate: 180,
        domains: JSON.stringify(['Enterprise B2B2C Sales', 'Corporate Wellness', 'Gym Partnerships', 'Channel Distribution']),
        past_exits: JSON.stringify(['WellPass (Acquired)']),
        availability: 'Available Friday',
        available_slots: JSON.stringify(['Friday, 10:00 AM EST', 'Monday, 2:00 PM EST'])
      },
      {
        id: 'mentor_7',
        name: 'Viktor Vance',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        title: 'Venture Partner & ex-Y Combinator Visiting Partner',
        company: 'Horizon Capital',
        bio: 'Mentored over 60 YC batches through product-market fit pivots, deck storytelling, and Series A fundraising rounds.',
        rating: 4.94,
        reviews_count: 65,
        hourly_rate: 275,
        domains: JSON.stringify(['YC Application Prep', 'Pitch Deck Storytelling', 'Cap Table Structure', 'Term Sheet Negotiation']),
        past_exits: JSON.stringify(['CloudMatrix (IPO)', 'DevFlow (Acquired)']),
        availability: 'Available Thursday',
        available_slots: JSON.stringify(['Thursday, 4:00 PM EST', 'Friday, 9:00 AM EST'])
      },
      {
        id: 'mentor_8',
        name: 'Jessica Chen',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: 'CTO at Autonomous Labs & ex-Google Brain Staff AI',
        company: 'Autonomous Labs',
        bio: 'Specialist in low-latency multimodal computer vision systems, edge quantization, and distributed inference cluster optimization.',
        rating: 4.91,
        reviews_count: 38,
        hourly_rate: 320,
        domains: JSON.stringify(['Multimodal LLMs', 'Edge AI Deployment', 'PyTorch Optimization', 'Inference Latency']),
        past_exits: JSON.stringify(['Visionary AI (Acquired by Google)']),
        availability: 'Available next Tuesday',
        available_slots: JSON.stringify(['Tuesday, 1:00 PM EST', 'Wednesday, 2:30 PM EST'])
      }
    ];

    for (const m of mentors) {
      await pool.query(`
        INSERT INTO mentors (id, name, avatar, title, company, bio, rating, reviews_count, hourly_rate, domains, past_exits, availability, available_slots)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, rating = EXCLUDED.rating;
      `, [m.id, m.name, m.avatar, m.title, m.company, m.bio, m.rating, m.reviews_count, m.hourly_rate, m.domains, m.past_exits, m.availability, m.available_slots]);
    }

    // 12. Mentor Requests
    await pool.query(`
      INSERT INTO mentor_requests (id, mentor_id, mentor_name, mentor_avatar, founder_name, startup_name, topic, message, proposed_time, status)
      VALUES (
        'req_1', 'mentor_1', 'Marcus Vance',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'Aarav Patel', 'NutriFit AI',
        'Mitigating Day-30 Churn & Instacart Affiliate Economics',
        'Hi Marcus, our AI validation score flagged gym nutrition churn at day 21. We would love 45 minutes of your time to review our habit loop design and discuss retention metrics from your Peloton and Strava days.',
        'Tomorrow, 2:00 PM EST',
        'accepted'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 13. Outreach Messages
    const msgs = [
      { id: 'out_1', idea_id: ideaId, candidate_id: 'cand_1', candidate_name: 'Elena Rostova', candidate_role: 'Staff Mobile Architect', subject: 'Lead Mobile Architect role at NutriFit AI (94% Match • Pre-Seed)', body: 'Hi Elena, I was thoroughly impressed by your background scaling telemetry sync at Strava. We are building NutriFit AI to automate macro carb-cycling for strength athletes with 1-click grocery fulfillment.', stage: 'In Conversation', status: 'responded' },
      { id: 'out_2', idea_id: ideaId, candidate_id: 'cand_2', candidate_name: 'David Chen', candidate_role: 'Senior Computer Vision Engineer', subject: 'Computer Vision Lead at NutriFit AI — Food Segmentation on Edge', body: 'Hi David, saw your CVPR work on real-time item detection at Amazon Go. We are solving multi-item plate estimation with on-device CoreML and would love to chat about our technical roadmap.', stage: 'Sent', status: 'sent' },
      { id: 'out_3', idea_id: ideaId, candidate_id: 'cand_3', candidate_name: 'Maya Lin', candidate_role: 'Head of Growth', subject: 'Founding Growth Lead — NutriFit AI', body: 'Hi Maya, your track record building Whoop’s athletic community is legendary in the fitness tech space. We are preparing our closed beta with 500 competitive lifters and want you to lead our creator seeding strategy.', stage: 'In Conversation', status: 'opened' },
      { id: 'out_4', idea_id: ideaId, candidate_id: 'cand_4', candidate_name: 'Alexander Wright', candidate_role: 'Distributed Systems Engineer', subject: 'Draft: Senior Backend Infrastructure Architect', body: 'Hi Alexander, we are looking for a distributed caching expert to architect our low-latency food indexing engine.', stage: 'Drafts', status: 'draft' }
    ];

    for (const msg of msgs) {
      await pool.query(`
        INSERT INTO outreach_messages (id, idea_id, candidate_id, candidate_name, candidate_role, subject, body, stage, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET stage = EXCLUDED.stage;
      `, [msg.id, msg.idea_id, msg.candidate_id, msg.candidate_name, msg.candidate_role, msg.subject, msg.body, msg.stage, msg.status]);
    }

    console.log('✅ Successfully seeded all verified initial records into Supabase!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
