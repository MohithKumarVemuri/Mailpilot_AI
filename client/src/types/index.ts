export type Tone = 'Professional' | 'Friendly' | 'Formal' | 'Concise';

export type AIProvider = 'gemini' | 'fallback';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet?: string;
  body: string;
  labels?: string[];
}

export interface EmailThread {
  id: string;
  historyId?: string;
  subject: string;
  sender: string;
  date: string;
  snippet: string;
  isUnread: boolean;
  isStarred: boolean;
  labels: string[];
  messages?: EmailMessage[];
  priority?: 'High' | 'Medium' | 'Low';
  category?: string;
}

export interface EmailAction {
  _id?: string;
  id?: string;
  owner: string;
  gmailThreadId: string;
  actionType: 'summarize' | 'generate_reply' | 'send' | 'classify' | 'extract_actions' | 'daily_digest';
  aiProvider: AIProvider;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'RETRIED';
  inputLength: number;
  output?: any;
  error?: string;
  durationMs: number;
  retryCount: number;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface ReplyDraft {
  draftId?: string;
  draft: string;
  tone: Tone;
  aiProvider: AIProvider;
  durationMs?: number;
  threadSubject?: string;
  recipient?: string;
}

export interface ActionItem {
  task: string;
  dueDate: string;
  owner: string;
}

export interface IntegrationStatus {
  provider: string;
  isConnected: boolean;
  email: string | null;
  displayName?: string;
  scopes: string[];
  expiresAt?: string;
  isDemo?: boolean;
}

export interface DailyDigest {
  title: string;
  totalAnalyzed: number;
  highPriorityCount: number;
  actionItemsPending: number;
  overview: string;
  highlights: Array<{
    subject: string;
    sender: string;
    status: string;
    quickTake: string;
  }>;
}
