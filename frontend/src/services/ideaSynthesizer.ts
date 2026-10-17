import {
  Idea,
  ValidationAgent,
  Competitor,
  RevenueAnalysis,
  StructuredPlan,
  JobRole,
  Candidate,
} from '../types';

export interface IdeaInput {
  title: string;
  description: string;
  targetMarket?: string;
  tagline?: string;
  category?: string;
  id?: string;
}

type DomainKey =
  | 'health_fitness'
  | 'fintech_crypto'
  | 'devtools_infra'
  | 'cybersecurity'
  | 'edtech'
  | 'robotics_hardware'
  | 'ecommerce_retail'
  | 'legaltech_proptech'
  | 'cleantech_energy'
  | 'b2b_saas';

function detectDomain(text: string): DomainKey {
  const lower = text.toLowerCase();

  if (/drone|robot|hardware|iot|sensor|autonomous vehicle|firmware|agritech|agriculture|embedded|farm|rover/i.test(lower)) {
    return 'robotics_hardware';
  }
  if (/health|fitness|meal|diet|gym|workout|nutrition|patient|clinic|doctor|hospital|biometric|wearable|medical|radiology|dental|therapy|pharma|wellness/i.test(lower)) {
    return 'health_fitness';
  }
  if (/fintech|finance|payment|bank|crypto|wallet|invoice|payroll|accounting|tax|lending|credit|trading|invest|stablecoin|defi|remittance|ledger/i.test(lower)) {
    return 'fintech_crypto';
  }
  if (/cyber|security|phishing|malware|vulnerability|zero trust|firewall|threat|encryption|audit|pentest|compliance|soc2|identity/i.test(lower)) {
    return 'cybersecurity';
  }
  if (/developer|devtools|compiler|ide|github|sdk|kubernetes|observability|ci\/cd|pipeline|testing|code review|ast|wasm|api gateway|profiler/i.test(lower)) {
    return 'devtools_infra';
  }
  if (/learn|student|teacher|tutor|course|school|university|education|quiz|upskill|curriculum|academy|study/i.test(lower)) {
    return 'edtech';
  }
  if (/legal|law|contract|lawyer|attorney|clause|litigation|tenant|landlord|real estate|mortgage|property|lease|proptech/i.test(lower)) {
    return 'legaltech_proptech';
  }
  if (/climate|energy|solar|battery|carbon|grid|recycle|sustainability|emissions|water|cleantech/i.test(lower)) {
    return 'cleantech_energy';
  }
  if (/ecommerce|e-commerce|retail|shop|store|merchant|cart|checkout|d2c|marketplace|clothing|fashion|dropship|inventory/i.test(lower)) {
    return 'ecommerce_retail';
  }
  return 'b2b_saas';
}

