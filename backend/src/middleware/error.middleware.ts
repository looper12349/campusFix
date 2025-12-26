import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '../utils/errors';
import { MulterValidationError } from './upload.middleware';

/**
 * Error Response Interface
 * Consistent format for all error responses
 * Requirements: 11.1-11.5
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string>;
  };
}

/**
 * Global Error Handler Middleware
 * Formats error responses consistently and hides internal details for 500 errors
 * Requirements: 11.1-11.5
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging (in production, use proper logging)
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', err.stack);
    }
  }

  // Handle AppError and its subclasses (ValidationError, AuthenticationError, AuthorizationError, NotFoundError)
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: { message: err.message },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Multer file size limit error
  if (err instanceof multer.MulterError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large. Maximum size is 5MB.'
          : err.message,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle MulterValidationError (invalid file type)
  if (err instanceof MulterValidationError || err.name === 'MulterValidationError') {
    const response: ErrorResponse = {
      success: false,
      error: { message: err.message },
    };
    res.status(400).json(response);
    return;
  }

  // Handle errors by name for backward compatibility
  if (err.name === 'ValidationError') {
    // Check if it's a Mongoose validation error
    if ('errors' in err) {
      const mongooseError = err as any;
      const messages = Object.values(mongooseError.errors).map(
        (e: any) => e.message
      );
      const response: ErrorResponse = {
        success: false,
        error: { message: messages.join(', ') },
      };
      res.status(400).json(response);
      return;
    }
    // Regular ValidationError
    const response: ErrorResponse = {
      success: false,
      error: { message: err.message },
    };
    res.status(400).json(response);
    return;
  }

  if (err.name === 'AuthenticationError') {
    const response: ErrorResponse = {
      success: false,
      error: { message: err.message },
    };
    res.status(401).json(response);
    return;
  }

  if (err.name === 'AuthorizationError') {
    const response: ErrorResponse = {
      success: false,
      error: { message: err.message },
    };
    res.status(403).json(response);
    return;
  }

  if (err.name === 'NotFoundError') {
    const response: ErrorResponse = {
      success: false,
      error: { message: err.message },
    };
    res.status(404).json(response);
    return;
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const response: ErrorResponse = {
      success: false,
      error: { message: 'Duplicate field value entered' },
    };
    res.status(400).json(response);
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const response: ErrorResponse = {
      success: false,
      error: { message: 'Invalid ID format' },
    };
    res.status(400).json(response);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response: ErrorResponse = {
      success: false,
      error: { message: 'Invalid token' },
    };
    res.status(401).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const response: ErrorResponse = {
      success: false,
      error: { message: 'Token expired' },
    };
    res.status(401).json(response);
    return;
  }

  // Default to 500 server error - hide internal details
  // Requirements: 11.5
  const response: ErrorResponse = {
    success: false,
    error: { message: 'Internal server error' },
  };
  res.status(500).json(response);
};

/**
 * Not Found Handler
 * Catches requests to undefined routes
 * Requirements: 11.4
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};
