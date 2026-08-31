import { emailService } from '../services/emailService.js';

export const emailController = {
  async listThreads(req, res, next) {
    try {
      const { q, filter, maxResults, pageToken } = req.query;
      const result = await emailService.listThreads(req.user.id, {
        q,
        filter,
        maxResults: maxResults ? parseInt(maxResults, 10) : 20,
        pageToken
      });
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getThread(req, res, next) {
    try {
      const { id } = req.params;
      const thread = await emailService.getThread(req.user.id, id);
      res.json({
        success: true,
        data: { thread }
      });
    } catch (err) {
      next(err);
    }
  },

  async updateThread(req, res, next) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const updated = await emailService.updateThread(req.user.id, id, action);
      res.json({
        success: true,
        data: { thread: updated }
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteThread(req, res, next) {
    try {
      const { id } = req.params;
      await emailService.deleteThread(req.user.id, id);
      res.json({
        success: true,
        data: { message: 'Thread successfully removed' }
      });
    } catch (err) {
      next(err);
    }
  },

  async sendEmail(req, res, next) {
    try {
      const { to, subject, body, threadId, inReplyTo, references } = req.body;
      const result = await emailService.sendEmail(req.user.id, {
        to,
        subject,
        body,
        threadId,
        inReplyTo,
        references
      });
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
};
