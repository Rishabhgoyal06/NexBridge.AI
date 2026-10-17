import { pool } from '../db/supabase.js';

export interface IdeaValidationInput {
  title: string;
  tagline?: string;
  description: string;
  targetMarket?: string;
  category?: string;
}

export const aiAgentService = {
  /**
   * Orchestrates parallel execution of the 5 AI agents and synthesis
   */
  async runParallelValidation(input: IdeaValidationInput) {
    const { title, tagline, description, targetMarket, category } = input;
    const ideaId = `idea_${Date.now()}`;

    // Agent 1: Market Analyst
    const runMarketAnalyst = async () => {
      // Simulate parallel reasoning / API call
      await new Promise((res) => setTimeout(res, 600));
      return {
        id: `agent_market_${Date.now()}`,
        name: 'Market Analyst',
        role_title: 'Demand & Willingness-To-Pay',
        icon: 'insights',
        score: Math.floor(Math.random() * 12) + 78, // 78 - 90
        status: 'completed',
        verdict: `Strong customer intent identified in ${targetMarket || 'target segment'}. Verified willingness to pay for automated solutions.`,
        detailed_analysis: `Interviews and search intent analysis show user friction is at an all-time high with manual workflows for ${title}. Target personas exhibit strong disposable budget for specialized productivity software.`,
        key_findings: [
          'High demographic concentration with recurring disposable budget',
          'Search volume for autonomous alternatives grew 48% YoY',
          'Willingness to pay validated across comparable B2C/B2B tier pricing'
        ],
        concerns: [
          'Seasonal fluctuations in user engagement',
          'Rising blended paid customer acquisition costs on social channels'
        ]
      };
    };

    // Agent 2: Competitor Researcher
    const runCompetitorResearcher = async () => {
      await new Promise((res) => setTimeout(res, 800));
      return {
        id: `agent_comp_${Date.now()}`,
        name: 'Competitor Researcher',
        role_title: 'Moat & Landscape Mapping',
        icon: 'radar',
        score: Math.floor(Math.random() * 14) + 65, // 65 - 79
        status: 'completed',
        verdict: `Incumbents rely on legacy manual databases; open niche for autonomous closed-loop execution.`,
        detailed_analysis: `Leading category incumbents provide passive retrospective logging. The whitespace for ${title} lies in closing the execution loop through automated third-party integrations and dynamic real-time adjustments.`,
        key_findings: [
          'Legacy category leaders burdened by technical debt and outdated interfaces',
          'Proprietary algorithm + edge inference creates defensible barrier to entry',
          'High user willingness to switch from ad-supported incumbents'
        ],
        concerns: [
          'Feature fast-following risk from well-capitalized incumbents',
          'High brand loyalty among conservative legacy users'
        ]
      };
    };

    // Agent 3: Revenue Critic
    const runRevenueCritic = async () => {
      await new Promise((res) => setTimeout(res, 750));
      return {
        id: `agent_rev_${Date.now()}`,
        name: 'Revenue Critic',
        role_title: 'Unit Economics & Margins',
        icon: 'payments',
        score: Math.floor(Math.random() * 10) + 72, // 72 - 82
        status: 'completed',
        verdict: `Healthy 3.1x - 3.4x LTV:CAC if Day-90 churn is actively mitigated through behavioral hooks.`,
        detailed_analysis: `Subscription model with gross margin target of 78% is sustainable provided inference costs are capped on-device. Affiliate revenue streams provide an immediate secondary margin expansion buffer.`,
        key_findings: [
          'Subscription tier of $14.99 - $19.99/mo yields healthy unit contribution margin',
          'Secondary affiliate partner commissions lift average customer lifetime value by ~18%',
          'Payback period under 3.5 months on organic/creator referral cohorts'
        ],
        concerns: [
          'LLM token and computer vision cloud API costs on high-frequency power users',
          'Payment processor chargeback risks on long-term annual pre-paid contracts'
        ]
      };
    };

    // Agent 4: Technical Architect
    const runTechnicalArchitect = async () => {
      await new Promise((res) => setTimeout(res, 900));
      return {
        id: `agent_arch_${Date.now()}`,
        name: 'Technical Architect',
        role_title: 'Feasibility & Stack Blueprint',
        icon: 'terminal',
        score: Math.floor(Math.random() * 10) + 80, // 80 - 90
        status: 'completed',
        verdict: `Feasible using decoupled microservices with edge quantized inference on mobile clients.`,
        detailed_analysis: `Mobile client in React Native backed by high-throughput async Python/FastAPI microservices and PostgreSQL with pgvector for semantic retrieval. Asynchronous worker queues guarantee sub-second user responsiveness.`,
        key_findings: [
          'Sub-800ms pipeline execution achievable using on-device quantized models',
          'Event-driven worker architecture prevents mobile UI lag during heavy AI workloads',
          'OAuth and biometric telemetry webhooks establish seamless continuous synchronization'
        ],
        concerns: [
          'Ambient lighting and complex edge cases requiring human-in-the-loop review',
          'Strict regulatory and data privacy compliance for user health and biometric telemetry'
        ]
      };
    };

    // Agent 5: Skeptic
    const runSkeptic = async () => {
      await new Promise((res) => setTimeout(res, 650));
      return {
        id: `agent_skep_${Date.now()}`,
        name: 'Skeptic',
        role_title: 'Pre-Mortem & Threat Model',
        icon: 'warning',
        score: Math.floor(Math.random() * 12) + 55, // 55 - 67
        status: 'flagged',
        verdict: `Danger Zone: High Day-30 user dropout risk. Habit formation must be core, not just algorithmic math.`,
        detailed_analysis: `Founders repeatedly fail in this vertical because users lose discipline after 3-4 weeks. Without friction-free zero-touch input and immediate external accountability, the 60-day retention curve will degrade rapidly.`,
        key_findings: [
          'Steep initial 28-day user dropout observed in comparable consumer software',
          'Users default to repeating the same habits without ongoing novelty and streaks',
          'Reliance on external partner APIs introduces platform dependency risk'
        ],
        concerns: [
          'Partner API rate limits or policy changes disrupting core user workflows',
          'Liability risks for automated guidance without human expert verification disclaimer'
        ]
      };
    };

    // Run all 5 agents concurrently in parallel
    const [marketAgent, compAgent, revAgent, archAgent, skepticAgent] = await Promise.all([
      runMarketAnalyst(),
      runCompetitorResearcher(),
      runRevenueCritic(),
      runTechnicalArchitect(),
      runSkeptic()
    ]);

    const agents = [marketAgent, compAgent, revAgent, archAgent, skepticAgent];

    // Synthesizer calculates composite score
    const compositeScore = Math.round(
      (marketAgent.score * 0.25) +
      (compAgent.score * 0.20) +
      (revAgent.score * 0.25) +
      (archAgent.score * 0.20) +
      (skepticAgent.score * 0.10)
    );

    const signal =
      compositeScore >= 75
        ? 'Strong Signal'
        : compositeScore >= 65
        ? 'Moderate Signal'
        : 'Caution';

    const metrics = {
      marketDemand: marketAgent.score,
      unitEconomics: revAgent.score,
      technicalFeasibility: archAgent.score,
      competitiveMoat: compAgent.score,
      timingExecution: 82
    };

    const risks = [
      {
        title: 'Day-30 Retention Cliff',
        severity: 'high',
        description: 'User discipline drops steeply after initial novelty wears off.',
        mitigation: 'Implement zero-touch biometric synchronization, social streaks, and automated fulfillment.'
      },
      {
        title: 'Cloud Inference Overhead',
        severity: 'medium',
        description: 'Frequent multimodal vision queries can erode subscription margins.',
        mitigation: 'Quantize edge models on-device and query cloud only for high-complexity queries.'
      },
      {
        title: 'Platform API Dependency',
        severity: 'medium',
        description: 'Third-party delivery and wearable partners may update access policies.',
        mitigation: 'Support multi-vendor fallback adapters and direct CSV/universal cart exports.'
      }
    ];

    const strengths = [
      {
        title: 'Closed-Loop Automated Execution',
        description: 'Transforms raw calculations directly into fulfilled actions and groceries.',
        score: 94
      },
      {
        title: 'Real-Time Biometric Calibration',
        description: 'Continuously adapts targets based on wearable biometric exertion telemetry.',
        score: 91
      },
      {
        title: 'High-Margin Secondary Monetization',
        description: 'Affiliate commission layer yields 18% additional profit per active subscriber.',
        score: 88
      }
    ];

    // Save newly created Idea into Supabase
    await pool.query(`
      INSERT INTO ideas (
        id, title, tagline, description, category, target_market, stage, score, status, signal, metrics, risks, strengths
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      ideaId,
      title,
      tagline || `Autonomous AI solution for ${targetMarket || 'modern teams'}`,
      description,
      category || 'AI & Productivity',
      targetMarket || 'Technical professionals & operators',
      'Pre-Seed / Validated',
      compositeScore,
      'validated',
      signal,
      JSON.stringify(metrics),
      JSON.stringify(risks),
      JSON.stringify(strengths)
    ]);

    // Save the 5 agents
    for (const ag of agents) {
      await pool.query(`
        INSERT INTO validation_agents (id, idea_id, name, role_title, icon, score, status, verdict, detailed_analysis, key_findings, concerns)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [ag.id, ideaId, ag.name, ag.role_title, ag.icon, ag.score, ag.status, ag.verdict, ag.detailed_analysis, JSON.stringify(ag.key_findings), JSON.stringify(ag.concerns)]);
    }

    // Save Competitors
    const defaultCompetitors = [
      { id: `comp_1_${Date.now()}`, name: 'Legacy Category Leader', category: 'Legacy', market: '$1B+ valuation', pricing: '$19.99/mo', moat: 'Frictionless automated execution versus manual legacy data entry.', threat: 'Medium' },
      { id: `comp_2_${Date.now()}`, name: 'Direct Specialized Startup', category: 'Direct', market: 'Series A ($8M)', pricing: '$12.99/mo', moat: 'Autonomous third-party grocery and delivery fulfillment.', threat: 'High' }
    ];
    for (const c of defaultCompetitors) {
      await pool.query(`
        INSERT INTO competitors (id, idea_id, name, category, market_cap_or_funding, pricing, strengths, weaknesses, our_moat, threat_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [c.id, ideaId, c.name, c.category, c.market, c.pricing, '["Established brand awareness"]', '["Manual logging fatigue"]', c.moat, c.threat]);
    }

    // Save Revenue Model
    await pool.query(`
      INSERT INTO revenue_analyses (idea_id, model_type, cac, ltv, ltv_cac_ratio, gross_margin, payback_months, pricing_tiers, assumptions, unit_economics_summary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      ideaId,
      'Consumer / Enterprise Tiered SaaS + Partner Take-Rate',
      38.00,
      124.00,
      3.26,
      78.00,
      3.1,
      JSON.stringify([
        { tier: 'Starter', price: '$0', billing: 'Free tier', features: ['Core features', 'Standard limits'] },
        { tier: 'Pro Athlete / Pro', price: '$14.99', billing: 'per month', recommended: true, features: ['Unlimited multimodal analyses', 'Full biometric sync', '1-Click fulfillment'] },
        { tier: 'Enterprise / Coaching', price: '$39.99', billing: 'per month', features: ['Dedicated advisor sessions', 'Priority API limits'] }
      ]),
      JSON.stringify(['Conversion rate from trial: 6.2%', 'Average subscriber lifetime: 8.4 months']),
      'Projected 3.26x LTV:CAC with cohort profitability achieved by month 4.'
    ]);

    // Save Structured Plan
    await pool.query(`
      INSERT INTO structured_plans (idea_id, product_strategy, tech_stack, architecture, milestones)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      ideaId,
      JSON.stringify({
        vision: `Automate repetitive workflows for ${title} through proactive AI agents.`,
        coreValueProp: 'Eliminate friction through autonomous closed-loop execution.',
        targetPersona: targetMarket || 'High-performing operators',
        launchPhases: ['Closed Beta with 500 power users', 'Influencer/Creator seeding', 'Public launch']
      }),
      JSON.stringify([
        { category: 'Client & Mobile', items: [{ name: 'React Native / Web', justification: 'Cross-platform velocity' }] },
        { category: 'Backend & Compute', items: [{ name: 'Python FastAPI', justification: 'Async agent orchestration' }, { name: 'PostgreSQL + pgvector', justification: 'Hybrid relational and semantic search' }] },
        { category: 'AI Infrastructure', items: [{ name: 'Multimodal LLM', justification: 'Context synthesis and vision analysis' }] }
      ]),
      JSON.stringify({
        type: 'Event-Driven Microservices',
        description: 'Decoupled services with edge inference on client and background asynchronous queue.',
        keyComponents: ['Web/Mobile Client', 'API Gateway', 'Ingestion Pipeline', 'Synthesizer Engine'],
        scalabilityNotes: 'Containerized stateless services with Postgres read replicas.'
      }),
      JSON.stringify([
        { phase: 'Sprint 1', title: 'Core Validation & Telemetry', duration: 'Weeks 1-4', targetDate: 'Nov 15, 2024', goals: ['Ground algorithmic models', 'Verify benchmarks'], deliverables: ['Working algorithm spec'], status: 'done' },
        { phase: 'Sprint 2', title: 'Alpha Release & Team Build', duration: 'Weeks 5-8', targetDate: 'Dec 15, 2024', goals: ['Ship closed alpha to 500 testers'], deliverables: ['Working binary'], status: 'current' },
        { phase: 'Sprint 3', title: 'Public GTM Launch', duration: 'Weeks 9-14', targetDate: 'Jan 15, 2025', goals: ['Scale to 5,000 active subscribers'], deliverables: ['Marketing site'], status: 'upcoming' }
      ])
    ]);

    // Save Synthesized Job Roles
    const roles = [
      { id: `role_1_${Date.now()}`, title: 'Lead Full-Stack / Mobile Architect', dept: 'Engineering', type: 'Co-Founder', urg: 'Immediate', req: ['React Native', 'TypeScript', 'FastAPI'], pref: ['PostgreSQL', 'Docker'], count: 3 },
      { id: `role_2_${Date.now()}`, title: 'Senior AI / Computer Vision Engineer', dept: 'Engineering', type: 'Full-Time', urg: 'Immediate', req: ['PyTorch', 'Model Quantization', 'ONNX'], pref: ['C++', 'CUDA'], count: 2 },
      { id: `role_3_${Date.now()}`, title: 'Head of Growth & Creator Partnerships', dept: 'Growth', type: 'Full-Time', urg: 'Next Quarter', req: ['Performance Marketing', 'Creator Seeding'], pref: ['B2C Funnels'], count: 1 }
    ];
    for (const r of roles) {
      await pool.query(`
        INSERT INTO job_roles (id, idea_id, title, department, type, urgency, required_skills, preferred_skills, candidate_matches_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [r.id, ideaId, r.title, r.dept, r.type, r.urg, JSON.stringify(r.req), JSON.stringify(r.pref), r.count]);
    }

    return {
      id: ideaId,
      title,
      tagline: tagline || `Autonomous AI solution for ${targetMarket || 'modern teams'}`,
      description,
      category: category || 'AI & Productivity',
      targetMarket: targetMarket || 'Technical professionals & operators',
      stage: 'Pre-Seed / Validated',
      score: compositeScore,
      status: 'validated',
      signal,
      metrics,
      agents,
      risks,
      strengths
    };
  }
};
