import axios from 'axios';
import { Tone } from '../types';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? 'https://mailpilot-ai-backend.vercel.app/api'
      : '/api'),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mailpilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for catching auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
      localStorage.removeItem('mailpilot_token');
      localStorage.removeItem('mailpilot_user');
      window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const emailApi = {
  async listThreads(params: { q?: string; filter?: string; pageToken?: string } = {}) {
    const res = await api.get('/emails/threads', { params });
    return res.data;
  },

  async getThread(id: string) {
    const res = await api.get(`/emails/threads/${id}`);
    return res.data;
  },

  async updateThread(id: string, action: 'mark_read' | 'mark_unread' | 'star' | 'unstar' | 'archive' | 'unarchive' | 'move_to_inbox' | 'restore' | 'delete') {
    const res = await api.patch(`/emails/threads/${id}`, { action });
    return res.data;
  },


  async deleteThread(id: string) {
    const res = await api.delete(`/emails/threads/${id}`);
    return res.data;
  },

  async sendEmail(data: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
    inReplyTo?: string;
    references?: string;
  }) {
    const res = await api.post('/emails/send', data);
    return res.data;
  }
};

export const aiApi = {
  async summarize(threadId: string) {
    const res = await api.post('/ai/summarize', { threadId });
    return res.data;
  },

  async generateReply(params: { threadId: string; tone?: Tone; instruction?: string }) {
    const res = await api.post('/ai/generate-reply', params);
    return res.data;
  },

  async getHistory(limit = 50) {
    const res = await api.get('/ai/history', { params: { limit } });
    return res.data;
  },

  async extractActions(threadId: string) {
    const res = await api.post('/ai/extract-actions', { threadId });
    return res.data;
  },

  async classify(threadId: string) {
    const res = await api.post('/ai/classify', { threadId });
    return res.data;
  },

  async getDailyDigest() {
    const res = await api.get('/ai/daily-digest');
    return res.data;
  },

  async getHealth() {
    const res = await api.get('/ai/health');
    return res.data;
  }
};

export const integrationApi = {
  async getStatus() {
    const res = await api.get('/integrations/gmail/status');
    return res.data;
  },

  async startOAuth() {
    const res = await api.get('/integrations/gmail/oauth/start');
    return res.data;
  },

  async connectDemo() {
    const res = await api.post('/integrations/gmail/connect-demo');
    return res.data;
  },

  async disconnect() {
    const res = await api.post('/integrations/gmail/disconnect');
    return res.data;
  }
};

export default api;
