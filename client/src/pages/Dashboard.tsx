import React, { useEffect } from 'react';
import {
  Mail,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  Sparkles
} from 'lucide-react';
import { useEmailStore } from '../store/emailStore';
import { ThreadList } from '../components/ThreadList/ThreadList';
import { ThreadView } from '../components/ThreadView/ThreadView';

export const Dashboard: React.FC = () => {
  const {
    activeThreadId,
    setActiveThreadId,
    activeThread,
    fetchThreads,
    fetchHistory,
    history,
    isLoadingHistory,
    threads
  } = useEmailStore();

  useEffect(() => {
    if (threads.length === 0) {
      fetchThreads();
    }
    fetchHistory();
  }, []);

  const unreadCount = threads.filter((t) => t.isUnread).length;
  const highPriorityCount = threads.filter((t) => t.isStarred || t.isUnread).length;

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-[#0b0f17]">
      {/* Left Column: Thread List Feed */}
      <div
        className={`w-full md:w-[420px] lg:w-[460px] shrink-0 h-full flex flex-col ${
          activeThreadId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ThreadList
          onSelectThread={(id) => setActiveThreadId(id)}
          selectedThreadId={activeThreadId}
        />
      </div>

      {/* Right Column: Active Thread View or Minimal Empty State */}
      <div
        className={`flex-1 h-full flex flex-col bg-slate-50 dark:bg-[#0b0f17] min-w-0 ${
          activeThreadId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeThread ? (
          <ThreadView
            thread={activeThread}
            onBack={() => setActiveThreadId(null)}
          />
        ) : (
          /* Empty Placeholder with Metrics & Activity */
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex flex-col items-center justify-center text-center space-y-8 select-none">
            <div className="max-w-md space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-slate-850 border border-brand-200/80 dark:border-slate-750 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-400 shadow-sm">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a Conversation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose an email from your feed to review the thread, trigger 3-sentence AI summaries, or dispatch calibrated tone drafts.
              </p>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-left space-y-1 shadow-card dark:shadow-card-dark">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Total In Folder</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{threads.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-left space-y-1 shadow-card dark:shadow-card-dark">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Unread</span>
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{unreadCount}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-left space-y-1 shadow-card dark:shadow-card-dark">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">High Priority</span>
                <div className="text-2xl font-bold text-amber-500">{highPriorityCount}</div>
              </div>
            </div>

            {/* AI Audit Stream */}
            <div className="w-full max-w-lg text-left space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Activity Trail</span>
                </div>
                <span className="text-xs font-mono">{history.length} logged events</span>
              </div>

              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto shadow-card dark:shadow-card-dark">
                {isLoadingHistory ? (
                  <div className="p-4 text-center text-sm text-slate-400">Loading trail...</div>
                ) : history.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    No actions recorded yet. Summarize an email or generate an AI draft to track logs.
                  </div>
                ) : (
                  history.slice(0, 5).map((act, i) => (
                    <div key={act._id || act.id || i} className="p-3.5 text-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {act.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <div className="truncate">
                          <span className="font-bold text-slate-800 dark:text-slate-200 capitalize mr-2">
                            {act.actionType.replace('_', ' ')}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-xs truncate font-mono">
                            #{act.gmailThreadId.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {act.aiProvider}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">{act.durationMs}ms</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
