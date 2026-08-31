import { aiService } from '../services/aiService.js';
import { activityService } from '../services/activityService.js';

export const aiController = {
  async summarize(req, res, next) {
    try {
      const { threadId } = req.body;
      const result = await aiService.summarizeThread(req.user.id, threadId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async generateReply(req, res, next) {
    try {
      const { threadId, tone, instruction } = req.body;
      const result = await aiService.generateReply(req.user.id, {
        threadId,
        tone,
        instruction
      });
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const history = await activityService.getHistory(req.user.id, limit);
      res.json({
        success: true,
        data: { history }
      });
    } catch (err) {
      next(err);
    }
  },

  async extractActions(req, res, next) {
    try {
      const { threadId } = req.body;
      const result = await aiService.extractActionItems(req.user.id, threadId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async classify(req, res, next) {
    try {
      const { threadId } = req.body;
      const result = await aiService.classifyThread(req.user.id, threadId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async dailyDigest(req, res, next) {
    try {
      const result = await aiService.generateDailyDigest(req.user.id);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getHealth(req, res) {
    const health = aiService.getHealth();
    res.json({
      success: true,
      data: health
    });
  }
};
