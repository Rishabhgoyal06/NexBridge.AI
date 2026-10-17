import { Router } from 'express';
import { pool } from '../db/supabase.js';

export const authRouter = Router();

// GET current user
authRouter.get('/me', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profiles LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({
        id: 'usr_founder_01',
        email: 'aarav@nexbridge.ai',
        name: 'Aarav Patel',
        role: 'founder',
        headline: 'Seed Founder • Building NutriFit AI',
        company: 'NutriFit AI',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST login / switch role
authRouter.post('/login', async (req, res) => {
  const { email, role = 'founder' } = req.body;
  try {
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Demo User';
    const result = await pool.query(`
      INSERT INTO profiles (email, name, role, headline, avatar, company)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name
      RETURNING *;
    `, [
      email,
      name,
      role,
      role === 'founder' ? 'Seed Founder • Building NutriFit AI' : role === 'talent' ? 'Staff Distributed Systems Architect' : 'Angel Investor & Product Advisor',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'NutriFit AI'
    ]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
