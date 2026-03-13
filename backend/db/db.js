/**
 * PostgreSQL database connection pool
 * Uses connection pooling for efficient database access
 */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

/**
 * Execute a query with parameterized values (prevents SQL injection)
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Initialize database schema - creates tables if they don't exist
 */
export const initDb = async () => {
  const client = await pool.connect();
  try {
    // Users table (scalable SaaS fields)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backward-compatible migrations (safe no-ops if already applied)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`); // legacy

    // If upgrading from old schema (password column already contains bcrypt hash), copy to password_hash once.
    await client.query(`
      UPDATE users
      SET password_hash = password
      WHERE (password_hash IS NULL OR password_hash = '') AND password IS NOT NULL AND password <> ''
    `);

    // Resumes table (metadata only)
    await client.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backward-compatible migrations for resumes
    await client.query(`ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_url TEXT`);
    await client.query(`ALTER TABLE resumes ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE resumes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); // legacy
    await client.query(`
      UPDATE resumes
      SET uploaded_at = created_at
      WHERE uploaded_at IS NULL AND created_at IS NOT NULL
    `);

    // Resume analysis table (separate, scalable)
    await client.query(`
      CREATE TABLE IF NOT EXISTS resume_analysis (
        id SERIAL PRIMARY KEY,
        resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
        ats_score INTEGER NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
        keyword_score INTEGER CHECK (keyword_score >= 0 AND keyword_score <= 100),
        format_score INTEGER CHECK (format_score >= 0 AND format_score <= 100),
        experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100),
        skills_score INTEGER CHECK (skills_score >= 0 AND skills_score <= 100),
        education_score INTEGER CHECK (education_score >= 0 AND education_score <= 100),
        feedback JSONB DEFAULT '[]',
        suggestions JSONB DEFAULT '[]',
        issues JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // API usage logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        endpoint VARCHAR(255) NOT NULL,
        tokens_used INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
      CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_at ON resumes(uploaded_at DESC);
      CREATE INDEX IF NOT EXISTS idx_resume_analysis_resume_id ON resume_analysis(resume_id);
      CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
    `);

    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};

export default pool;
