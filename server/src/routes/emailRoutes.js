import { Router } from 'express';
import { body, param } from 'express-validator';
import { emailController } from '../controllers/emailController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = Router();

// Protect all email endpoints with requireAuth
router.use(requireAuth);

// GET /api/emails/threads – List threads with pagination, search, and filtering
router.get('/threads', emailController.listThreads);

// GET /api/emails/threads/:id – Fetch a single thread's full message chain
router.get(
  '/threads/:id',
  [param('id').notEmpty().withMessage('Thread ID is required')],
  validateRequest,
  emailController.getThread
);

// PATCH /api/emails/threads/:id – Update read/unread, star, or archive state
router.patch(
  '/threads/:id',
  [
    param('id').notEmpty().withMessage('Thread ID is required'),
    body('action')
      .isIn(['mark_read', 'mark_unread', 'star', 'unstar', 'archive', 'delete'])
      .withMessage('Valid action is required')
  ],
  validateRequest,
  emailController.updateThread
);

// DELETE /api/emails/threads/:id – Delete a thread
router.delete(
  '/threads/:id',
  [param('id').notEmpty().withMessage('Thread ID is required')],
  validateRequest,
  emailController.deleteThread
);

// POST /api/emails/send – Send a composed or edited-reply email
router.post(
  '/send',
  [
    body('to').isEmail().withMessage('Valid recipient email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('body').trim().notEmpty().withMessage('Email body content is required')
  ],
  validateRequest,
  emailController.sendEmail
);

export default router;
