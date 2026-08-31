import { create } from 'zustand';
import { emailApi, aiApi, integrationApi } from '../services/api';
import { EmailThread, EmailAction, ReplyDraft, Tone, ActionItem, IntegrationStatus, DailyDigest } from '../types';

interface EmailState {
  threads: EmailThread[];
  activeThreadId: string | null;
  activeThread: EmailThread | null;
  searchQuery: string;
  activeFilter: string;
  isLoadingThreads: boolean;
  isLoadingThreadDetail: boolean;
  isSummarizing: boolean;
  isGeneratingReply: boolean;
  isSending: boolean;
  history: EmailAction[];
  isLoadingHistory: boolean;
  integrationStatus: IntegrationStatus | null;
  aiSummaries: Record<string, { summary: string; aiProvider: string; durationMs: number; tokenEstimate: number }>;
  aiDrafts: Record<string, ReplyDraft>;
  aiActionItems: Record<string, ActionItem[]>;
  aiClassifications: Record<string, { priority: 'High' | 'Medium' | 'Low'; category: string; reasoning: string }>;
  dailyDigest: DailyDigest | null;
  isGeneratingDigest: boolean;
  error: string | null;

  setSearchQuery: (q: string) => void;
  setActiveFilter: (filter: string) => void;
  setActiveThreadId: (id: string | null) => void;
  fetchThreads: (options?: { q?: string; filter?: string }) => Promise<void>;
  fetchThreadDetail: (id: string) => Promise<void>;
  updateThreadAction: (id: string, action: 'mark_read' | 'mark_unread' | 'star' | 'unstar' | 'archive' | 'unarchive' | 'move_to_inbox' | 'restore' | 'delete') => Promise<void>;
  deleteThread: (id: string) => Promise<void>;

