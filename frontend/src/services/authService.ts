import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
  ApiResponse,
} from '../types';

/**
 * Auth Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Register a new user
   * @param credentials - User registration data
   * @returns Promise with auth response containing token and user
   */
  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        credentials
      );
      
      if (response.data.data) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', response.data.data.token);
        return response.data.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login an existing user
   * @param credentials - User login credentials
   * @returns Promise with auth response containing token and user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        credentials
      );
      
      if (response.data.data) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', response.data.data.token);
        return response.data.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   * Removes token from AsyncStorage
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      throw new Error('Failed to logout');
    }
  }

  /**
   * Restore token from AsyncStorage
   * @returns Promise with token or null
   */
  async restoreToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      throw new Error('Failed to restore token');
    }
  }
}

// Export singleton instance
export default new AuthService();
