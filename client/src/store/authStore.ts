import { create } from 'zustand';
import { authApi } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

const savedToken = localStorage.getItem('mailpilot_token');
const savedUser = localStorage.getItem('mailpilot_user')
  ? JSON.parse(localStorage.getItem('mailpilot_user')!)
  : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser,
  token: savedToken,
  isAuthenticated: Boolean(savedToken),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      const { user, token } = res.data;
      localStorage.setItem('mailpilot_token', token);
      localStorage.setItem('mailpilot_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register({ name, email, password });
      const { user, token } = res.data;
      localStorage.setItem('mailpilot_token', token);
      localStorage.setItem('mailpilot_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Registration failed.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('mailpilot_token');
    localStorage.removeItem('mailpilot_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    if (!localStorage.getItem('mailpilot_token')) return;
    try {
      const res = await authApi.getMe();
      const user = res.data.user;
      localStorage.setItem('mailpilot_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      // Token might be invalid
      localStorage.removeItem('mailpilot_token');
      localStorage.removeItem('mailpilot_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}));
