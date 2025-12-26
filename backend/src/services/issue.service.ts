import mongoose from 'mongoose';
import { Issue, IIssue, Category, IssueStatus } from '../models';
import { ValidationError, NotFoundError } from '../utils/errors';

export interface CreateIssueInput {
  title: string;
  description: string;
  category: Category;
  imageUrl?: string;
}

export interface UpdateStatusInput {
  status: IssueStatus;
}

export interface AddRemarkInput {
  text: string;
}

export interface IssueFilters {
  category?: Category;
  status?: IssueStatus;
}

export interface IssueResponse {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: IssueStatus;
  imageUrl?: string;
  createdBy: {
    id: string;
    name?: string;
    email?: string;
  };
  remarks: Array<{
    text: string;
    addedBy: string;
    addedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

/**
 * Issue Service
 * Handles all issue-related business logic
 * Requirements: 3.1-3.7, 4.1, 5.1-5.3, 6.1, 6.3, 7.1-7.4, 8.1
 */
class IssueService {
  private readonly validCategories: Category[] = ['Electrical', 'Water', 'Internet', 'Infrastructure'];
  private readonly validStatuses: IssueStatus[] = ['Open', 'In Progress', 'Resolved'];

  /**
   * Create a new issue
   * Requirements: 3.1-3.7
   */
  async createIssue(input: CreateIssueInput, userId: string): Promise<IIssue> {
    const { title, description, category, imageUrl } = input;

    // Validate title
    if (!title || title.trim() === '') {
      throw new ValidationError('Title is required');
    }

    // Validate description
    if (!description || description.trim() === '') {
      throw new ValidationError('Description is required');
    }

    // Validate category
    if (!category) {
      throw new ValidationError('Category is required');
    }

    if (!this.validCategories.includes(category)) {
      throw new ValidationError(
        `Invalid category. Must be one of: ${this.validCategories.join(', ')}`
      );
    }

    // Create issue with status "Open" and associate with user
    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'Open',
      imageUrl: imageUrl?.trim(),
      createdBy: new mongoose.Types.ObjectId(userId),
      remarks: [],
    });

    return issue;
  }


  /**
   * Get issues by user (student's own issues)
   * Requirements: 4.1
   */
  async getIssuesByUser(
    userId: string,
    filters?: IssueFilters
  ): Promise<IIssue[]> {
    const query: Record<string, unknown> = {
      createdBy: new mongoose.Types.ObjectId(userId),
    };

    // Apply category filter
    if (filters?.category) {
      if (!this.validCategories.includes(filters.category)) {
        throw new ValidationError(
          `Invalid category filter. Must be one of: ${this.validCategories.join(', ')}`
        );
      }
      query.category = filters.category;
    }

    // Apply status filter
    if (filters?.status) {
      if (!this.validStatuses.includes(filters.status)) {
        throw new ValidationError(
          `Invalid status filter. Must be one of: ${this.validStatuses.join(', ')}`
        );
      }
      query.status = filters.status;
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return issues;
  }

  /**
   * Get all issues (admin view)
   * Requirements: 6.1, 6.3
   */
  async getAllIssues(filters?: IssueFilters): Promise<IIssue[]> {
    const query: Record<string, unknown> = {};

    // Apply category filter
    if (filters?.category) {
      if (!this.validCategories.includes(filters.category)) {
        throw new ValidationError(
          `Invalid category filter. Must be one of: ${this.validCategories.join(', ')}`
        );
      }
      query.category = filters.category;
    }

    // Apply status filter
    if (filters?.status) {
      if (!this.validStatuses.includes(filters.status)) {
        throw new ValidationError(
          `Invalid status filter. Must be one of: ${this.validStatuses.join(', ')}`
        );
      }
      query.status = filters.status;
    }

    // Include student information with each issue
    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return issues;
  }


  /**
   * Get issue by ID
   */
  async getIssueById(issueId: string): Promise<IIssue | null> {
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      throw new ValidationError('Invalid issue ID');
    }

    const issue = await Issue.findById(issueId)
      .populate('createdBy', 'name email');

    return issue;
  }

  /**
   * Update issue status (admin only)
   * Requirements: 7.1-7.4
   */
  async updateIssueStatus(
    issueId: string,
    input: UpdateStatusInput
  ): Promise<IIssue> {
    const { status } = input;

    // Validate issue ID
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      throw new NotFoundError('Issue not found');
    }

    // Validate status
    if (!status) {
      throw new ValidationError('Status is required');
    }

    if (!this.validStatuses.includes(status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${this.validStatuses.join(', ')}`
      );
    }

    // Find and update issue
    const issue = await Issue.findById(issueId);

    if (!issue) {
      throw new NotFoundError('Issue not found');
    }

    issue.status = status;

    // Set resolvedAt if status is Resolved (handled by pre-save hook too)
    if (status === 'Resolved' && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    }

    await issue.save();

    // Return populated issue
    return Issue.findById(issueId)
      .populate('createdBy', 'name email') as Promise<IIssue>;
  }

  /**
   * Add remark to issue (admin only)
   * Requirements: 8.1
   */
  async addRemark(
    issueId: string,
    input: AddRemarkInput,
    adminId: string
  ): Promise<IIssue> {
    const { text } = input;

    // Validate issue ID
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      throw new NotFoundError('Issue not found');
    }

    // Validate remark text
    if (!text || text.trim() === '') {
      throw new ValidationError('Remark text is required');
    }

    // Find issue
    const issue = await Issue.findById(issueId);

    if (!issue) {
      throw new NotFoundError('Issue not found');
    }

    // Append remark with timestamp
    issue.remarks.push({
      text: text.trim(),
      addedBy: new mongoose.Types.ObjectId(adminId),
      addedAt: new Date(),
    });

    await issue.save();

    // Return populated issue
    return Issue.findById(issueId)
      .populate('createdBy', 'name email') as Promise<IIssue>;
  }
}

export const issueService = new IssueService();

// Re-export error classes for backward compatibility
export { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';
