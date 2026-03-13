/**
 * Resume Routes
 * All routes require authentication
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
import { createResumeUploader, multerErrorHandler } from '../utils/fileUpload.js';
import {
  uploadResume,
  getResumeHistory,
  getResumeById,
} from '../controllers/resumeController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');
const upload = createResumeUploader({
  uploadDir,
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
});

const router = express.Router();

// POST /api/resume/upload - single file, field name: 'resume' (requires auth)
router.post('/upload', protect, upload.single('resume'), multerErrorHandler, uploadResume);

// GET /api/resume/history - must be before /:id (requires auth)
router.get('/history', protect, getResumeHistory);

// GET /api/resume/:id (requires auth)
router.get('/:id', protect, getResumeById);

export default router;
