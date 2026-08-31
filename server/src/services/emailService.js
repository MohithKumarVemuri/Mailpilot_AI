import { integrationStore } from './dbStore.js';
import { decryptToken, encryptToken } from './tokenEncryptionService.js';
import * as gmailIntegration from '../integrations/gmailIntegration.js';
import { activityService } from './activityService.js';

export const emailService = {
  /**
   * Helper to retrieve and decrypt Gmail tokens for a user
   */
  async getUserTokens(userId) {
    const integration = await integrationStore.findByOwner(userId);
    if (!integration || !integration.isConnected) {
      // Return simulated demo mailbox tokens so user can explore seamlessly
      return { isDemo: true, accessToken: 'demo_token', refreshToken: null, email: 'demo.user@mailpilot.ai' };
    }

    // If integration is demo-simulated
    if (integration.encryptedAccessToken === 'demo_token' || integration.encryptedAccessToken?.startsWith('demo_')) {
      return {
        isDemo: true,
        accessToken: 'demo_token',
        refreshToken: null,
        email: integration.email || 'demo.user@mailpilot.ai'
      };
    }

    const accessToken = decryptToken(integration.encryptedAccessToken);
    const refreshToken = decryptToken(integration.encryptedRefreshToken);

    if (!accessToken && !refreshToken) {
      const error = new Error('Gmail authentication expired or token could not be decrypted.');
      error.code = 'AUTH_EXPIRED';
      error.statusCode = 401;
      throw error;
    }

    return {
      isDemo: false,
      accessToken,
      refreshToken,
      email: integration.email,
      onRefresh: async (newTokens) => {
        if (newTokens.access_token) {
          const encAccess = encryptToken(newTokens.access_token);
          const encRefresh = newTokens.refresh_token ? encryptToken(newTokens.refresh_token) : undefined;
          await integrationStore.upsert(userId, {
            encryptedAccessToken: encAccess,
            ...(encRefresh ? { encryptedRefreshToken: encRefresh } : {}),
            expiresAt: newTokens.expiry_date ? new Date(newTokens.expiry_date) : undefined
          });
        }
      }
    };
  },

  /**
   * List email threads with search/filter
   */
  async listThreads(userId, options = {}) {
    const tokens = await this.getUserTokens(userId);
    return await gmailIntegration.listThreads(tokens, options);
  },

  /**
   * Fetch single thread with parsed messages
   */
  async getThread(userId, threadId) {
    const tokens = await this.getUserTokens(userId);
    return await gmailIntegration.getThread(tokens, threadId);
  },

  /**
   * Update thread state (read/unread, star/unstar, archive)
   */
  async updateThread(userId, threadId, action) {
    const tokens = await this.getUserTokens(userId);
    return await gmailIntegration.updateThread(tokens, threadId, action);
  },

  /**
   * Delete or trash a thread
   */
  async deleteThread(userId, threadId) {
    const tokens = await this.getUserTokens(userId);
    return await gmailIntegration.deleteThread(tokens, threadId);
  },

  /**
   * Send an email or thread reply
   */
  async sendEmail(userId, { to, subject, body, threadId, inReplyTo, references }) {
    const startTime = Date.now();
    const actionRecord = await activityService.startAction({
      owner: userId,
      gmailThreadId: threadId || 'new_email',
      actionType: 'send',
      aiProvider: 'fallback',
      inputLength: (body || '').length,
      meta: { to, subject, threadId }
    });

    try {
      const tokens = await this.getUserTokens(userId);
      const result = await gmailIntegration.sendEmail(tokens, {
        to,
        subject,
        body,
        threadId,
        inReplyTo,
        references,
        userEmail: tokens.email
      });

      const durationMs = Date.now() - startTime;
      await activityService.completeAction(actionRecord._id || actionRecord.id, {
        output: { result, message: 'Email successfully sent' },
        durationMs,
        meta: { to, subject, threadId }
      });

      return result;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      await activityService.failAction(actionRecord._id || actionRecord.id, {
        error: err.message,
        durationMs,
        meta: { to, subject, threadId }
      });
      throw err;
    }
  }
};
