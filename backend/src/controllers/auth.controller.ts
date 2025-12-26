import { Request, Response, NextFunction } from 'express';
import { authService, ValidationError, AuthenticationError } from '../services/auth.service';

/**
 * Auth Controller
 * Handles authentication endpoints: register, login, profile
 * Requirements: 1.1-1.5, 2.1-2.4
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   * Requirements: 1.1-1.5
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      
      const result = await authService.register({ name, email, password, role });
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user with credentials
   * Requirements: 2.1-2.4
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login({ email, password });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile
   * Get current user profile
   * Requires authentication
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const user = await authService.getProfile(req.user.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
