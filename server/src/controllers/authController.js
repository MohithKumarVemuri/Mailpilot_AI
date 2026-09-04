import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const data = await authService.register({ name, email, password });
      res.status(201).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login({ email, password });
      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id, req.user);
      res.json({
        success: true,
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }
};
