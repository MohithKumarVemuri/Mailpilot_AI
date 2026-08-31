import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/env.js';
import { connectDB, getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.) or matching clientUrl
      if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Performance & Logging
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// System Heartbeat & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MailPilot AI Server',
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
    geminiConfigured: Boolean(config.gemini.apiKey),
    googleOAuthConfigured: Boolean(config.google.clientId && config.google.clientSecret)
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/integrations', integrationRoutes);

// Central Error Handler
app.use(errorHandler);

// Bootstrap Server
async function startServer() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`🚀 MailPilot AI Backend Running on port ${config.port}`);
    console.log(`🌐 Health endpoint: http://localhost:${config.port}/api/health`);
    console.log(`🔐 Environment: ${config.nodeEnv}`);
    console.log(`🤖 Gemini AI: ${config.gemini.apiKey ? 'Enabled (Live Key)' : 'Active (Deterministic Fallback Mode)'}`);
    console.log(`📫 Gmail OAuth: ${config.google.clientId ? 'Configured' : 'Demo Simulated Mode'}`);
    console.log(`=========================================`);
  });
}

startServer();

export default app;
