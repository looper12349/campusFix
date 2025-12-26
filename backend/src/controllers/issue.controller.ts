import { Request, Response, NextFunction } from 'express';
import {
  issueService,
  ValidationError,
  NotFoundError,
} from '../services/issue.service';
import { Category, IssueStatus } from '../models';

/**
 * Issue Controller
 * Handles issue-related endpoints
 * Requirements: 3.1-3.7, 4.1, 5.1-5.3, 6.1-6.3, 7.1-7.4, 8.1-8.2, 12.1
 */
class IssueController {
  /**
   * POST /api/issues
   * Create a new issue with optional image upload
   * Requirements: 3.1-3.7, 12.1
   */
  async createIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      const { title, description, category } = req.body;
      
      // Handle uploaded image - construct URL from uploaded file
      let imageUrl: string | undefined;
      if (req.file) {
        // Construct the URL path for the uploaded image
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      }

      const issue = await issueService.createIssue(
        { title, description, category, imageUrl },
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: {
          id: issue._id.toString(),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          imageUrl: issue.imageUrl,
          createdBy: issue.createdBy.toString(),
          remarks: issue.remarks,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
        },
        message: 'Issue created successfully',
      });
    } catch (error) {
      next(error);
    }
  }


  /**
   * GET /api/issues/my
   * Get student's own issues
   * Requirements: 4.1, 5.1-5.3
   */
  async getMyIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      // Extract filters from query params
      const category = req.query.category as Category | undefined;
      const status = req.query.status as IssueStatus | undefined;

      const issues = await issueService.getIssuesByUser(req.user.id, {
        category,
        status,
      });

      res.status(200).json({
        success: true,
        data: issues.map((issue) => ({
          id: issue._id.toString(),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          imageUrl: issue.imageUrl,
          createdBy: issue.createdBy,
          remarks: issue.remarks.map((r) => ({
            text: r.text,
            addedBy: r.addedBy.toString(),
            addedAt: r.addedAt,
          })),
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          resolvedAt: issue.resolvedAt,
        })),
        message: 'Issues retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/issues
   * Get all issues (admin only)
   * Requirements: 6.1, 6.3
   */
  async getAllIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      // Extract filters from query params
      const category = req.query.category as Category | undefined;
      const status = req.query.status as IssueStatus | undefined;

      const issues = await issueService.getAllIssues({ category, status });

      res.status(200).json({
        success: true,
        data: issues.map((issue) => ({
          id: issue._id.toString(),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          imageUrl: issue.imageUrl,
          createdBy: issue.createdBy,
          remarks: issue.remarks.map((r) => ({
            text: r.text,
            addedBy: r.addedBy.toString(),
            addedAt: r.addedAt,
          })),
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          resolvedAt: issue.resolvedAt,
        })),
        message: 'Issues retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }


  /**
   * PATCH /api/issues/:id/status
   * Update issue status (admin only)
   * Requirements: 7.1-7.4
   */
  async updateIssueStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const issue = await issueService.updateIssueStatus(id, { status });

      res.status(200).json({
        success: true,
        data: {
          id: issue._id.toString(),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          imageUrl: issue.imageUrl,
          createdBy: issue.createdBy,
          remarks: issue.remarks.map((r) => ({
            text: r.text,
            addedBy: r.addedBy.toString(),
            addedAt: r.addedAt,
          })),
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          resolvedAt: issue.resolvedAt,
        },
        message: 'Issue status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/issues/:id/remarks
   * Add remark to issue (admin only)
   * Requirements: 8.1-8.2
   */
  async addRemark(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      const { id } = req.params;
      const { text } = req.body;

      const issue = await issueService.addRemark(id, { text }, req.user.id);

      res.status(200).json({
        success: true,
        data: {
          id: issue._id.toString(),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          imageUrl: issue.imageUrl,
          createdBy: issue.createdBy,
          remarks: issue.remarks.map((r) => ({
            text: r.text,
            addedBy: r.addedBy.toString(),
            addedAt: r.addedAt,
          })),
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          resolvedAt: issue.resolvedAt,
        },
        message: 'Remark added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/issues/:id
   * Get issue by ID
   */
  async getIssueById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      const { id } = req.params;

      const issue = await issueService.getIssueById(id);

      if (!issue) {
        res.status(404).json({
          success: false,
          error: { message: 'Issue not found' },
        });
        return;
      }

      // If student, check if they own the issue
      if (req.user.role === 'student' && issue.createdBy._id.toString() !== req.user.id) {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: issue._id.toString(),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          imageUrl: issue.imageUrl,
          createdBy: issue.createdBy,
          remarks: issue.remarks.map((r) => ({
            text: r.text,
            addedBy: r.addedBy.toString(),
            addedAt: r.addedAt,
          })),
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          resolvedAt: issue.resolvedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const issueController = new IssueController();
