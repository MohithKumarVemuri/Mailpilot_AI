import mongoose from 'mongoose';
import { config } from './env.js';

let isInMemory = false;
let isConnecting = false;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return { isInMemory: false };
  }

  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (mongoose.connection.readyState === 1) return { isInMemory: false };
  }

  isConnecting = true;
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      bufferCommands: false
    });
    isConnecting = false;
    console.log(`[DB] Connected to MongoDB at ${config.mongoUri}`);
    return { isInMemory: false };
  } catch (err) {
    isConnecting = false;
    console.warn(`[DB] Could not connect to external MongoDB: ${err.message}`);
    isInMemory = true;
    return { isInMemory: true };
  }
};

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1 || isInMemory,
  isInMemory,
  host: isInMemory ? 'in-memory-fallback' : (mongoose.connection.host || 'unknown')
});
