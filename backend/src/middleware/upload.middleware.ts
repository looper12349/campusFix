import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

/**
 * Upload Middleware Configuration
 * Configures Multer for image uploads with validation
 * Requirements: 12.1-12.3
 */

// Allowed file types (jpeg, png, gif only)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Store uploads in the uploads directory
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `issue-${uniqueSuffix}${ext}`);
  },
});

// File filter for validation
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new MulterValidationError('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'));
    return;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new MulterValidationError('Invalid file extension. Only .jpg, .jpeg, .png, and .gif are allowed.'));
    return;
  }

  cb(null, true);
};

// Custom error class for Multer validation errors
export class MulterValidationError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'MulterValidationError';
    this.statusCode = 400;
  }
}

// Configure Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Export single file upload middleware for issue images
export const uploadIssueImage = upload.single('image');

// Export constants for testing
export const UPLOAD_CONFIG = {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
};
