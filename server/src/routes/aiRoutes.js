import { Router } from 'express';
import { body } from 'express-validator';
import { aiController } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = Router();

// GET /api/ai/health – Provider health check
router.get('/health', aiController.getHealth);

// Protect subsequent AI endpoints with requireAuth
router.use(requireAuth);

// POST /api/ai/summarize – Generate a summary for a given thread
router.post(
  '/summarize',
  [body('threadId').notEmpty().withMessage('Thread ID is required')],
  validateRequest,
  aiController.summarize
);

// POST /api/ai/generate-reply – Generate a tone-matched reply draft for a given thread
router.post(
  '/generate-reply',
  [
    body('threadId').notEmpty().withMessage('Thread ID is required'),
    body('tone')
      .optional()
      .isIn(['Professional', 'Friendly', 'Formal', 'Concise'])
      .withMessage('Tone must be Professional, Friendly, Formal, or Concise')
  ],
  validateRequest,
  aiController.generateReply
);

// GET /api/ai/history – Fetch the AI activity log with pagination
router.get('/history', aiController.getHistory);

// Bonus: POST /api/ai/extract-actions
router.post(
  '/extract-actions',
  [body('threadId').notEmpty().withMessage('Thread ID is required')],
  validateRequest,
  aiController.extractActions
);

// Bonus: POST /api/ai/classify
router.post(
  '/classify',
  [body('threadId').notEmpty().withMessage('Thread ID is required')],
  validateRequest,
  aiController.classify
);

// Bonus: GET /api/ai/daily-digest
router.get('/daily-digest', aiController.dailyDigest);

export default router;
