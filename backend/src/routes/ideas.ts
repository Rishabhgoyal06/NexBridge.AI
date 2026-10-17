import { Router } from 'express';
import { pool } from '../db/supabase.js';
import { aiAgentService } from '../services/aiAgentService.js';

export const ideasRouter = Router();

// GET all ideas
ideasRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ideas ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET idea by ID with all related relations
ideasRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ideaRes = await pool.query('SELECT * FROM ideas WHERE id = $1', [id]);
    if (ideaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    const idea = ideaRes.rows[0];

    // Fetch related validation agents
    const agentsRes = await pool.query(
      'SELECT * FROM validation_agents WHERE idea_id = $1 ORDER BY score DESC',
      [id]
    );

    // Fetch competitors
    const compsRes = await pool.query(
      'SELECT * FROM competitors WHERE idea_id = $1',
      [id]
    );

    // Fetch revenue analysis
    const revRes = await pool.query(
      'SELECT * FROM revenue_analyses WHERE idea_id = $1',
      [id]
    );

    // Fetch structured plan
    const planRes = await pool.query(
      'SELECT * FROM structured_plans WHERE idea_id = $1',
      [id]
    );

    // Fetch job roles
    const rolesRes = await pool.query(
      'SELECT * FROM job_roles WHERE idea_id = $1',
      [id]
    );

    const fullIdea = {
      ...idea,
      agents: agentsRes.rows.map((a) => ({
        id: a.id,
        name: a.name,
        roleTitle: a.role_title,
        icon: a.icon,
        score: a.score,
        status: a.status,
        verdict: a.verdict,
        detailedAnalysis: a.detailed_analysis,
        keyFindings: a.key_findings || [],
        concerns: a.concerns || []
      })),
      competitors: compsRes.rows.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        marketCapOrFunding: c.market_cap_or_funding,
        pricing: c.pricing,
        strengths: c.strengths || [],
        weaknesses: c.weaknesses || [],
        ourMoat: c.our_moat,
        threatLevel: c.threat_level
      })),
      revenue: revRes.rows.length > 0 ? {
        modelType: revRes.rows[0].model_type,
        cac: parseFloat(revRes.rows[0].cac),
        ltv: parseFloat(revRes.rows[0].ltv),
        ltvCacRatio: parseFloat(revRes.rows[0].ltv_cac_ratio),
        grossMargin: parseFloat(revRes.rows[0].gross_margin),
        paybackMonths: parseFloat(revRes.rows[0].payback_months),
        pricingTiers: revRes.rows[0].pricing_tiers || [],
        assumptions: revRes.rows[0].assumptions || [],
        unitEconomicsSummary: revRes.rows[0].unit_economics_summary
      } : null,
      plan: planRes.rows.length > 0 ? {
        productStrategy: planRes.rows[0].product_strategy,
        techStack: planRes.rows[0].tech_stack,
        architecture: planRes.rows[0].architecture,
        milestones: planRes.rows[0].milestones
      } : null,
      roles: rolesRes.rows.map((r) => ({
        id: r.id,
        title: r.title,
        department: r.department,
        type: r.type,
        urgency: r.urgency,
        requiredSkills: r.required_skills || [],
        preferredSkills: r.preferred_skills || [],
        candidateMatchesCount: r.candidate_matches_count
      }))
    };

    res.json(fullIdea);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ideas/validate — Triggers the 5-Agent parallel validation and creates the idea
ideasRouter.post('/validate', async (req, res) => {
  const { title, tagline, description, targetMarket, category } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const validatedIdea = await aiAgentService.runParallelValidation({
      title,
      tagline,
      description,
      targetMarket,
      category
    });
    res.status(201).json(validatedIdea);
  } catch (err: any) {
    console.error('Validation error:', err);
    res.status(500).json({ error: err.message });
  }
});