  summarizeThread: (threadId: string) => Promise<void>;
  generateReplyDraft: (threadId: string, tone?: Tone, instruction?: string) => Promise<void>;
  extractActions: (threadId: string) => Promise<void>;
  classifyThread: (threadId: string) => Promise<void>;
  generateDailyDigest: () => Promise<void>;
  sendEmail: (data: { to: string; subject: string; body: string; threadId?: string; inReplyTo?: string; references?: string }) => Promise<boolean>;
  fetchHistory: () => Promise<void>;
  fetchIntegrationStatus: () => Promise<void>;
  connectDemoGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  activeThread: null,
  searchQuery: '',
  activeFilter: 'inbox',
  isLoadingThreads: false,
  isLoadingThreadDetail: false,
  isSummarizing: false,
  isGeneratingReply: false,
  isSending: false,
  history: [],
  isLoadingHistory: false,
  integrationStatus: null,
  aiSummaries: {},
  aiDrafts: {},
  aiActionItems: {},
  aiClassifications: {},
  dailyDigest: null,
  isGeneratingDigest: false,
  error: null,

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchThreads({ q: searchQuery, filter: get().activeFilter });
  },

  setActiveFilter: (activeFilter) => {
    set({ activeFilter, activeThreadId: null, activeThread: null });
    get().fetchThreads({ q: get().searchQuery, filter: activeFilter });
  },

  setActiveThreadId: (id) => {
    set({ activeThreadId: id });
    if (id) {
      get().fetchThreadDetail(id);
    } else {
      set({ activeThread: null });
    }
  },

  fetchThreads: async (options = {}) => {
    set({ isLoadingThreads: true, error: null });
    try {
      const q = options.q !== undefined ? options.q : get().searchQuery;
      const filter = options.filter !== undefined ? options.filter : get().activeFilter;
      const res = await emailApi.listThreads({ q, filter });
      set({ threads: res.data.threads || [], isLoadingThreads: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error?.message || 'Failed to load mailbox threads',
        isLoadingThreads: false
      });
    }
  },

  fetchThreadDetail: async (id: string) => {
    set({ isLoadingThreadDetail: true, error: null });
    try {
      const res = await emailApi.getThread(id);
      const thread = res.data.thread;
      set({ activeThread: thread, isLoadingThreadDetail: false });

      // Automatically classify thread in background if not already classified
      if (!get().aiClassifications[id]) {
        get().classifyThread(id);
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.error?.message || 'Failed to load thread details',
        isLoadingThreadDetail: false
      });
    }
  },

  updateThreadAction: async (id, action) => {
    try {
      const { threads, activeThread, activeFilter } = get();

      // Optimistic update with folder filtering
      let updatedThreads = threads.map((t) => {
        if (t.id !== id) return t;
        const copy = { ...t };
        if (action === 'mark_read') copy.isUnread = false;
        if (action === 'mark_unread') copy.isUnread = true;
        if (action === 'star') copy.isStarred = true;
        if (action === 'unstar') copy.isStarred = false;
        return copy;
      });

      // Filter out items that no longer match the active folder
      if (activeFilter === 'starred' && action === 'unstar') {
        updatedThreads = updatedThreads.filter((t) => t.id !== id);
      } else if (activeFilter === 'unread' && action === 'mark_read') {
        updatedThreads = updatedThreads.filter((t) => t.id !== id);
      } else if (activeFilter === 'inbox' && (action === 'archive' || action === 'delete')) {
        updatedThreads = updatedThreads.filter((t) => t.id !== id);
      } else if (action === 'delete') {
        updatedThreads = updatedThreads.filter((t) => t.id !== id);
      }

      let updatedActive = activeThread;
      if (activeThread && activeThread.id === id) {
        if (action === 'delete' || (activeFilter === 'inbox' && action === 'archive')) {
          // If viewing thread in inbox and it's archived, keep thread view or deselect if deleted
          if (action === 'delete') {
            updatedActive = null;
          }
        } else {
          updatedActive = { ...activeThread };
          if (action === 'mark_read') updatedActive.isUnread = false;
          if (action === 'mark_unread') updatedActive.isUnread = true;
          if (action === 'star') updatedActive.isStarred = true;
          if (action === 'unstar') updatedActive.isStarred = false;
        }
      }

      set({
        threads: updatedThreads,
        activeThread: updatedActive,
        activeThreadId: updatedActive ? updatedActive.id : null
      });

      await emailApi.updateThread(id, action);
    } catch (err: any) {
      console.error('Failed to update thread action:', err);
      get().fetchThreads();
    }
  },

  deleteThread: async (id) => {
    try {
      set((state) => ({
        threads: state.threads.filter((t) => t.id !== id),
        activeThread: state.activeThread?.id === id ? null : state.activeThread,
        activeThreadId: state.activeThreadId === id ? null : state.activeThreadId
      }));
      await emailApi.deleteThread(id);
    } catch (err: any) {
      console.error('Failed to delete thread:', err);
      get().fetchThreads();
    }
  },


  summarizeThread: async (threadId) => {
    set({ isSummarizing: true });
    try {
      const res = await aiApi.summarize(threadId);
      const data = res.data;
      set((state) => ({
        aiSummaries: {
          ...state.aiSummaries,
          [threadId]: {
            summary: data.summary,
            aiProvider: data.aiProvider,
            durationMs: data.durationMs,
            tokenEstimate: data.tokenEstimate
          }
        },
        isSummarizing: false
      }));
      // refresh activity history
      get().fetchHistory();
    } catch (err: any) {
      set({ isSummarizing: false });
      console.error('Summarize error:', err);
    }
  },

  generateReplyDraft: async (threadId, tone = 'Professional', instruction = '') => {
    set({ isGeneratingReply: true });
    try {
      const res = await aiApi.generateReply({ threadId, tone, instruction });
      const data = res.data;
      set((state) => ({
        aiDrafts: {
          ...state.aiDrafts,
          [threadId]: {
            draftId: data.draftId,
            draft: data.draft,
            tone: data.tone,
            aiProvider: data.aiProvider,
            durationMs: data.durationMs,
            threadSubject: data.threadSubject,
            recipient: data.recipient
          }
        },
        isGeneratingReply: false
      }));
      get().fetchHistory();
    } catch (err: any) {
      set({ isGeneratingReply: false });
      console.error('Generate reply error:', err);
    }
  },

  extractActions: async (threadId) => {
    try {
      const res = await aiApi.extractActions(threadId);
      set((state) => ({
        aiActionItems: {
          ...state.aiActionItems,
          [threadId]: res.data.items || []
        }
      }));
    } catch (err) {
      console.error('Extract actions error:', err);
    }
  },

  classifyThread: async (threadId) => {
    try {
      const res = await aiApi.classify(threadId);
      set((state) => ({
        aiClassifications: {
          ...state.aiClassifications,
          [threadId]: {
            priority: res.data.priority,
            category: res.data.category,
            reasoning: res.data.reasoning
          }
        }
      }));
    } catch (err) {
      console.error('Classify thread error:', err);
    }
  },

  generateDailyDigest: async () => {
    set({ isGeneratingDigest: true });
    try {
      const res = await aiApi.getDailyDigest();
      set({ dailyDigest: res.data, isGeneratingDigest: false });
    } catch (err) {
      set({ isGeneratingDigest: false });
      console.error('Daily digest error:', err);
    }
  },

  sendEmail: async (data) => {
    set({ isSending: true });
    try {
      await emailApi.sendEmail(data);
      set({ isSending: false });
      // Refresh current thread or list
      if (data.threadId) {
        get().fetchThreadDetail(data.threadId);
      }
      get().fetchThreads();
      get().fetchHistory();
      return true;
    } catch (err: any) {
      set({ isSending: false });
      console.error('Send email error:', err);
      return false;
    }
  },

  fetchHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const res = await aiApi.getHistory(50);
      set({ history: res.data.history || [], isLoadingHistory: false });
    } catch (err) {
      set({ isLoadingHistory: false });
    }
  },

  fetchIntegrationStatus: async () => {
    try {
      const res = await integrationApi.getStatus();
      set({ integrationStatus: res.data });
    } catch (err) {
      console.error('Fetch integration status error:', err);
    }
  },

  connectDemoGmail: async () => {
    try {
      await integrationApi.connectDemo();
      await get().fetchIntegrationStatus();
      await get().fetchThreads();
    } catch (err) {
      console.error('Connect demo error:', err);
    }
  },

  disconnectGmail: async () => {
    try {
      await integrationApi.disconnect();
      await get().fetchIntegrationStatus();
      set({ threads: [], activeThread: null, activeThreadId: null });
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }
}));