export function synthesizeIdea(input: IdeaInput): Idea {
  const title = input.title.trim() || 'NovaVenture AI';
  const description =
    input.description.trim() ||
    'An autonomous AI-powered platform transforming operational friction into competitive advantage.';
  const combinedText = `${title} ${description} ${input.tagline || ''} ${input.targetMarket || ''} ${input.category || ''}`;
  const domain = detectDomain(combinedText);

  const targetMarket =
    input.targetMarket?.trim() ||
    (domain === 'health_fitness'
      ? 'Strength athletes, functional fitness gyms, and proactive wellness consumers'
      : domain === 'fintech_crypto'
      ? 'Digital-first SMBs, cross-border contractors, and modern finance teams'
      : domain === 'devtools_infra'
      ? 'High-growth engineering teams, systems developers, and platform architects'
      : domain === 'cybersecurity'
      ? 'Mid-market security teams, healthcare institutions, and compliance officers'
      : domain === 'edtech'
      ? 'STEM students, self-directed upskillers, and higher-ed institutions'
      : domain === 'robotics_hardware'
      ? 'Commercial agriculture operators, precision inspection teams, and logistics fleets'
      : domain === 'ecommerce_retail'
      ? 'Independent omnichannel brands, boutique merchants, and D2C operators'
      : domain === 'legaltech_proptech'
      ? 'Corporate counsel, boutique law practices, and commercial real estate firms'
      : domain === 'cleantech_energy'
      ? 'Commercial building managers, renewable energy operators, and grid planners'
      : 'Mid-to-enterprise revenue teams, operations leaders, and modern founders');

  const tagline =
    input.tagline?.trim() ||
    (domain === 'health_fitness'
      ? 'Autonomous biometric intelligence & verified protocol fulfillment'
      : domain === 'fintech_crypto'
      ? 'Next-generation programmable financial infrastructure with zero-reconciliation overhead'
      : domain === 'devtools_infra'
      ? 'Autonomous code verification, AST synthesis, and sub-second developer feedback loops'
      : domain === 'cybersecurity'
      ? 'Autonomous threat modeling & continuous zero-trust policy verification'
      : domain === 'edtech'
      ? 'Socratic multimodal AI tutor calibrated to real-time cognitive mastery'
      : domain === 'robotics_hardware'
      ? 'Autonomous edge perception & precision aerial mission dispatch'
      : domain === 'ecommerce_retail'
      ? 'Real-time hyper-personalized commerce intelligence and inventory orchestration'
      : domain === 'legaltech_proptech'
      ? 'Precision legal telemetry, automated clause risk scoring, and contract synthesis'
      : domain === 'cleantech_energy'
      ? 'AI grid telemetry, dynamic carbon optimization, and distributed resource balancing'
      : 'Autonomous execution engine transforming fragmented operations into defensible workflow velocity');

  const category =
    input.category?.trim() ||
    (domain === 'health_fitness'
      ? 'HealthTech & Consumer AI'
      : domain === 'fintech_crypto'
      ? 'FinTech & Payments Infrastructure'
      : domain === 'devtools_infra'
      ? 'DevTools & AI Engineering'
      : domain === 'cybersecurity'
      ? 'Cybersecurity & Compliance'
      : domain === 'edtech'
      ? 'EdTech & Cognitive Systems'
      : domain === 'robotics_hardware'
      ? 'Autonomous Systems & Robotics'
      : domain === 'ecommerce_retail'
      ? 'Commerce & Intelligent Marketplaces'
      : domain === 'legaltech_proptech'
      ? 'LegalTech & Asset Intelligence'
      : domain === 'cleantech_energy'
      ? 'CleanTech & Energy Systems'
      : 'B2B Enterprise SaaS & Automation');

  // Multi-Vector Scores (computed deterministically from input text hash to keep it stable yet unique)
  let seed = 0;
  for (let i = 0; i < combinedText.length; i++) {
    seed = (seed << 5) - seed + combinedText.charCodeAt(i);
    seed |= 0;
  }
  const pos = Math.abs(seed);
  const demandScore = 78 + (pos % 12);
  const econScore = 72 + ((pos >> 2) % 14);
  const techScore = 75 + ((pos >> 4) % 15);
  const moatScore = 70 + ((pos >> 6) % 16);
  const timingScore = 79 + ((pos >> 8) % 11);
  const overallScore = Math.round(
    demandScore * 0.25 + econScore * 0.2 + techScore * 0.25 + moatScore * 0.2 + timingScore * 0.1
  );

  const signal = overallScore >= 80 ? 'Strong Signal' : overallScore >= 70 ? 'Moderate Signal' : 'Caution';

  // 1. Agents Synthesis
  const agents: ValidationAgent[] = [
    {
      id: `agent_market_${title.toLowerCase().replace(/\s+/g, '_')}`,
      name: 'Market Analyst',
      roleTitle: 'Demand & Willingness-To-Pay',
      icon: 'insights',
      score: demandScore,
      status: 'completed',
      verdict: `Strong macro tailwinds in ${category}. Buyer willingness to pay verified for high-urgency pain points.`,
      detailedAnalysis: `Targeting ${targetMarket} addresses a persistent friction where existing tooling is fragmented and reactive. Market sentiment analysis confirms high intent to adopt software that directly eliminates manual overhead in ${title}.`,
      keyFindings: [
        `High concentration of decision-makers in ${targetMarket} actively searching for automation alternatives.`,
        `Willingness to pay validated across comparable industry cohorts.`,
        `Low saturation in closed-loop automated execution creates early mover advantage.`,
      ],
      concerns: [
        'Early sales motion requires crisp ROI demonstration within the first 14 days.',
        'High competitive noise from incumbent point solutions requires bold positioning.',
      ],
    },
    {
      id: `agent_competitors_${title.toLowerCase().replace(/\s+/g, '_')}`,
      name: 'Competitor Researcher',
      roleTitle: 'Moat & Landscape Mapping',
      icon: 'radar',
      score: moatScore,
      status: 'completed',
      verdict: `Legacy vendors suffer from technical debt and passive workflows; ${title} holds an execution moat.`,
      detailedAnalysis: `Incumbents rely on legacy architectures that mandate repetitive human effort. ${title} differentiates through real-time autonomous intelligence and direct outcome fulfillment rather than passive reporting.`,
      keyFindings: [
        'Incumbents are burdened by complex legacy codebases, slowing feature innovation.',
        'No major competitor offers closed-loop automation directly tailored to this persona.',
        `Defensibility compounds via proprietary interaction data and workflow integration locks.`,
      ],
      concerns: [
        'Well-funded incumbents could attempt fast-follower feature releases if defensibility is purely UI-layer.',
        'Channel partnerships must be secured early to preempt distribution copycats.',
      ],
    },
    {
      id: `agent_revenue_${title.toLowerCase().replace(/\s+/g, '_')}`,
      name: 'Revenue Critic',
      roleTitle: 'Unit Economics & Margins',
      icon: 'payments',
      score: econScore,
      status: 'completed',
      verdict: `Target unit economics show 3.2x+ LTV:CAC potential with healthy gross margins above 75%.`,
      detailedAnalysis: `Financial modeling indicates favorable gross margins net of cloud and AI inference overhead. Customer payback periods can be contained within 3 to 6 months by leading with high-conviction annual billing incentives.`,
      keyFindings: [
        'Pricing architecture supports expansion tiers and expansion revenue per customer.',
        'Cloud and inference costs scale sub-linearly with proper edge and caching design.',
        'High customer switching costs yield low baseline annual churn once embedded.',
      ],
      concerns: [
        'Customer acquisition costs must be carefully monitored across paid and outbound channels.',
        'Trial-to-paid conversion rates require frictionless onboarding and instant time-to-value.',
      ],
    },
    {
      id: `agent_tech_${title.toLowerCase().replace(/\s+/g, '_')}`,
      name: 'Technical Architect',
      roleTitle: 'Feasibility & Stack Blueprint',
      icon: 'terminal',
      score: techScore,
      status: 'completed',
      verdict: `Modern microservice and asynchronous orchestration stack provides sub-second latency and linear scalability.`,
      detailedAnalysis: `The proposed architecture for ${title} leverages modern decoupled services, high-performance database indexing, and streaming LLM/vision inference pipelines. Core business logic executes at high throughput with resilient fallback strategies.`,
      keyFindings: [
        'Core architecture can be launched using standard cloud primitives with near-zero initial devops debt.',
        'Stateful caching and vector similarity search enable sub-200ms user request latency.',
        'Modular API boundaries allow rapid expansion to enterprise integrations.',
      ],
      concerns: [
        'Real-time processing requires strict telemetry monitoring and circuit breakers on external APIs.',
        'Data privacy and role-based access control must be implemented from day zero.',
      ],
    },
    {
      id: `agent_skeptic_${title.toLowerCase().replace(/\s+/g, '_')}`,
      name: 'Skeptic',
      roleTitle: 'Pre-Mortem & Threat Model',
      icon: 'warning',
      score: Math.max(54, overallScore - 20),
      status: 'flagged',
      verdict: `Primary pre-mortem failure mode: onboarding drop-off and Day-30 customer habit decay.`,
      detailedAnalysis: `The most significant risk is not technology feasibility, but user adoption inertia. If ${title} requires excessive manual setup during Week 1, users will abandon the product for familiar spreadsheets or legacy tools.`,
      keyFindings: [
        'Users will abandon software if first "aha!" moment exceeds 90 seconds.',
        'Over-promising AI accuracy without verifiable confidence scoring damages buyer trust.',
        'Customer onboarding friction is the #1 correlated cause of early cohort churn.',
      ],
      concerns: [
        'Friction cliff: Initial setup must be automated with 1-click connectors.',
        'Switching inertia: Incumbent migration tooling must be built natively into signup.',
      ],
    },
  ];

  // 2. Competitors
  const competitorsByDomain: Record<DomainKey, Competitor[]> = {
    robotics_hardware: [
      {
        id: 'comp_1',
        name: 'DJI Enterprise & Terra',
        category: 'Legacy',
        marketCapOrFunding: '$15B+ (Global Leader)',
        pricing: '$3,500/unit + $1,200/yr software',
        strengths: ['Dominant global hardware scale', 'Extensive dealer network'],
        weaknesses: ['Geopolitical restrictions', 'Manual flight planning', 'Closed software ecosystem'],
        ourMoat: `Autonomous mission dispatch and continuous edge analytics designed for ${title}.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'Skydio Enterprise',
        category: 'Direct',
        marketCapOrFunding: '$2.2B Valuation',
        pricing: '$12,000/yr per fleet bundle',
        strengths: ['Autonomous obstacle avoidance', 'Strong US government contracts'],
        weaknesses: ['Expensive proprietary hardware', 'Complex enterprise sales cycle'],
        ourMoat: `Lower cost modular integration with tailored analytics for ${targetMarket}.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'DroneDeploy',
        category: 'Indirect',
        marketCapOrFunding: '$140M Raised',
        pricing: '$329 - $599/mo',
        strengths: ['Cloud photogrammetry leader', 'Broad industry mapping'],
        weaknesses: ['Passive post-flight processing', 'Zero real-time physical actuation'],
        ourMoat: `Closed-loop real-time execution: sensing directly linked to autonomous physical action.`,
        threatLevel: 'Medium',
      },
    ],
    fintech_crypto: [
      {
        id: 'comp_1',
        name: 'Stripe & Stripe Connect',
        category: 'Legacy',
        marketCapOrFunding: '$70B+ Valuation',
        pricing: '2.9% + 30¢ per transaction',
        strengths: ['Global developer mindshare', 'Exhaustive API documentation'],
        weaknesses: ['High platform take rates for niche workflows', 'Opaque risk holds'],
        ourMoat: `Zero-overhead verticalized orchestration tailored strictly for ${targetMarket}.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'Brex / Ramp Platform',
        category: 'Direct',
        marketCapOrFunding: '$7B+ Valuation',
        pricing: 'Free base card + $12/user/mo software',
        strengths: ['Massive tech startup penetration', 'Sleek corporate expense UI'],
        weaknesses: ['Focused primarily on corporate credit cards, not custom programmatic money flows'],
        ourMoat: `Deep contextual integration and programmable ledger automation in ${title}.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'Modern Treasury',
        category: 'Indirect',
        marketCapOrFunding: '$2B Valuation',
        pricing: 'Enterprise contract ($2k - $8k/mo)',
        strengths: ['Enterprise bank rail integrations', 'Audit-ready ledger system'],
        weaknesses: ['Steep enterprise implementation timeline', 'Overkill for agile teams'],
        ourMoat: `Instant 5-minute self-serve setup with AI-assisted transaction anomaly detection.`,
        threatLevel: 'Low',
      },
    ],
    devtools_infra: [
      {
        id: 'comp_1',
        name: 'GitHub Copilot Enterprise',
        category: 'Legacy',
        marketCapOrFunding: 'Microsoft Subsidiary',
        pricing: '$19 - $39/seat/mo',
        strengths: ['Native IDE and repository integration', 'Massive distribution'],
        weaknesses: ['Generic auto-complete', 'Lacks deep architectural and semantic reasoning'],
        ourMoat: `Domain-specific semantic graph verification and deterministic AST guarantees in ${title}.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'SonarQube / Snyk',
        category: 'Direct',
        marketCapOrFunding: '$7B+ (Snyk) / Sonar',
        pricing: '$150/dev/yr to $2,500/mo',
        strengths: ['Industry-standard static analysis', 'Extensive CVE vulnerability database'],
        weaknesses: ['High false positive rates', 'Passive alerting without autonomous remediation'],
        ourMoat: `Autonomous patch synthesis and verified code transformations with zero human friction.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'Datadog / Sentry',
        category: 'Indirect',
        marketCapOrFunding: '$35B (Datadog)',
        pricing: 'Usage-based logging & tracing',
        strengths: ['Ubiquitous runtime observability', 'Real-time alert dispatch'],
        weaknesses: ['Surprise usage bills', 'Alert fatigue without root-cause resolution'],
        ourMoat: `Pre-runtime prevention rather than post-mortem crash telemetry.`,
        threatLevel: 'Low',
      },
    ],
    cybersecurity: [
      {
        id: 'comp_1',
        name: 'CrowdStrike Falcon',
        category: 'Legacy',
        marketCapOrFunding: '$70B+ Market Cap',
        pricing: '$8.99/endpoint/mo',
        strengths: ['Industry-leading EDR sensor', 'Elite threat intelligence database'],
        weaknesses: ['Heavy endpoint footprint', 'Overwhelming alert console for mid-market'],
        ourMoat: `Agentic autonomous containment and continuous zero-trust verification in ${title}.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'Vanta / Drata',
        category: 'Direct',
        marketCapOrFunding: '$2B+ Valuation',
        pricing: '$7,500 - $18,000/yr',
        strengths: ['Dominant compliance automation (SOC 2, ISO)', 'Extensive SaaS integrations'],
        weaknesses: ['Checklist compliance without real-time threat response', 'Manual evidence gap remediation'],
        ourMoat: `Continuous active verification and autonomous remediation rather than static audit checklists.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'KnowBe4',
        category: 'Indirect',
        marketCapOrFunding: '$4.6B Private Equity',
        pricing: '$18 - $32/user/yr',
        strengths: ['Vast simulated phishing template catalog'],
        weaknesses: ['Predictable static email templates', 'User fatigue and negative employee morale'],
        ourMoat: `Hyper-realistic adaptive simulations with dynamic micro-learning feedback.`,
        threatLevel: 'Low',
      },
    ],
    edtech: [
      {
        id: 'comp_1',
        name: 'Duolingo / Khan Academy',
        category: 'Legacy',
        marketCapOrFunding: '$10B+ (Duolingo)',
        pricing: 'Free with Ads / $12.99/mo Super',
        strengths: ['World-class gamification mechanics', 'Massive brand trust'],
        weaknesses: ['Linear static curriculum', 'Lacks real-time personalized reasoning diagnostics'],
        ourMoat: `Dynamic cognitive diagnostic engine that pinpoints foundational misconceptions in seconds.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'Quizlet / Chegg Study',
        category: 'Direct',
        marketCapOrFunding: 'Public ($2B+ peak)',
        pricing: '$7.99 - $19.99/mo',
        strengths: ['Vast user-generated flashcard databases', 'Strong student SEO presence'],
        weaknesses: ['Encourages rote memorization', 'Severe threat from generic ChatGPT prompts'],
        ourMoat: `Socratic multimodal dialogue that trains deep conceptual intuition rather than rote recall.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'Coursera / Udemy',
        category: 'Indirect',
        marketCapOrFunding: '$2B Market Cap',
        pricing: '$49/mo or $20/course',
        strengths: ['Accredited university certificates', 'Exhaustive course catalogs'],
        weaknesses: ['Single-digit course completion rates (<7%)', 'Passive video watching'],
        ourMoat: `Interactive active-recall workflows with guaranteed mastery checkpoints.`,
        threatLevel: 'Low',
      },
    ],
    health_fitness: [
      {
        id: 'comp_1',
        name: 'MyFitnessPal',
        category: 'Legacy',
        marketCapOrFunding: '$1B+ (Francisco Partners)',
        pricing: '$19.99/mo or $79.99/yr',
        strengths: ['Massive 14M+ food & exercise database', 'High brand awareness'],
        weaknesses: ['Tedious manual logging', 'Cluttered ad experience', 'Inaccurate user-generated data'],
        ourMoat: `Autonomous telemetry ingestion and verified closed-loop execution in ${title}.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'MacroFactor / Whoop Platform',
        category: 'Direct',
        marketCapOrFunding: 'Bootstrapped / $3.6B (Whoop)',
        pricing: '$11.99 - $30.00/mo',
        strengths: ['Best-in-class biometric algorithms', 'High brand affinity'],
        weaknesses: ['Passive tracking without automated fulfillment or intervention'],
        ourMoat: `End-to-end execution: sensing directly linked to delivered outcomes.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'Noom Health',
        category: 'Indirect',
        marketCapOrFunding: '$3.7B Valuation',
        pricing: '$59/mo subscription',
        strengths: ['Cognitive behavioral coaching', 'High marketing reach'],
        weaknesses: ['Aggressive subscription billing backlash', 'High 90-day churn'],
        ourMoat: `Frictionless biometric sync with objective automated progress tracking.`,
        threatLevel: 'Low',
      },
    ],
    ecommerce_retail: [
      {
        id: 'comp_1',
        name: 'Shopify Plus & Ecosystem',
        category: 'Legacy',
        marketCapOrFunding: '$100B+ Market Cap',
        pricing: '$39 - $2,000/mo',
        strengths: ['Dominant merchant infrastructure', 'Massive app store ecosystem'],
        weaknesses: ['Requires dozens of fragmented paid plugins', 'Generic merchant dashboards'],
        ourMoat: `Unified autonomous intelligence layer tailored specifically for ${targetMarket}.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'Gorgias / Klaviyo',
        category: 'Direct',
        marketCapOrFunding: '$9B+ (Klaviyo)',
        pricing: '$60 - $500/mo based on volume',
        strengths: ['Deep Shopify data integration', 'Established email/SMS automation'],
        weaknesses: ['Rules-based sequences rather than autonomous contextual agents'],
        ourMoat: `Self-optimizing autonomous agent loops that adapt dynamically to consumer behavior.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'Triple Whale',
        category: 'Indirect',
        marketCapOrFunding: '$50M+ Raised',
        pricing: '$129 - $499/mo',
        strengths: ['D2C attribution and pixel tracking'],
        weaknesses: ['Passive analytics dashboard without automated execution'],
        ourMoat: `Closed-loop attribution that directly triggers autonomous inventory and marketing adjustments.`,
        threatLevel: 'Low',
      },
    ],
    legaltech_proptech: [
      {
        id: 'comp_1',
        name: 'Harvey AI / Ironclad',
        category: 'Direct',
        marketCapOrFunding: '$1.5B Valuation',
        pricing: 'Enterprise custom ($1,000+/lawyer/yr)',
        strengths: ['Major elite law firm backing', 'Strong enterprise security certifications'],
        weaknesses: ['Exclusive access for top-tier law firms', 'Prohibitive pricing for mid-market'],
        ourMoat: `Accessible, self-serve automated legal precision engine tailored for ${targetMarket}.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'Clio / DocuSign CLM',
        category: 'Legacy',
        marketCapOrFunding: '$3B (Clio) / $12B (DocuSign)',
        pricing: '$49 - $129/user/mo',
        strengths: ['Ubiquitous legal practice management', 'Universal signature rails'],
        weaknesses: ['Clunky legacy UI', 'Rudimentary AI search without reasoning'],
        ourMoat: `Autonomous semantic analysis and instant redlining calibrated to specific jurisdiction standards.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'Robin AI',
        category: 'Indirect',
        marketCapOrFunding: '$40M Raised',
        pricing: '$300/mo base',
        strengths: ['Anthropic Claude partnership', 'Contract review acceleration'],
        weaknesses: ['Heavy reliance on human-in-the-loop reviewers slows turnaround'],
        ourMoat: `Deterministic verification layer delivering sub-30 second redlines with citations.`,
        threatLevel: 'Low',
      },
    ],
    cleantech_energy: [
      {
        id: 'comp_1',
        name: 'Enel X & Stem',
        category: 'Legacy',
        marketCapOrFunding: '$1B+ / Public',
        pricing: 'Enterprise service contracts',
        strengths: ['Utility relationships', 'Commercial battery deployments'],
        weaknesses: ['Slow legacy software iterations', 'Rigid multi-year integration timelines'],
        ourMoat: `Lightweight API-first energy telemetry and automated demand-response in ${title}.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_2',
        name: 'Watershed / Persefoni',
        category: 'Direct',
        marketCapOrFunding: '$1B+ Valuation',
        pricing: '$15,000 - $60,000/yr',
        strengths: ['Market leaders in enterprise carbon accounting', 'Big Four audit credibility'],
        weaknesses: ['Passive compliance reporting without real-time grid actuation'],
        ourMoat: `Real-time physical optimization linking emissions telemetry to direct operational savings.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_3',
        name: 'Autogrid',
        category: 'Indirect',
        marketCapOrFunding: 'Acquired by Schneider',
        pricing: 'Utility-scale custom pricing',
        strengths: ['Virtual power plant algorithms'],
        weaknesses: ['Lacks consumer/commercial building accessibility'],
        ourMoat: `Rapid plug-and-play building automation protocol requiring zero upfront capital hardware.`,
        threatLevel: 'Low',
      },
    ],
    b2b_saas: [
      {
        id: 'comp_1',
        name: 'Salesforce & Einstein AI',
        category: 'Legacy',
        marketCapOrFunding: '$280B Market Cap',
        pricing: '$75 - $300/user/mo',
        strengths: ['Universal enterprise CRM standard', 'Huge systems-integrator ecosystem'],
        weaknesses: ['Bloated UI', 'Painful 6-month implementations', 'Fragmented bolt-on AI'],
        ourMoat: `Zero-configuration autonomous execution: ${title} works instantly without consultants.`,
        threatLevel: 'High',
      },
      {
        id: 'comp_2',
        name: 'HubSpot Platform',
        category: 'Direct',
        marketCapOrFunding: '$30B Market Cap',
        pricing: '$50 - $1,200/mo',
        strengths: ['Beloved mid-market inbound marketing and CRM UI', 'Clean onboarding'],
        weaknesses: ['Rapidly escalates in price as contacts grow', 'Lacks autonomous agent reasoning'],
        ourMoat: `Outcome-based autonomous workflows rather than static CRM database entry.`,
        threatLevel: 'Medium',
      },
      {
        id: 'comp_3',
        name: 'Zapier / Make.com',
        category: 'Indirect',
        marketCapOrFunding: '$5B Valuation',
        pricing: '$20 - $100/mo',
        strengths: ['Thousands of app connectors', 'Universal automation brand awareness'],
        weaknesses: ['Brittle if-this-then-that triggers that break on API changes', 'No contextual intelligence'],
        ourMoat: `Self-healing semantic agent loops that adapt dynamically to changing data schemas.`,
        threatLevel: 'Low',
      },
    ],
  };

  const competitors = competitorsByDomain[domain];

  // 3. Revenue & Pricing Tiers
  const isB2B =
    domain === 'devtools_infra' ||
    domain === 'cybersecurity' ||
    domain === 'legaltech_proptech' ||
    domain === 'cleantech_energy' ||
    domain === 'b2b_saas';

  const revenue: RevenueAnalysis = isB2B
    ? {
        modelType: 'Tiered B2B SaaS (Seat-Based + Usage API)',
        cac: Math.round(180 + (pos % 220)),
        ltv: Math.round(920 + (pos % 600)),
        ltvCacRatio: parseFloat((3.4 + ((pos % 10) / 10)).toFixed(2)),
        grossMargin: parseFloat((82.5 + ((pos % 60) / 10)).toFixed(1)),
        paybackMonths: parseFloat((3.8 + ((pos % 20) / 10)).toFixed(1)),
        pricingTiers: [
          {
            tier: 'Starter / Team',
            price: '$49',
            billing: 'per month',
            features: [
              'Up to 5 team seats',
              'Core autonomous workflows',
              'Standard API connectors',
              'Community & email support',
            ],
          },
          {
            tier: 'Growth / Pro',
            price: '$199',
            billing: 'per month',
            features: [
              'Unlimited team seats',
              'Full autonomous execution pipeline',
              'Priority sub-second processing',
              'Custom webhook integrations',
              'SOC 2 Type II audit logging',
            ],
            recommended: true,
          },
          {
            tier: 'Enterprise Custom',
            price: '$899+',
            billing: 'billed annually',
            features: [
              'Dedicated VPC or on-prem deployment',
              'Custom fine-tuned domain models',
              '99.99% uptime SLA guarantee',
              'Dedicated technical account manager',
            ],
          },
        ],
        assumptions: [
          'Net Revenue Retention (NRR) targeted at >118% via seat & usage expansion',
          'Sales cycle averages 18 days for Self-Serve and 38 days for Enterprise Pro',
          'Blended CAC of $240 through developer content, community loops, and direct outbound',
        ],
        unitEconomicsSummary: `Strong B2B economics with a 3.8x LTV:CAC and 4.2-month payback. Annual contracts yield non-dilutive working capital upfront.`,
      }
    : {
        modelType: 'Freemium Consumer Subscription + Platform Take-Rate',
        cac: parseFloat((28.0 + (pos % 18)).toFixed(2)),
        ltv: parseFloat((112.0 + (pos % 45)).toFixed(2)),
        ltvCacRatio: parseFloat((3.2 + ((pos % 8) / 10)).toFixed(2)),
        grossMargin: parseFloat((78.0 + ((pos % 50) / 10)).toFixed(1)),
        paybackMonths: parseFloat((2.8 + ((pos % 15) / 10)).toFixed(1)),
        pricingTiers: [
          {
            tier: 'Free Basic',
            price: '$0',
            billing: 'forever free',
            features: ['Essential automated capture', 'Daily insight telemetry', 'Standard community access'],
          },
          {
            tier: 'Pro Member',
            price: '$14.99',
            billing: 'per month or $119/yr',
            features: [
              'Unlimited real-time autonomous execution',
              'Priority AI inference pipelines',
              'Direct 1-click external integrations',
              'Advanced predictive analytics',
            ],
            recommended: true,
          },
          {
            tier: 'All-Access Syndicate',
            price: '$39.99',
            billing: 'per month',
            features: [
              'All Pro capabilities included',
              '1-on-1 human expert review & advisory',
              'Early access to beta models',
              'VIP customer concierge',
            ],
          },
        ],
        assumptions: [
          'Organic referral loop drives 34% of top-of-funnel customer signups',
          'Average active subscriber lifespan is 8.4 months with steady month-over-month engagement',
          'Gross margin net of AI inference and payment interchange is stable above 78%',
        ],
        unitEconomicsSummary: `Healthy consumer velocity with 3.4x LTV:CAC and sub-3 month payback. Recurring annual subscriptions mitigate seasonal churn.`,
      };

  // 4. Structured Plan & Tech Stack
  const plan: StructuredPlan = {
    productStrategy: {
      vision: `Build the category-defining platform for ${title}: ${description.slice(0, 110)}...`,
      coreValueProp:
        domain === 'robotics_hardware'
          ? 'Autonomous closed-loop perception and edge mission actuation without human bottleneck.'
          : domain === 'fintech_crypto'
          ? 'Zero-reconciliation programmatic money movement with embedded compliance guarantees.'
          : domain === 'devtools_infra'
          ? 'Deterministic code verification and sub-second developer feedback loops.'
          : domain === 'cybersecurity'
          ? 'Continuous zero-trust verification and agentic threat containment.'
          : domain === 'edtech'
          ? 'Adaptive cognitive modeling that guarantees conceptual mastery in half the time.'
          : 'Autonomous workflow execution that transforms fragmented manual effort into effortless velocity.',
      targetPersona: targetMarket,
      launchPhases: [
        'Phase 1: Closed Alpha with 20 Design Partners',
        'Phase 2: Self-Serve Public Beta & Integration Rails',
        'Phase 3: General Availability & Scaled Partner Ecosystem',
      ],
    },
    techStack: [
      {
        category: 'Client & Interface Layer',
        items:
          domain === 'robotics_hardware'
            ? [
                { name: 'React 19 + TypeScript', justification: 'Mission control web dashboard with WebGL telemetry' },
                { name: 'WebRTC / Protobuf', justification: 'Low-latency real-time video and telemetry stream' },
              ]
            : domain === 'devtools_infra'
            ? [
                { name: 'CLI / Terminal Client (Rust)', justification: 'Zero-overhead sub-10ms developer tool execution' },
                { name: 'VS Code Extension & Web App', justification: 'Native in-editor suggestions and workspace management' },
              ]
            : [
                { name: 'React 19 + Vite', justification: 'Ultra-fast fluid user interface with minimal bundle size' },
                { name: 'Tailwind CSS', justification: 'Strict design tokens and responsive execution shell' },
              ],
      },
      {
        category: 'Backend & Data Infrastructure',
        items: [
          { name: 'FastAPI (Python 3.11)', justification: 'High-throughput asynchronous microservices gateway' },
          { name: 'PostgreSQL + pgvector', justification: 'Relational ACID state combined with vector semantic embeddings' },
          { name: 'Redis Streams / Celery', justification: 'Asynchronous event-driven background job orchestration' },
        ],
      },
      {
        category: 'AI Engine & External Connectors',
        items: [
          { name: 'Google Gemini 2.5 Flash', justification: 'Low-latency structured JSON inference and reasoning' },
          { name: 'Supabase Auth & Storage', justification: 'Instant JWT authentication, row-level security, and media assets' },
          { name: 'Docker / Kubernetes', justification: 'Scalable containerized deployment across multi-cloud regions' },
        ],
      },
    ],
    architecture: {
      type:
        domain === 'robotics_hardware'
          ? 'Edge-Cloud Hybrid Architecture with Real-Time Telemetry'
          : domain === 'devtools_infra'
          ? 'Language-Server Protocol (LSP) Engine with AST Cache'
          : 'Event-Driven Microservices with Distributed Semantic Cache',
      description: `A resilient, decoupled architecture engineered for ${title}. Prioritizes sub-second response times, zero-latency caching, and horizontal scalability under heavy concurrency.`,
      keyComponents: [
        'API Gateway & Auth Verification (JWT + Rate-Limiting)',
        'Asynchronous Task Queue (Redis + Background Workers)',
        'Domain Logic Engine & Semantic Embedding Pipeline',
        'Postgres Relational DB with pgvector Indexing',
      ],
      scalabilityNotes:
        'Stateless containerized services scale horizontally on demand. Vector embeddings are pre-cached in memory for sub-50ms query matching.',
    },
    milestones: [
      {
        phase: 'Sprint 1: Engine Genesis',
        title: 'Core Architecture & Prototype Spec',
        duration: 'Weeks 1-4',
        targetDate: 'Month 1',
        goals: ['Finalize data schema and API contracts', 'Deploy core autonomous inference pipeline'],
        deliverables: ['Working prototype benchmarked on 500 test scenarios', 'Initial design partner feedback report'],
        status: 'done',
      },
      {
        phase: 'Sprint 2: Alpha Testbed',
        title: 'Private Cohort Beta & Connector Integration',
        duration: 'Weeks 5-8',
        targetDate: 'Month 2',
        goals: ['Onboard 30 pilot customers in target persona', 'Measure retention and time-to-value metrics'],
        deliverables: ['Self-serve onboarding flow', 'Integrated error telemetry and automated analytics'],
        status: 'current',
      },
      {
        phase: 'Sprint 3: GTM Acceleration',
        title: 'Public Launch & Commercial Scale',
        duration: 'Weeks 9-14',
        targetDate: 'Month 3',
        goals: ['Public launch on Product Hunt & industry channels', 'Achieve $25k MRR milestone'],
        deliverables: ['Public self-serve signup', 'Partner referral program and affiliate revenue engine'],
        status: 'upcoming',
      },
    ],
  };

  // 5. Job Roles
  const rolesByDomain: Record<DomainKey, JobRole[]> = {
    robotics_hardware: [
      {
        id: 'role_1',
        title: 'Lead Robotics & Embedded Systems Architect',
        department: 'Hardware & Systems',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['C++', 'ROS2', 'Embedded Linux', 'RTOS', 'ARM Architecture'],
        preferredSkills: ['PCB Design', 'MQTT', 'PX4/ArduPilot', 'CAN Bus'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Autonomous Perception & CV Engineer',
        department: 'AI & Vision',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['PyTorch', 'YOLOv8', 'OpenCV', 'SLAM', 'Edge TensorRT'],
        preferredSkills: ['Point Cloud Processing', 'LiDAR', 'Camera Calibration'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Industrial GTM & Field Deployments',
        department: 'Growth',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['B2B Hardware Sales', 'Field Pilots', 'Enterprise Contracts', 'Agritech/Industrial'],
        preferredSkills: ['FAA Part 107', 'Supply Chain Management'],
        candidateMatchesCount: 1,
      },
    ],
    fintech_crypto: [
      {
        id: 'role_1',
        title: 'Lead Financial Infrastructure & Ledger Engineer',
        department: 'Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['Go / Python', 'PostgreSQL (ACID)', 'Plaid / Stripe API', 'Double-Entry Ledgers'],
        preferredSkills: ['Distributed Transactions', 'Kafka', 'Redis', 'AWS KMS'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Security & Financial Compliance Architect',
        department: 'Security & Compliance',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['SOC 2 Type II', 'PCI-DSS', 'FinCEN / KYC', 'Zero-Trust Architecture'],
        preferredSkills: ['Smart Contract Auditing', 'Penetration Testing'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Banking Partnerships & Growth',
        department: 'Business Development',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['Bank Sponsor Partnerships', 'FinTech Commercial Strategy', 'B2B Sales Funnels'],
        preferredSkills: ['Card Issuance Programs', 'Interchange Economics'],
        candidateMatchesCount: 1,
      },
    ],
    devtools_infra: [
      {
        id: 'role_1',
        title: 'Founding Compiler & Language Systems Engineer',
        department: 'Core Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['Rust', 'Tree-sitter', 'AST Manipulation', 'WebAssembly', 'TypeScript'],
        preferredSkills: ['LLVM', 'Language Server Protocol (LSP)', 'Clang'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Distributed Systems & Platform Architect',
        department: 'Infrastructure',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['Go / Rust', 'Kubernetes', 'ClickHouse', 'Distributed Caching', 'Docker'],
        preferredSkills: ['eBPF', 'Prometheus', 'High-QPS Optimization'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Developer Relations & Open Source GTM',
        department: 'Developer Relations',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['Technical Writing', 'Developer Community Building', 'GitHub / Discord GTM'],
        preferredSkills: ['Conference Speaking', 'Open Source Maintainer Experience'],
        candidateMatchesCount: 1,
      },
    ],
    cybersecurity: [
      {
        id: 'role_1',
        title: 'Principal Security Systems & Detection Engineer',
        department: 'Security Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['Rust / Go', 'eBPF', 'Threat Modeling', 'Zero Trust', 'SIEM / EDR'],
        preferredSkills: ['Kernel Internals', 'Network Packet Inspection', 'Sigma Rules'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Cloud Security & DevSecOps Lead',
        department: 'Infrastructure',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['AWS Security', 'Terraform', 'Kubernetes Hardening', 'IAM Architecture'],
        preferredSkills: ['CIS Benchmarks', 'Automated Pentesting'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Enterprise Cyber Sales & Channel Partners',
        department: 'Sales & GTM',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['CISO Relationship Building', 'Enterprise Security Contracts', 'MSP Channel Sales'],
        preferredSkills: ['GSA Schedule', 'MEDDPICC Methodology'],
        candidateMatchesCount: 1,
      },
    ],
    edtech: [
      {
        id: 'role_1',
        title: 'Lead Cognitive Experience & Full-Stack Architect',
        department: 'Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['React 19 / Next.js', 'TypeScript', 'FastAPI', 'PostgreSQL', 'WebSockets'],
        preferredSkills: ['Interactive Canvas', 'Audio Streaming', 'Tailwind CSS'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Multimodal AI & Curriculum Engineer',
        department: 'AI & Learning Science',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['PyTorch', 'Prompt Engineering / LLMs', 'Vector Databases', 'Speech Synthesis / STT'],
        preferredSkills: ['Knowledge Tracing Algorithms', 'Bloom Taxonomy Mapping'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of School Partnerships & Student Growth',
        department: 'Growth',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['EdTech Institutional Sales', 'Campus Ambassador Networks', 'Viral Student Loops'],
        preferredSkills: ['FERPA / COPPA Compliance', 'District Procurement'],
        candidateMatchesCount: 1,
      },
    ],
    health_fitness: [
      {
        id: 'role_1',
        title: 'Lead Full-Stack & Biometrics Architect',
        department: 'Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['React Native / Swift', 'TypeScript', 'FastAPI', 'HealthKit / Wearable API'],
        preferredSkills: ['CoreML', 'Redis', 'PostgreSQL + pgvector'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Computer Vision & Nutrition ML Engineer',
        department: 'AI & Data Science',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['PyTorch', 'Object Detection', 'Quantization (ONNX)', 'Edge ML'],
        preferredSkills: ['Food Recognition Models', 'Biometric Timeseries Analysis'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Growth & Creator Partnerships',
        department: 'Marketing & GTM',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['Creator Seeding', 'Performance Marketing', 'Community Evangelism'],
        preferredSkills: ['B2C Subscription Funnels', 'TikTok/Reels Production'],
        candidateMatchesCount: 1,
      },
    ],
    ecommerce_retail: [
      {
        id: 'role_1',
        title: 'Lead Commerce Platform & Integration Architect',
        department: 'Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['TypeScript', 'Node / Python', 'Shopify / Commerce APIs', 'PostgreSQL'],
        preferredSkills: ['GraphQL', 'Redis', 'High-Concurrency Checkout'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Personalization & Recommendation ML Lead',
        department: 'Data Science',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['PyTorch', 'Collaborative Filtering', 'Vector Search', 'Feature Stores'],
        preferredSkills: ['Computer Vision (Visual Search)', 'Real-Time Inference'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Merchant Acquisition & Partnerships',
        department: 'Growth',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['D2C Brand Acquisition', 'Shopify App Store SEO', 'Affiliate Partnerships'],
        preferredSkills: ['Retail Agency Relationships', 'Klaviyo Integration'],
        candidateMatchesCount: 1,
      },
    ],
    legaltech_proptech: [
      {
        id: 'role_1',
        title: 'Lead Systems Architect (Legal & Data Privacy)',
        department: 'Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['Python', 'PostgreSQL (pgvector)', 'FastAPI', 'SOC 2 Architecture'],
        preferredSkills: ['Document Parsing (PDF/Docx)', 'Encryption at Rest'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior NLP & Legal Knowledge Graph Engineer',
        department: 'AI & Core NLP',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['LLM Fine-Tuning', 'Knowledge Graphs', 'RAG Architectures', 'Citation Verification'],
        preferredSkills: ['Legal Domain Benchmarks', 'Contract Ontology'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Corporate Counsel & Law Firm GTM',
        department: 'Sales',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['Enterprise Legal Sales', 'Law Firm Procurement Cycles', 'Pilot Execution'],
        preferredSkills: ['JD / Legal Background', 'Legal Tech Network'],
        candidateMatchesCount: 1,
      },
    ],
    cleantech_energy: [
      {
        id: 'role_1',
        title: 'Lead Energy Telemetry & IoT Systems Architect',
        department: 'Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['Python / Go', 'TimescaleDB / InfluxDB', 'MQTT / Modbus', 'Distributed Systems'],
        preferredSkills: ['Smart Meter APIs', 'AWS IoT Core'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Energy Optimization & Modeling Engineer',
        department: 'AI & Data Science',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['Mathematical Optimization (SciPy/Gurobi)', 'Time Series Forecasting', 'PyTorch'],
        preferredSkills: ['Grid Demand Response Models', 'Carbon Accounting Protocols'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of Utility & Commercial Energy Partnerships',
        department: 'Business Development',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['Utility Interconnects', 'Commercial Real Estate Energy Sales', 'Regulatory Credits'],
        preferredSkills: ['ESG Reporting Standards', 'PPA Contracts'],
        candidateMatchesCount: 1,
      },
    ],
    b2b_saas: [
      {
        id: 'role_1',
        title: 'Lead Full-Stack & Workflow Systems Architect',
        department: 'Core Engineering',
        type: 'Co-Founder',
        urgency: 'Immediate',
        requiredSkills: ['TypeScript', 'React 19', 'FastAPI', 'PostgreSQL', 'Redis'],
        preferredSkills: ['Docker', 'Multi-Tenant Architecture', 'Event Streams'],
        candidateMatchesCount: 3,
      },
      {
        id: 'role_2',
        title: 'Senior Autonomous Agent & Orchestration Engineer',
        department: 'AI & Machine Learning',
        type: 'Full-Time',
        urgency: 'Immediate',
        requiredSkills: ['Python', 'LLM Agent Frameworks', 'Structured Outputs', 'Vector DBs'],
        preferredSkills: ['Semantic Caching', 'Evaluation Pipelines'],
        candidateMatchesCount: 2,
      },
      {
        id: 'role_3',
        title: 'Head of B2B Demand Generation & Sales',
        department: 'Growth',
        type: 'Full-Time',
        urgency: 'Next Quarter',
        requiredSkills: ['Product-Led Growth (PLG)', 'Outbound Sales Automation', 'Enterprise Demos'],
        preferredSkills: ['HubSpot / Apollo Workflows', 'Customer Success Management'],
        candidateMatchesCount: 1,
      },
    ],
  };

  const roles = rolesByDomain[domain];

  // 6. Risks & Strengths
  const risks = [
    {
      title: 'Customer Onboarding Drop-off',
      severity: 'high' as const,
      description: `Target buyers in ${targetMarket} face cognitive overload if initial setup takes longer than 2 minutes.`,
      mitigation: 'Implement zero-click default templates, progressive disclosure, and 1-click account connectors.',
    },
    {
      title: 'Incumbent Feature Replication',
      severity: 'medium' as const,
      description: `Legacy competitors like ${competitors[0]?.name} could attempt to mimic standalone feature subsets.`,
      mitigation: `Build deep workflow lock-in, proprietary data loops, and defensible integration moats in ${title}.`,
    },
    {
      title: 'Customer Acquisition Channel Saturation',
      severity: 'medium' as const,
      description: 'Paid performance marketing channels suffer from rising CPCs and ad fatigue.',
      mitigation: 'Prioritize organic community flywheels, viral referral mechanics, and high-ROI outbound design partnerships.',
    },
  ];

  const strengths = [
    {
      title: 'Closed-Loop Autonomous Execution',
      description: `Unlike passive databases, ${title} closes the loop directly from intent to executed outcome.`,
      score: demandScore,
    },
    {
      title: 'Tailored Domain Architecture',
      description: `Custom-tailored specifically for ${targetMarket}, eliminating the clutter of generic legacy incumbents.`,
      score: techScore,
    },
    {
      title: 'Compounding Workflow Moat',
      description: `User interaction telemetry and custom configurations create high switching costs and defensibility.`,
      score: moatScore,
    },
  ];

  const ideaId = input.id || `idea_${Date.now()}`;

  return {
    id: ideaId,
    title,
    tagline,
    description,
    category,
    targetMarket,
    stage: 'Pre-Seed / Active Validation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: overallScore,
    status: 'validated',
    signal,
    metrics: {
      marketDemand: demandScore,
      unitEconomics: econScore,
      technicalFeasibility: techScore,
      competitiveMoat: moatScore,
      timingExecution: timingScore,
    },
    agents,
    risks,
    strengths,
    competitors,
    revenue,
    plan,
    roles,
  };
}

/**
 * Returns dynamic talent candidates matching an idea's specific roles and skills
 */
export function synthesizeCandidatesForIdea(idea: Idea): Candidate[] {
  const roles = idea.roles;
  const avatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  ];

  const candidates: Candidate[] = [];

  roles.forEach((role, rIdx) => {
    // Generate 2 matching candidates per role
    const cand1Skills = role.requiredSkills.map((s, idx) => ({
      name: s,
      matched: idx < role.requiredSkills.length - 1,
    }));
    if (role.preferredSkills.length > 0) {
      cand1Skills.push({ name: role.preferredSkills[0], matched: true });
    }

    candidates.push({
      id: `cand_${idea.id}_${rIdx * 2 + 1}`,
      name: rIdx === 0 ? 'Elena Rostova' : rIdx === 1 ? 'David Chen' : 'Maya Lin',
      avatar: avatars[(rIdx * 2) % avatars.length],
      role: role.title,
      matchScore: 92 - rIdx * 3,
      experienceYears: 7 + rIdx,
      location: rIdx === 0 ? 'San Francisco, CA (Remote)' : rIdx === 1 ? 'Seattle, WA' : 'Austin, TX',
      currentCompany: `ex-${idea.competitors[0]?.name.split(' ')[0] || 'Tech'} Leader`,
      skills: cand1Skills,
      bio: `Senior engineering lead specializing in ${role.requiredSkills.slice(0, 3).join(', ')}. Eager to join high-conviction ventures in ${idea.category}.`,
      github: `https://github.com/talent_${rIdx * 2 + 1}`,
      linkedin: `https://linkedin.com/in/talent_${rIdx * 2 + 1}`,
      outreachStatus: rIdx === 0 ? 'interviewing' : 'none',
      appliedJobRoleId: role.id,
    });

    const cand2Skills = role.requiredSkills.map((s, idx) => ({
      name: s,
      matched: idx !== 1,
    }));
    if (role.preferredSkills.length > 1) {
      cand2Skills.push({ name: role.preferredSkills[1], matched: true });
    }

    candidates.push({
      id: `cand_${idea.id}_${rIdx * 2 + 2}`,
      name: rIdx === 0 ? 'Alexander Wright' : rIdx === 1 ? 'Sarah Jenkins' : 'Kevin Patel',
      avatar: avatars[(rIdx * 2 + 1) % avatars.length],
      role: role.title,
      matchScore: 86 - rIdx * 3,
      experienceYears: 5 + rIdx,
      location: rIdx === 0 ? 'New York, NY' : rIdx === 1 ? 'Denver, CO (Remote)' : 'Toronto, Canada',
      currentCompany: `ex-${idea.competitors[1]?.name.split(' ')[0] || 'Startup'} Scaleup`,
      skills: cand2Skills,
      bio: `Proven track record scaling production systems with ${role.requiredSkills.slice(0, 2).join(' & ')}.`,
      github: `https://github.com/talent_${rIdx * 2 + 2}`,
      linkedin: `https://linkedin.com/in/talent_${rIdx * 2 + 2}`,
      outreachStatus: 'none',
      appliedJobRoleId: role.id,
    });
  });

  return candidates;
}
