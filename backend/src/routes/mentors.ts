import { Router } from 'express';
import { pool } from '../db/supabase.js';

export const mentorsRouter = Router();

// GET all mentors with search and domain filters
mentorsRouter.get('/', async (req, res) => {
  const { query, domain } = req.query;
  try {
    let sql = 'SELECT * FROM mentors WHERE 1=1';
    const params: any[] = [];

    if (query && typeof query === 'string' && query.trim()) {
      params.push(`%${query.toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(title) LIKE $${params.length} OR LOWER(company) LIKE $${params.length})`;
    }

    sql += ' ORDER BY rating DESC';
    const result = await pool.query(sql, params);

    let list = result.rows.map((m) => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      title: m.title,
      company: m.company,
      bio: m.bio,
      rating: parseFloat(m.rating),
      reviewsCount: m.reviews_count,
      hourlyRate: m.hourly_rate,
      domains: m.domains || [],
      pastExits: m.past_exits || [],
      availability: m.availability,
      availableSlots: m.available_slots || []
    }));

    if (domain && typeof domain === 'string' && domain !== 'All') {
      list = list.filter((m) =>
        m.domains.some((d: string) => d.toLowerCase().includes(domain.toLowerCase()))
      );
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET mentor by ID
mentorsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM mentors WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    const m = result.rows[0];
    res.json({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      title: m.title,
      company: m.company,
      bio: m.bio,
      rating: parseFloat(m.rating),
      reviewsCount: m.reviews_count,
      hourlyRate: m.hourly_rate,
      domains: m.domains || [],
      pastExits: m.past_exits || [],
      availability: m.availability,
      availableSlots: m.available_slots || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET all session requests
mentorsRouter.get('/requests/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentor_requests ORDER BY created_at DESC');
    res.json(
      result.rows.map((r) => ({
        id: r.id,
        mentorId: r.mentor_id,
        mentorName: r.mentor_name,
        mentorAvatar: r.mentor_avatar,
        founderName: r.founder_name,
        startupName: r.startup_name,
        topic: r.topic,
        message: r.message,
        proposedTime: r.proposed_time,
        status: r.status,
        createdAt: r.created_at
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST request a mentor session
mentorsRouter.post('/request', async (req, res) => {
  const { mentorId, topic, message, proposedTime, founderName = 'Aarav Patel', startupName = 'NutriFit AI' } = req.body;
  const id = `req_${Date.now()}`;
  try {
    const mentorRes = await pool.query('SELECT * FROM mentors WHERE id = $1', [mentorId]);
    const mentor = mentorRes.rows[0];

    const result = await pool.query(`
      INSERT INTO mentor_requests (id, mentor_id, mentor_name, mentor_avatar, founder_name, startup_name, topic, message, proposed_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *;
    `, [id, mentorId, mentor?.name || 'Advisor', mentor?.avatar || '', founderName, startupName, topic, message, proposedTime]);

    const r = result.rows[0];
    res.status(201).json({
      id: r.id,
      mentorId: r.mentor_id,
      mentorName: r.mentor_name,
      mentorAvatar: r.mentor_avatar,
      founderName: r.founder_name,
      startupName: r.startup_name,
      topic: r.topic,
      message: r.message,
      proposedTime: r.proposed_time,
      status: r.status,
      createdAt: r.created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update session request status (accept, decline, complete)
mentorsRouter.patch('/requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE mentor_requests SET status = $1 WHERE id = $2', [status, id]);
    const all = await pool.query('SELECT * FROM mentor_requests ORDER BY created_at DESC');
    res.json(all.rows.map((r) => ({
      id: r.id,
      mentorId: r.mentor_id,
      mentorName: r.mentor_name,
      mentorAvatar: r.mentor_avatar,
      founderName: r.founder_name,
      startupName: r.startup_name,
      topic: r.topic,
      message: r.message,
      proposedTime: r.proposed_time,
      status: r.status,
      createdAt: r.created_at
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
