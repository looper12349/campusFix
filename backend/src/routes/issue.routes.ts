import { Router } from 'express';
import { issueController } from '../controllers/issue.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeAdmin } from '../middleware/role.middleware';
import { uploadIssueImage } from '../middleware/upload.middleware';

const router = Router();

/**
 * @route   POST /api/issues
 * @desc    Create a new issue with optional image upload
 * @access  Private (Student)
 */
router.post(
  '/',
  authenticate,
  uploadIssueImage,
  (req, res, next) => issueController.createIssue(req, res, next)
);

/**
 * @route   GET /api/issues/my
 * @desc    Get student's own issues
 * @access  Private (Student)
 */
router.get(
  '/my',
  authenticate,
  (req, res, next) => issueController.getMyIssues(req, res, next)
);

/**
 * @route   GET /api/issues
 * @desc    Get all issues (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  (req, res, next) => issueController.getAllIssues(req, res, next)
);

/**
 * @route   GET /api/issues/:id
 * @desc    Get issue by ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  authenticate,
  (req, res, next) => issueController.getIssueById(req, res, next)
);

/**
 * @route   PATCH /api/issues/:id/status
 * @desc    Update issue status (admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  (req, res, next) => issueController.updateIssueStatus(req, res, next)
);

/**
 * @route   POST /api/issues/:id/remarks
 * @desc    Add remark to issue (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/:id/remarks',
  authenticate,
  authorizeAdmin,
  (req, res, next) => issueController.addRemark(req, res, next)
);

export default router;
