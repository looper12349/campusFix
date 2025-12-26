import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models';
import { ValidationError, AuthenticationError } from '../utils/errors';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface TokenPayload {
  id: string;
  role: UserRole;
}

class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Generate JWT token with user ID and role
   */
  generateToken(userId: string, role: UserRole): string {
    const payload: TokenPayload = { id: userId, role };
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verify JWT token and return payload
   */
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.jwtSecret) as TokenPayload;
  }

  /**
   * Register a new user
   * Requirements: 1.1-1.5
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, role = 'student' } = input;

    // Validate required fields
    if (!name || name.trim() === '') {
      throw new ValidationError('Name is required');
    }

    if (!email || email.trim() === '') {
      throw new ValidationError('Email is required');
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please provide a valid email address');
    }

    // Validate password length
    if (!password || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    });

    // Generate token
    const token = this.generateToken(user._id.toString(), user.role);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Login user with credentials
   * Requirements: 2.1-2.4
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Validate required fields
    if (!email || email.trim() === '') {
      throw new ValidationError('Email is required');
    }

    if (!password) {
      throw new ValidationError('Password is required');
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user._id.toString(), user.role);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-password');
  }
}

export const authService = new AuthService();

// Re-export error classes for backward compatibility
export { ValidationError, AuthenticationError } from '../utils/errors';
