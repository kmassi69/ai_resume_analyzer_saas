/**
 * Resume Parser Service
 * Extracts text from PDF and DOCX files
 */
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const parsePdf = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parse error:', error);
    throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
  }
};

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} - Extracted text
 */
export const parseDocx = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value || '';
  } catch (error) {
    console.error('DOCX parse error:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it is a valid Word document.');
  }
};

/**
 * Extract text from resume file based on extension
 * @param {string} filePath - Path to file
 * @param {string} mimeType - MIME type of file
 * @returns {Promise<string>} - Extracted text
 */
export const extractResumeText = async (filePath, mimeType) => {
  const isPdf = mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf');
  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.toLowerCase().endsWith('.docx');

  if (isPdf) {
    return await parsePdf(filePath);
  }
  if (isDocx) {
    return await parseDocx(filePath);
  }

  throw new Error('Unsupported file format. Please upload PDF or DOCX.');
};
