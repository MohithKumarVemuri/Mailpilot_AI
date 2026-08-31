import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { userStore } from './dbStore.js';

const BCRYPT_SALT_ROUNDS = 12;

export const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const existing = await userStore.findByEmail(email);
    if (existing) {
      const error = new Error('User already exists with this email address');
      error.statusCode = 400;
      error.code = 'USER_ALREADY_EXISTS';
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await userStore.create({
      name,
      email,
      password: hashedPassword
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  },

  /**
   * Authenticate user and issue JWT
   */
  async login({ email, password }) {
    const user = await userStore.findByEmail(email, true);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    await userStore.updateLastLogin(user._id || user.id);
    const token = this.generateToken(user);

    return {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin
      },
      token
    };
  },

  /**
   * Fetch current user profile
   */
  async getProfile(userId) {
    const user = await userStore.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
  },

  /**
   * Helper to generate JWT token
   */
  generateToken(user) {
    const id = user._id ? user._id.toString() : user.id;
    return jwt.sign({ id, email: user.email, name: user.name }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }
};
