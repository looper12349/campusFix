/**
 * Custom Error Classes
 * Provides consistent error handling across the application
 * Requirements: 11.1-11.5
 */

/**
 * Base Application Error
 * All custom errors extend from this class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * ValidationError (400)
 * Used for invalid input data, missing required fields, format errors
 * Requirements: 11.1
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * AuthenticationError (401)
 * Used for invalid credentials, expired tokens, missing tokens
 * Requirements: 11.2
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * AuthorizationError (403)
 * Used for insufficient permissions, role-based access denial
 * Requirements: 11.3
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * NotFoundError (404)
 * Used for resources that don't exist
 * Requirements: 11.4
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
