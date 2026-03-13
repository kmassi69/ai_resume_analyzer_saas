/**
 * Multer configuration and upload middleware
 * Centralized here to keep routes/controllers clean.
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export function createResumeUploader({ uploadDir, maxFileSizeBytes }) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname) || '.bin'}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSizeBytes,
    },
  });
}

export function multerErrorHandler(err, req, res, next) {
  if (err?.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max 5MB.' });
    }
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
  }
  next();
}

