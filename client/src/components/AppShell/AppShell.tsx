import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Inbox,
  Star,
  Send,
  Archive,
  Trash2,
  Cpu,
  Link2,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEmailStore } from '../../store/emailStore';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    threads,
    activeFilter,
    setActiveFilter,
    integrationStatus,
    fetchIntegrationStatus,
    generateDailyDigest,
    dailyDigest,
    isGeneratingDigest
  } = useEmailStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDigestModal, setShowDigestModal] = useState(false);

  useEffect(() => {
    fetchIntegrationStatus();
  }, [fetchIntegrationStatus]);

  const unreadCount = threads.filter((t) => t.isUnread).length;
  const starredCount = threads.filter((t) => t.isStarred).length;

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setMobileMenuOpen(false);
    navigate('/dashboard');
  };

  const handleOpenDigest = async () => {
    setShowDigestModal(true);
    if (!dailyDigest) {
      await generateDailyDigest();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0d121c] backdrop-blur-md shrink-0 select-none">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200/80 dark:border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">MailPilot</span>
          </Link>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-brand-100/70 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
            v1.0
          </span>
        </div>

        {/* Compose Button */}
        <div className="p-3.5">
          <Link
            to="/compose"
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="font-semibold">Compose Message</span>
          </Link>
        </div>

        {/* Navigation Folders */}
        <div className="flex-1 px-3 py-1 space-y-6 overflow-y-auto">
          <div>
            <div className="px-2.5 mb-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
              Folders
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleFilterClick('inbox')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === 'inbox'
                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold border border-brand-200/70 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className={`w-4 h-4 ${activeFilter === 'inbox' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-brand-100 dark:bg-slate-700 text-brand-700 dark:text-brand-300 font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleFilterClick('starred')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === 'starred'
                    ? 'bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-white font-semibold border border-amber-200/80 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span>Starred</span>
                </div>
                {starredCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-100 dark:bg-slate-700 text-amber-800 dark:text-amber-300 font-semibold">
                    {starredCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleFilterClick('important')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === 'important'
                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold border border-brand-200/70 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Important</span>
                </div>
              </button>

              <button
                onClick={() => handleFilterClick('unread')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === 'unread'
                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold border border-brand-200/70 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Unread</span>
                </div>
              </button>

              <button
                onClick={() => handleFilterClick('sent')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === 'sent'
                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold border border-brand-200/70 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Send className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Sent</span>
              </button>

              <button
                onClick={() => handleFilterClick('archive')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === 'archive'
                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold border border-brand-200/70 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Archive className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Archive</span>
              </button>

              <button
                onClick={() => handleFilterClick('trash')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === 'trash'
                    ? 'bg-rose-50 dark:bg-slate-800 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200/70 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Trash2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Trash</span>
              </button>
            </nav>
          </div>

          {/* AI Tools & Workspace */}
          <div>
            <div className="px-2.5 mb-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
              Workspace
            </div>
            <nav className="space-y-1">
              <button
                onClick={handleOpenDigest}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Daily Digest</span>
                </div>
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 font-mono px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 border border-brand-200/60 dark:border-brand-800/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              </button>

              <NavLink
                to="/integrations"
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold border border-brand-200/70 dark:border-slate-700 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Link2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Gmail OAuth</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    integrationStatus?.isConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500 ring-2 ring-amber-500/20'
                  }`}
                ></span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold border border-brand-200/70 dark:border-slate-700 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Settings</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0b0f17]/50">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-750 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-brand-700 dark:text-brand-300 shrink-0">
                {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user?.email || 'user@mailpilot.ai'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#0b0f17]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-[#0d121c]/90 backdrop-blur-md px-4 md:px-7 flex items-center justify-between shrink-0 z-10 shadow-subtle">
          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-brand-50 dark:bg-slate-850 border border-brand-200 dark:border-slate-750 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">MailPilot</span>
            </div>
          </div>

          {/* Desktop Filter Indicator */}
          <div className="hidden md:flex items-center gap-2.5">
            <span className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-750 capitalize flex items-center gap-2 shadow-sm">
              <Inbox className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{activeFilter}</span>
            </span>
          </div>

          {/* Controls, Theme Switcher & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* AI Engine Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
              <span>Gemini Engine</span>
            </div>

            {/* Gmail Status */}
            <Link
              to="/integrations"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-subtle ${
                integrationStatus?.isConnected
                  ? 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-850 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200'
                  : 'bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
              }`}
            >
              {integrationStatus?.isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="hidden xs:inline">Gmail</span> Connected
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Connect Gmail</span>
                </>
              )}
            </Link>

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-100">
            <div className="w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-brand-600" />
                    <span className="font-bold text-base">MailPilot</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <Link
                  to="/compose"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-primary py-2 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Compose</span>
                </Link>

                <div className="space-y-1 pt-2">
                  {(['inbox', 'starred', 'important', 'unread', 'sent', 'archive', 'trash'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterClick(filter)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        activeFilter === filter
                          ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={logout}
                  className="w-full py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0b0f17]">{children}</main>
      </div>

      {/* Daily Digest Modal */}
      {showDigestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-modal dark:shadow-modal-dark overflow-hidden">
            <div className="p-4 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Daily Intelligence Digest</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Synthesized inbox snapshot</p>
                </div>
              </div>
              <button
                onClick={() => setShowDigestModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {isGeneratingDigest ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Synthesizing inbox highlights and decisions...</p>
                </div>
              ) : dailyDigest ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 text-center shadow-subtle">
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{dailyDigest.totalAnalyzed}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Analyzed</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 text-center shadow-subtle">
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{dailyDigest.highPriorityCount}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">High Priority</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 text-center shadow-subtle">
                      <div className="text-xl font-bold text-brand-600 dark:text-brand-400">{dailyDigest.actionItemsPending}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Action Items</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-slate-950 border border-brand-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans shadow-subtle">
                    {dailyDigest.overview}
                  </div>

                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">
                      Key Highlights
                    </h4>
                    <div className="space-y-2">
                      {dailyDigest.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-subtle"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-slate-900 dark:text-zinc-200">{h.subject}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-zinc-300 font-mono font-medium">
                              {h.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">{h.quickTake}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-400 text-xs">
                  Click generate to assemble today's executive summary.
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60 flex justify-end">
              <button
                onClick={() => setShowDigestModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
