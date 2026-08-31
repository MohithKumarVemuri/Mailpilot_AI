import { config } from '../config/env.js';
import { integrationStore } from '../services/dbStore.js';
import { encryptToken } from '../services/tokenEncryptionService.js';
import * as gmailIntegration from '../integrations/gmailIntegration.js';

export const integrationController = {
  async getStatus(req, res, next) {
    try {
      const integration = await integrationStore.findByOwner(req.user.id);
      if (!integration || !integration.isConnected) {
        return res.json({
          success: true,
          data: {
            provider: 'gmail',
            isConnected: false,
            email: null,
            scopes: [],
            isDemo: !config.google.clientId
          }
        });
      }

      res.json({
        success: true,
        data: {
          provider: 'gmail',
          isConnected: true,
          email: integration.email,
          displayName: integration.displayName,
          scopes: integration.scopes || [],
          expiresAt: integration.expiresAt,
          isDemo: integration.encryptedAccessToken === 'demo_token' || !config.google.clientId
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async startOAuth(req, res, next) {
    try {
      const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');
      if (!config.google.clientId || !config.google.clientSecret) {
        // Return notice or direct simulated connect URL
        const authUrl = `${config.clientUrl}/integrations?demo_connect=true`;
        return res.json({
          success: true,
          data: {
            authUrl,
            mode: 'demo_simulation',
            message: 'Google OAuth Client credentials not set in server .env; demo simulation available.'
          }
        });
      }

      const authUrl = gmailIntegration.getAuthUrl(state);
      res.json({
        success: true,
        data: { authUrl, mode: 'google_oauth' }
      });
    } catch (err) {
      next(err);
    }
  },

  async handleCallback(req, res) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${config.clientUrl}/integrations?error=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect(`${config.clientUrl}/integrations?error=missing_code`);
      }

      let userId = null;
      if (state) {
        try {
          const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          userId = parsed.userId;
        } catch (e) {
          console.warn('[OAuth] Could not parse state:', e.message);
        }
      }

      if (!userId) {
        return res.redirect(`${config.clientUrl}/integrations?error=invalid_state`);
      }

      const { tokens, email, displayName } = await gmailIntegration.exchangeCodeForTokens(code);

      const encryptedAccessToken = encryptToken(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : undefined;

      await integrationStore.upsert(userId, {
        provider: 'gmail',
        isConnected: true,
        email,
        displayName,
        scopes: tokens.scope ? tokens.scope.split(' ') : config.google.scopes,
        encryptedAccessToken,
        ...(encryptedRefreshToken ? { encryptedRefreshToken } : {}),
        tokenType: tokens.token_type || 'Bearer',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      });

      res.redirect(`${config.clientUrl}/integrations?status=connected&email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error('[OAuth] Callback handling error:', err);
      res.redirect(`${config.clientUrl}/integrations?error=${encodeURIComponent(err.message)}`);
    }
  },

  async connectDemo(req, res, next) {
    try {
      await integrationStore.upsert(req.user.id, {
        provider: 'gmail',
        isConnected: true,
        email: `${req.user.name.toLowerCase().replace(/\s+/g, '.')}@demo-gmail.com`,
        displayName: req.user.name,
        scopes: config.google.scopes,
        encryptedAccessToken: 'demo_token',
        encryptedRefreshToken: 'demo_refresh_token',
        expiresAt: new Date(Date.now() + 86400000 * 30)
      });

      res.json({
        success: true,
        data: { message: 'Demo Gmail mailbox connected successfully' }
      });
    } catch (err) {
      next(err);
    }
  },

  async disconnect(req, res, next) {
    try {
      await integrationStore.delete(req.user.id);
      res.json({
        success: true,
        data: { message: 'Gmail integration disconnected successfully' }
      });
    } catch (err) {
      next(err);
    }
  }
};
