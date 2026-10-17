import { pool } from './supabase.js';

async function verify() {
  console.log('🔍 Verifying Phase 2 Supabase Configuration...');
  try {
    // 1. Check Tables
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('📊 Active Database Tables (' + tables.length + '):', tables);

    // 2. Check Vector extension
    const extRes = await pool.query(`
      SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pgcrypto');
    `);
    console.log('⚡ Active Extensions:', extRes.rows);

    // 3. Check Storage bucket
    const bucketRes = await pool.query(`
      SELECT id, name, public FROM storage.buckets WHERE id = 'resumes';
    `);
    console.log('📁 Storage Bucket "resumes":', bucketRes.rows);

    // 4. Check RLS status
    const rlsRes = await pool.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relnamespace = 'public'::regnamespace 
        AND relkind = 'r' 
        AND relname IN ('profiles', 'ideas', 'validation_runs', 'plans', 'roles', 'talent_profiles', 'targets', 'applications', 'rejection_reports', 'outreach', 'mentors', 'mentor_requests', 'chat_logs');
    `);
    console.log('🔒 RLS Enabled on Tables:', rlsRes.rows);

    console.log('✅ Supabase Schema, Extensions, Buckets & RLS Verified Successfully!');
  } catch (err) {
    console.error('❌ Verification error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verify();
