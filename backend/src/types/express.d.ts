/// <reference types="express" />

// Type augmentation for Express Request
// This file extends the Express Request interface to include the user property

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'student' | 'admin';
      };
    }
  }
}

export {};
