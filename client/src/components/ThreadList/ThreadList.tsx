import React from 'react';
import {
  Star,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Search,
  AlertCircle,
  RefreshCw,
  Inbox,
  Send,
  Bookmark
} from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import { EmailThread } from '../../types';

interface ThreadListProps {
  onSelectThread: (threadId: string) => void;
  selectedThreadId: string | null;
}

const FILTER_TABS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'unread', label: 'Unread', icon: Mail },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'trash', label: 'Trash', icon: Trash2 }
];

export const ThreadList: React.FC<ThreadListProps> = ({ onSelectThread, selectedThreadId }) => {
  const {
    threads,
    isLoadingThreads,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    updateThreadAction,
    deleteThread,
    fetchThreads,
    integrationStatus
  } = useEmailStore();

  const handleStarToggle = (e: React.MouseEvent, thread: EmailThread) => {
    e.stopPropagation();
    updateThreadAction(thread.id, thread.isStarred ? 'unstar' : 'star');
  };

  const handleReadToggle = (e: React.MouseEvent, thread: EmailThread) => {
    e.stopPropagation();
    updateThreadAction(thread.id, thread.isUnread ? 'mark_read' : 'mark_unread');
  };

  const handleArchive = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    updateThreadAction(threadId, 'archive');
  };

  const handleDelete = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    deleteThread(threadId);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getEmptyStateMessage = () => {
    switch (activeFilter) {
      case 'starred':
        return {
          title: 'No Starred Emails',
          desc: 'Click the star icon on any email to access it quickly in this folder.'
        };
      case 'unread':
        return {
          title: 'All Caught Up',
          desc: 'You have no unread messages in your mailbox.'
        };
      case 'archive':
        return {
          title: 'Archive is Empty',
          desc: 'Archived messages will appear here when moved out of your inbox.'
        };
      case 'trash':
        return {
          title: 'Trash is Empty',
          desc: 'Deleted messages will appear here.'
        };
      case 'sent':
        return {
          title: 'No Sent Emails',
          desc: 'Emails you compose and send will be listed here.'
        };
      case 'important':
        return {
          title: 'No Important Emails',
          desc: 'High-priority messages will appear here.'
        };
      default:
        return {
          title: 'Inbox is Empty',
          desc: 'No emails found matching your current query.'
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0d121c] border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Search Header */}
      <div className="p-3.5 border-b border-slate-200/90 dark:border-slate-800/90 space-y-3 bg-white/70 dark:bg-[#0d121c]/70 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails, senders, keywords..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Quick Folder Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100/90 dark:bg-slate-850/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-750'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Folder Subheader */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span className="capitalize font-bold text-slate-800 dark:text-slate-200">{activeFilter}</span>
        <span>{threads.length} {threads.length === 1 ? 'thread' : 'threads'}</span>
      </div>

      {/* Gmail Not Connected Warning */}
      {integrationStatus && !integrationStatus.isConnected && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Connect Gmail to sync messages.</span>
          </div>
          <button
            onClick={() => useEmailStore.getState().connectDemoGmail()}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shrink-0 shadow-sm"
          >
            Connect Demo
          </button>
        </div>
      )}

      {/* Thread List Feed */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
        {isLoadingThreads ? (
          /* Skeleton Loaders */
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-800/60 animate-pulse space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-750 rounded w-28"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-750 rounded w-12"></div>
                </div>
                <div className="h-3.5 bg-slate-200/80 dark:bg-slate-750/80 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200/60 dark:bg-slate-750/50 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400 shadow-sm">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{emptyState.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {emptyState.desc}
            </p>
            <button
              onClick={() => fetchThreads()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-750 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        ) : (
          threads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`p-4 cursor-pointer transition-colors duration-100 relative group ${
                  isSelected
                    ? 'bg-brand-50/80 dark:bg-slate-800/90 border-l-4 border-l-brand-600 dark:border-l-brand-400 shadow-sm'
                    : thread.isUnread
                    ? 'bg-white dark:bg-[#0d121c] hover:bg-slate-50 dark:hover:bg-slate-850/60'
                    : 'bg-slate-50/40 dark:bg-transparent hover:bg-slate-100/70 dark:hover:bg-slate-850/40'
                }`}
              >
                {/* Header Row: Sender, Unread Dot & Date */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {thread.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0 shadow-sm" />
                    )}
                    <span
                      className={`text-sm truncate ${
                        thread.isUnread
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {thread.sender.replace(/<.*?>/, '').trim() || thread.sender}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                    {formatDate(thread.date)}
                  </span>
                </div>

                {/* Subject */}
                <h4
                  className={`text-sm mb-1.5 line-clamp-1 leading-snug ${
                    thread.isUnread
                      ? 'font-semibold text-slate-900 dark:text-slate-100'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {thread.subject}
                </h4>

                {/* Snippet */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {thread.snippet}
                </p>

                {/* Quick Action Hover Bar */}
                <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleStarToggle(e, thread)}
                      title={thread.isStarred ? 'Unstar' : 'Star'}
                      className={`p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors ${
                        thread.isStarred ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${thread.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => handleReadToggle(e, thread)}
                      title={thread.isUnread ? 'Mark as Read' : 'Mark as Unread'}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {thread.isUnread ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleArchive(e, thread.id)}
                      title={activeFilter === 'archive' ? 'Move to Inbox' : 'Archive'}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, thread.id)}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
