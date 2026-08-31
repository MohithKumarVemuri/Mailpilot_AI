import React from 'react';
import {
  Star,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Clock,
  User,
  Copy,
  Check,
  Layers,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import { ReplyPanel } from '../ReplyPanel/ReplyPanel';
import { EmailThread } from '../../types';

interface ThreadViewProps {
  thread: EmailThread;
  onBack?: () => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({ thread, onBack }) => {
  const {
    summarizeThread,
    aiSummaries,
    isSummarizing,
    updateThreadAction,
    deleteThread,
    aiClassifications,
    activeFilter
  } = useEmailStore();

  const [copiedSummary, setCopiedSummary] = React.useState(false);

  const summaryData = aiSummaries[thread.id];
  const classification = aiClassifications[thread.id];

  const handleCopySummary = () => {
    if (!summaryData?.summary) return;
    navigator.clipboard.writeText(summaryData.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const messages = thread.messages && thread.messages.length > 0 ? thread.messages : [
    {
      id: `msg-${thread.id}`,
      threadId: thread.id,
      from: thread.sender,
      to: 'me@mailpilot.ai',
      subject: thread.subject,
      date: thread.date,
      body: thread.snippet,
      labels: thread.labels
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0b0f17] overflow-hidden select-none">
      {/* Thread Header Toolbar */}
      <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0d121c]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-subtle">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">{thread.subject}</h2>
              {classification && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold shadow-sm">
                  {classification.priority} Priority • {classification.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <span>From: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{thread.sender}</strong></span>
              <span>•</span>
              <span>{messages.length} message{messages.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Summarize AI Trigger */}
          <button
            onClick={() => summarizeThread(thread.id)}
            disabled={isSummarizing}
            className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-brand-300 border border-brand-200 dark:border-slate-750 font-semibold text-xs disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            {isSummarizing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-brand-600 dark:border-brand-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>AI Summary</span>
              </>
            )}
          </button>

          <button
            onClick={() => updateThreadAction(thread.id, thread.isStarred ? 'unstar' : 'star')}
            title={thread.isStarred ? 'Unstar' : 'Star'}
            className={`p-2 rounded-xl border transition-colors shadow-subtle ${
              thread.isStarred
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500 border-amber-200 dark:border-amber-800/40'
                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-4 h-4 ${thread.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>

          <button
            onClick={() => updateThreadAction(thread.id, thread.isUnread ? 'mark_read' : 'mark_unread')}
            title={thread.isUnread ? 'Mark as Read' : 'Mark as Unread'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-subtle"
          >
            {thread.isUnread ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </button>

          <button
            onClick={() => updateThreadAction(thread.id, activeFilter === 'archive' ? 'unarchive' : 'archive')}
            title={activeFilter === 'archive' ? 'Move back to Inbox' : 'Archive Thread'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-subtle"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (activeFilter === 'trash') {
                updateThreadAction(thread.id, 'restore');
              } else {
                deleteThread(thread.id);
              }
            }}
            title={activeFilter === 'trash' ? 'Restore to Inbox' : 'Delete Thread'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors shadow-subtle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
        {/* AI Summary Card */}
        {summaryData && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50/80 via-white to-indigo-50/40 dark:from-slate-900 dark:to-brand-950/20 border border-brand-200/80 dark:border-slate-750 shadow-card dark:shadow-card-dark animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-brand-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Executive Summary</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100/80 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-mono font-medium">
                  {summaryData.aiProvider === 'gemini' ? 'Gemini 1.5' : 'Synthesizer'}
                </span>
              </div>
              <button
                onClick={handleCopySummary}
                className="text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans">
              {summaryData.summary}
            </div>
          </div>
        )}

        {/* Message Chain Cards */}
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-card dark:shadow-card-dark"
            >
              {/* Message Header */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                    {msg.from ? msg.from.slice(0, 1).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{msg.from}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">To: {msg.to}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text">
                {msg.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Panel Container */}
      <ReplyPanel
        threadId={thread.id}
        recipient={thread.sender}
        subject={thread.subject}
      />
    </div>
  );
};
