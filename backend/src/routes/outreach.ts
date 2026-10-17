import { Router } from 'express';
import { pool } from '../db/supabase.js';

export const outreachRouter = Router();

// GET all candidates / talent profiles
outreachRouter.get('/candidates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM talent_profiles ORDER BY experience_years DESC');
    const candidates = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      role: r.headline?.split('•')[0]?.trim() || 'Software Engineer',
      matchScore: 94,
      experienceYears: r.experience_years,
      location: r.location,
      currentCompany: r.headline?.split('•')[1]?.trim() || 'Tech Labs',
      skills: r.skills || [],
      bio: r.bio,
      github: `https://github.com/${r.name.toLowerCase().replace(/\s+/g, '')}`,
      linkedin: `https://linkedin.com/in/${r.name.toLowerCase().replace(/\s+/g, '')}`,
      outreachStatus: 'none',
      appliedJobRoleId: 'role_1'
    }));
    res.json(candidates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET candidate by ID
outreachRouter.get('/candidates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM talent_profiles WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    const r = result.rows[0];
    res.json({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      role: r.headline?.split('•')[0]?.trim() || 'Software Engineer',
      matchScore: 94,
      experienceYears: r.experience_years,
      location: r.location,
      currentCompany: r.headline?.split('•')[1]?.trim() || 'Tech Labs',
      skills: r.skills || [],
      bio: r.bio,
      github: `https://github.com/${r.name.toLowerCase().replace(/\s+/g, '')}`,
      linkedin: `https://linkedin.com/in/${r.name.toLowerCase().replace(/\s+/g, '')}`,
      outreachStatus: 'none',
      appliedJobRoleId: 'role_1'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET outreach messages pipeline Kanban
outreachRouter.get('/pipeline', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM outreach_messages ORDER BY sent_at DESC');
    res.json(
      result.rows.map((m) => ({
        id: m.id,
        candidateId: m.candidate_id,
        candidateName: m.candidate_name,
        candidateRole: m.candidate_role,
        subject: m.subject,
        body: m.body,
        status: m.status,
        sentAt: m.sent_at,
        stage: m.stage
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST send new outreach message
outreachRouter.post('/', async (req, res) => {
  const { ideaId = 'idea_gym_meal_planner', candidateId, candidateName, candidateRole, subject, body } = req.body;
  const id = `out_${Date.now()}`;
  try {
    const result = await pool.query(`
      INSERT INTO outreach_messages (id, idea_id, candidate_id, candidate_name, candidate_role, subject, body, stage, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Sent', 'sent')
      RETURNING *;
    `, [id, ideaId, candidateId, candidateName || 'Candidate', candidateRole || 'Engineer', subject, body]);

    const m = result.rows[0];
    res.status(201).json({
      id: m.id,
      candidateId: m.candidate_id,
      candidateName: m.candidate_name,
      candidateRole: m.candidate_role,
      subject: m.subject,
      body: m.body,
      status: m.status,
      sentAt: m.sent_at,
      stage: m.stage
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update message stage (e.g. In Conversation -> Offer)
outreachRouter.patch('/:id/stage', async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  try {
    const result = await pool.query(`
      UPDATE outreach_messages
      SET stage = $1
      WHERE id = $2
      RETURNING *;
    `, [stage, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outreach message not found' });
    }

    const all = await pool.query('SELECT * FROM outreach_messages ORDER BY sent_at DESC');
    res.json(all.rows.map((m) => ({
      id: m.id,
      candidateId: m.candidate_id,
      candidateName: m.candidate_name,
      candidateRole: m.candidate_role,
      subject: m.subject,
      body: m.body,
      status: m.status,
      sentAt: m.sent_at,
      stage: m.stage
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
