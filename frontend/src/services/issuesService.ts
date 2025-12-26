import apiClient from './api';
import {
  Issue,
  CreateIssueRequest,
  IssueStatus,
  Category,
  ApiResponse,
} from '../types';

/**
 * Issues Service
 * Handles all issue-related API calls
 */
class IssuesService {
  /**
   * Get student's own issues
   * @param filters - Optional filters for category and status
   * @returns Promise with array of issues
   */
  async getMyIssues(filters?: {
    category?: Category | null;
    status?: IssueStatus | null;
  }): Promise<Issue[]> {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = `/issues/my${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<any[]>>(url);
      
      if (response.data.data) {
        // Transform id to _id for frontend compatibility
        return response.data.data.map((issue: any) => ({
          ...issue,
          _id: issue.id || issue._id,
        }));
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all issues (admin only)
   * @param filters - Optional filters for category and status
   * @returns Promise with array of all issues
   */
  async getAllIssues(filters?: {
    category?: Category | null;
    status?: IssueStatus | null;
  }): Promise<Issue[]> {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = `/issues${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<any[]>>(url);
      
      if (response.data.data) {
        // Transform id to _id for frontend compatibility
        return response.data.data.map((issue: any) => ({
          ...issue,
          _id: issue.id || issue._id,
        }));
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new issue
   * @param issueData - Issue creation data
   * @returns Promise with created issue
   */
  async createIssue(issueData: CreateIssueRequest): Promise<Issue> {
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('title', issueData.title);
      formData.append('description', issueData.description);
      formData.append('category', issueData.category);
      
      if (issueData.image) {
        formData.append('image', issueData.image as any);
      }

      const response = await apiClient.post<ApiResponse<any>>(
        '/issues',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.data) {
        // Transform id to _id for frontend compatibility
        return {
          ...response.data.data,
          _id: response.data.data.id || response.data.data._id,
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update issue status (admin only)
   * @param issueId - ID of the issue to update
   * @param status - New status value
   * @returns Promise with updated issue
   */
  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/issues/${issueId}/status`,
        { status }
      );
      
      if (response.data.data) {
        // Transform id to _id for frontend compatibility
        return {
          ...response.data.data,
          _id: response.data.data.id || response.data.data._id,
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add remark to issue (admin only)
   * @param issueId - ID of the issue
   * @param remark - Remark text to add
   * @returns Promise with updated issue
   */
  async addRemark(issueId: string, remark: string): Promise<Issue> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/issues/${issueId}/remarks`,
        { remark }
      );
      
      if (response.data.data) {
        // Transform id to _id for frontend compatibility
        return {
          ...response.data.data,
          _id: response.data.data.id || response.data.data._id,
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get issue by ID
   * @param issueId - ID of the issue
   * @returns Promise with issue data
   */
  async getIssueById(issueId: string): Promise<Issue> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/issues/${issueId}`);
      
      if (response.data.data) {
        // Transform id to _id for frontend compatibility
        return {
          ...response.data.data,
          _id: response.data.data.id || response.data.data._id,
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export default new IssuesService();
