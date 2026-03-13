-- AI Resume Analyzer - PostgreSQL Schema (Scalable SaaS)
-- Run this file manually if you prefer to set up tables outside of the app.

-- Drop tables if exists (for clean reset - use with caution)
-- DROP TABLE IF EXISTS api_usage_logs;
-- DROP TABLE IF EXISTS resume_analysis;
-- DROP TABLE IF EXISTS resumes;
-- DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table (metadata only)
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume analysis table (separate for scalability)
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
);

-- API usage logs (for AI usage tracking)
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_at ON resumes(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_resume_id ON resume_analysis(resume_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
