import { emailActionStore } from './dbStore.js';

export const activityService = {
  /**
   * Records the start of an AI action
   */
  async startAction({ owner, gmailThreadId, actionType, aiProvider, inputLength = 0, meta = {} }) {
    return await emailActionStore.create({
      owner,
      gmailThreadId: gmailThreadId || 'system',
      actionType,
      aiProvider: aiProvider || 'fallback',
      status: 'PENDING',
      inputLength,
      meta,
      retryCount: 0
    });
  },

  /**
   * Completes an AI action record
   */
  async completeAction(actionId, { output, durationMs, aiProvider, meta }) {
    return await emailActionStore.update(actionId, {
      status: 'COMPLETED',
      output,
      durationMs,
      ...(aiProvider ? { aiProvider } : {}),
      ...(meta ? { meta } : {})
    });
  },

  /**
   * Marks an AI action as failed
   */
  async failAction(actionId, { error, durationMs, meta }) {
    return await emailActionStore.update(actionId, {
      status: 'FAILED',
      error: typeof error === 'string' ? error : error?.message || 'Unknown error',
      durationMs,
      ...(meta ? { meta } : {})
    });
  },

  /**
   * Marks an AI action as retried
   */
  async markRetried(actionId) {
    const existing = await emailActionStore.findById(actionId);
    const retryCount = (existing?.retryCount || 0) + 1;
    return await emailActionStore.update(actionId, {
      status: 'RETRIED',
      retryCount
    });
  },

  /**
   * Fetch action history for a user
   */
  async getHistory(userId, limit = 50) {
    return await emailActionStore.findByOwner(userId, limit);
  }
};
