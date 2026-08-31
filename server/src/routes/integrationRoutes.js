import { Router } from 'express';
import { integrationController } from '../controllers/integrationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// OAuth callback is hit by Google without Bearer token header
router.get('/gmail/oauth/callback', integrationController.handleCallback);

// Protect other integration endpoints with requireAuth
router.use(requireAuth);

// GET /api/integrations/gmail/status
router.get('/gmail/status', integrationController.getStatus);

// GET /api/integrations/gmail/oauth/start
router.get('/gmail/oauth/start', integrationController.startOAuth);

// POST /api/integrations/gmail/connect-demo
router.post('/gmail/connect-demo', integrationController.connectDemo);

// POST /api/integrations/gmail/disconnect
router.post('/gmail/disconnect', integrationController.disconnect);

export default router;
