import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - should be configured via environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as any;
      const errorMessage = errorData?.error || errorData?.message || 'An error occurred';
      
      // Handle specific status codes
      switch (error.response.status) {
        case 400:
          throw new Error(`Validation Error: ${errorMessage}`);
        case 401:
          throw new Error(`Authentication Error: ${errorMessage}`);
        case 403:
          throw new Error(`Authorization Error: ${errorMessage}`);
        case 404:
          throw new Error(`Not Found: ${errorMessage}`);
        case 500:
          throw new Error('Server Error: Something went wrong on the server');
        default:
          throw new Error(errorMessage);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error: Unable to reach the server');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export default apiClient;
