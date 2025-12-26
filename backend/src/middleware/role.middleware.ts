import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

/**
 * Role-Based Authorization Middleware
 * Checks if user has required role to access resource
 * Requirements: 10.1-10.3
 */

/**
 * Authorize admin users only
 * Must be used after authenticate middleware
 */
export const authorizeAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Check if user is authenticated
  if (!req.user) {
    next(new AuthenticationError('Not authenticated'));
    return;
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    next(new AuthorizationError('Access denied. Admin privileges required.'));
    return;
  }

  next();
};

/**
 * Factory function to create role-based middleware
 * Allows specifying multiple allowed roles
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      next(new AuthenticationError('Not authenticated'));
      return;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      next(new AuthorizationError('Access denied. Insufficient privileges.'));
      return;
    }

    next();
  };
};
