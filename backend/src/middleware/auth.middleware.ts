import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticationError } from '../utils/errors';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Requirements: 9.1-9.4
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next(new AuthenticationError('No token provided'));
      return;
    }

    // Check for Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      next(new AuthenticationError('Invalid token format'));
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      next(new AuthenticationError('No token provided'));
      return;
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Handle JWT errors - pass to error handler middleware
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        next(new AuthenticationError('Token expired'));
        return;
      }
      
      if (error.name === 'JsonWebTokenError') {
        next(new AuthenticationError('Invalid token'));
        return;
      }
    }

    next(new AuthenticationError('Authentication failed'));
  }
};
