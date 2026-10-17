import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://btdtaxpffwjzxyiwzvzq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.warn('⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is not defined in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL connection pool for direct queries and migrations
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:5%4094Pc%21zk%236@db.btdtaxpffwjzxyiwzvzq.supabase.co:5432/postgres';

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}
