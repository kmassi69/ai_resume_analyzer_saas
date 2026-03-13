/**
 * Resume Controller
 * Handles resume upload, analysis, and history
 */
import { query } from '../db/db.js';
import { extractResumeText } from '../services/resumeParser.js';
import { analyzeResume } from '../services/aiService.js';
import { scoreResumeDeterministically } from '../services/atsScorer.js';
import fs from 'fs/promises';

/**
 * Upload and analyze resume
 * POST /api/resume/upload
 * Flow: receive file -> extract text -> send to AI -> store in DB -> return results
 */
export const uploadResume = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX file',
      });
    }

    filePath = req.file.path;
    const userId = req.userId;
    const fileName = req.file.originalname;
    const fileUrl = null; // placeholder for future S3/cloud storage

    // Step 1: Extract text from file
    const resumeText = await extractResumeText(filePath, req.file.mimetype);

    // Step 2: Deterministic scoring (keyword matching + structure heuristics)
    const scores = scoreResumeDeterministically(resumeText);

    // Step 3: AI feedback (issues/suggestions/strengths) - optional but recommended
    const ai = await analyzeResume(resumeText);
    const analysis = { ...scores, ...ai };

    // Step 3: Store resume metadata in database
    const resumeResult = await query(
      `INSERT INTO resumes (user_id, file_name, file_url)
       VALUES ($1, $2, $3)
       RETURNING id, file_name, file_url, uploaded_at`,
      [userId, fileName, fileUrl]
    );
    const savedResume = resumeResult.rows[0];

    // Step 4: Store analysis in resume_analysis table
    const analysisResult = await query(
      `INSERT INTO resume_analysis
        (resume_id, ats_score, keyword_score, format_score, experience_score, skills_score, education_score, feedback, suggestions, issues)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, ats_score, keyword_score, format_score, experience_score, skills_score, education_score,
                 feedback, suggestions, issues, created_at`,
      [
        savedResume.id,
        analysis.atsScore,
        analysis.keywordScore,
        analysis.formatScore,
        analysis.experienceScore,
        analysis.skillsScore,
        analysis.educationScore,
        JSON.stringify(analysis.feedback || []),
        JSON.stringify(analysis.suggestions || []),
        JSON.stringify(analysis.issues || []),
      ]
    );
    const savedAnalysis = analysisResult.rows[0];

    // Step 4.5: Store API usage log (best-effort)
    try {
      const tokensUsed = analysis?._meta?.tokensUsed ?? null;
      await query(
        `INSERT INTO api_usage_logs (user_id, endpoint, tokens_used)
         VALUES ($1, $2, $3)`,
        [userId, '/api/resume/upload', tokensUsed]
      );
    } catch (logErr) {
      console.warn('Could not log API usage:', logErr.message);
    }

    // Step 5: Delete uploaded file (optional - saves disk space)
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      console.warn('Could not delete temp file:', unlinkErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        resumeId: savedResume.id,
        analysisId: savedAnalysis.id,
        fileName: savedResume.file_name,
        fileUrl: savedResume.file_url,
        uploadedAt: savedResume.uploaded_at,

        atsScore: savedAnalysis.ats_score,
        keywordScore: savedAnalysis.keyword_score,
        formatScore: savedAnalysis.format_score,
        experienceScore: savedAnalysis.experience_score,
        skillsScore: savedAnalysis.skills_score,
        educationScore: savedAnalysis.education_score,

        issues: savedAnalysis.issues || [],
        suggestions: savedAnalysis.suggestions || [],
        feedback: savedAnalysis.feedback || [],
        createdAt: savedAnalysis.created_at,
      },
    });
  } catch (error) {
    // Clean up file on error
    if (filePath) {
      try {
        await fs.unlink(filePath).catch(() => {});
      } catch (e) {
        // ignore
      }
    }

    console.error('Upload resume error:', error);
    const statusCode = error.message?.includes('Unsupported') || error.message?.includes('Failed to parse')
      ? 400
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to analyze resume',
    });
  }
};

/**
 * Get user's resume history
 * GET /api/resume/history
 */
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT
         r.id AS resume_id,
         r.file_name,
         r.uploaded_at,
         ra.ats_score,
         ra.created_at AS analyzed_at
       FROM resumes r
       LEFT JOIN LATERAL (
         SELECT *
         FROM resume_analysis
         WHERE resume_id = r.id
         ORDER BY created_at DESC
         LIMIT 1
       ) ra ON true
       WHERE r.user_id = $1
       ORDER BY r.uploaded_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.resume_id,
        fileName: row.file_name,
        atsScore: row.ats_score,
        uploadedAt: row.uploaded_at,
        analyzedAt: row.analyzed_at,
      })),
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume history',
    });
  }
};

/**
 * Get single resume analysis by ID
 * GET /api/resume/:id
 */
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `SELECT
         r.id AS resume_id,
         r.file_name,
         r.file_url,
         r.uploaded_at,
         ra.id AS analysis_id,
         ra.ats_score,
         ra.keyword_score,
         ra.format_score,
         ra.experience_score,
         ra.skills_score,
         ra.education_score,
         ra.feedback,
         ra.suggestions,
         ra.issues,
         ra.created_at
       FROM resumes r
       LEFT JOIN LATERAL (
         SELECT *
         FROM resume_analysis
         WHERE resume_id = r.id
         ORDER BY created_at DESC
         LIMIT 1
       ) ra ON true
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    const resume = result.rows[0];
    res.json({
      success: true,
      data: {
        resumeId: resume.resume_id,
        analysisId: resume.analysis_id,
        fileName: resume.file_name,
        fileUrl: resume.file_url,
        uploadedAt: resume.uploaded_at,

        atsScore: resume.ats_score,
        keywordScore: resume.keyword_score,
        formatScore: resume.format_score,
        experienceScore: resume.experience_score,
        skillsScore: resume.skills_score,
        educationScore: resume.education_score,

        feedback: resume.feedback || [],
        suggestions: resume.suggestions || [],
        issues: resume.issues || [],
        createdAt: resume.created_at,
      },
    });
  } catch (error) {
    console.error('Get resume by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
    });
  }
};
