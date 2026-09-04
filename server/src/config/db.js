import mongoose from 'mongoose';
import { config } from './env.js';

let isInMemory = false;
let cachedPromise = null;
let lastAttemptTime = 0;
const RETRY_INTERVAL_MS = 30000; // 30s backoff between failed connection attempts

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isInMemory = false;
    return { isInMemory: false };
  }

  const now = Date.now();
  if (!cachedPromise) {
    if (isInMemory && now - lastAttemptTime < RETRY_INTERVAL_MS) {
      return { isInMemory: true };
    }
    lastAttemptTime = now;

    mongoose.set('strictQuery', false);
    cachedPromise = mongoose
      .connect(config.mongoUri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
        bufferCommands: false
      })
      .then((conn) => {
        console.log(`[DB] Connected to MongoDB Atlas successfully`);
        isInMemory = false;
        return conn;
      })
      .catch((err) => {
        cachedPromise = null;
        console.warn(`[DB] Could not connect to external MongoDB: ${err.message}`);
        isInMemory = true;
        return null;
      });
  }

  const conn = await cachedPromise;
  if (conn && mongoose.connection.readyState === 1) {
    isInMemory = false;
    return { isInMemory: false };
  }

  isInMemory = true;
  return { isInMemory: true };
};

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1 || isInMemory,
  isInMemory,
  host: isInMemory ? 'in-memory-fallback' : (mongoose.connection.host || 'unknown')
});
