import { Router } from 'express';
import multer from 'multer';
import { pool, supabase } from '../db/supabase.js';

export const talentRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET talent profile
talentRouter.get('/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM talent_profiles LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const p = result.rows[0];
    res.json({
      id: p.id,
      name: p.name,
      headline: p.headline,
      bio: p.bio,
      location: p.location,
      experienceYears: p.experience_years,
      skills: (p.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
      resumeFileName: p.resume_url?.split('/').pop() || 'taras_kowalski_staff_systems_resume.pdf',
      parsedAt: p.parsed_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload resume to Supabase Storage bucket 'resumes'
talentRouter.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    const fileName = file ? `${Date.now()}_${file.originalname}` : `resume_${Date.now()}.pdf`;

    let resumeUrl = `https://btdtaxpffwjzxyiwzvzq.supabase.co/storage/v1/object/public/resumes/${fileName}`;

    if (file) {
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        console.warn('Storage upload note:', error.message);
      }
    }

    // Update profile
    const result = await pool.query(`
      UPDATE talent_profiles
      SET resume_url = $1, parsed_at = now()
      WHERE id = (SELECT id FROM talent_profiles LIMIT 1)
      RETURNING *;
    `, [resumeUrl]);

    const p = result.rows[0];
    res.json({
      id: p.id,
      name: p.name,
      headline: p.headline,
      bio: p.bio,
      location: p.location,
      experienceYears: p.experience_years,
      skills: (p.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
      resumeFileName: file ? file.originalname : fileName,
      parsedAt: p.parsed_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET startup matches
talentRouter.get('/matches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM startup_matches ORDER BY match_percentage DESC');
    res.json(
      result.rows.map((m) => ({
        id: m.id,
        startupName: m.startup_name,
        role: m.role,
        matchPercentage: m.match_percentage,
        fundingStage: m.funding_stage,
        location: m.location,
        equityRange: m.equity_range,
        salaryRange: m.salary_range,
        keySkillsMatched: m.key_skills_matched || [],
        missingSkills: m.missing_skills || [],
        companyBio: m.company_bio,
        founderName: m.founder_name,
        logoUrl: m.logo_url
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET applications
talentRouter.get('/applications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications ORDER BY applied_date DESC');
    res.json(
      result.rows.map((a) => ({
        id: a.id,
        companyName: a.company_name,
        role: a.role,
        appliedDate: new Date(a.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: a.status,
        matchPercentage: a.match_percentage,
        hasReport: a.has_report,
        stageInfo: a.stage_info
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET rejection growth report by application ID
talentRouter.get('/applications/:id/report', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM rejection_reports WHERE application_id = $1', [id]);
    if (result.rows.length === 0) {
      // Fallback to app_1
      const fallback = await pool.query('SELECT * FROM rejection_reports WHERE application_id = $1', ['app_1']);
      if (fallback.rows.length > 0) {
        const r = fallback.rows[0];
        return res.json({
          id: r.id,
          applicationId: r.application_id,
          roleTitle: r.role_title,
          companyName: r.company_name,
          stage: r.stage,
          decisionDate: r.decision_date,
          primaryReason: r.primary_reason,
          summary: r.summary,
          severity: r.severity,
          missingSkills: r.missing_skills || [],
          focusAreas: r.focus_areas || [],
          targetReEvaluationDate: 'Nov 7, 2024',
          weeksRemaining: r.weeks_remaining,
          learningTimeline: r.learning_timeline || [],
          recommendedMentorId: r.recommended_mentor_id
        });
      }
      return res.status(404).json({ error: 'Report not found' });
    }

    const r = result.rows[0];
    res.json({
      id: r.id,
      applicationId: r.application_id,
      roleTitle: r.role_title,
      companyName: r.company_name,
      stage: r.stage,
      decisionDate: r.decision_date,
      primaryReason: r.primary_reason,
      summary: r.summary,
      severity: r.severity,
      missingSkills: r.missing_skills || [],
      focusAreas: r.focus_areas || [],
      targetReEvaluationDate: 'Nov 7, 2024',
      weeksRemaining: r.weeks_remaining,
      learningTimeline: r.learning_timeline || [],
      recommendedMentorId: r.recommended_mentor_id
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
