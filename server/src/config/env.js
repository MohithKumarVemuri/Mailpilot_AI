import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || (isProd ? 'https://mailpilot-ai-frontend.vercel.app' : 'http://localhost:5173'),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mailpilot_ai',
  jwtSecret: process.env.JWT_SECRET || 'mailpilot_ai_jwt_secret_dev_key_very_secure_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // 32-byte key for AES-256 (64 hex characters)
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      (isProd
        ? 'https://mailpilot-ai-backend.vercel.app/api/integrations/gmail/oauth/callback'
        : 'http://localhost:5000/api/integrations/gmail/oauth/callback'),
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  }
};
