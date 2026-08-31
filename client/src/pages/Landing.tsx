import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Check,
  FileText,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'Professional' | 'Friendly' | 'Concise'>('Professional');

  const draftPreviews: Record<string, string> = {
    Professional: "Hi Sarah,\n\nI have reviewed Section 3 of the roadmap and our engineering team is fully aligned with the timeline. We will have the AI rollout finalized before Friday at 4:00 PM EST.\n\nBest regards,\nAlex",
    Friendly: "Hi Sarah,\n\nThanks so much for sending over the update! Section 3 looks great on our end—we're on track to wrap up the rollout ahead of Friday at 4 PM.\n\nCheers,\nAlex",
    Concise: "Sarah,\n\nReviewed Section 3. Team is aligned. Rollout confirmed before Friday 4:00 PM EST.\n\n— Alex"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-500/20 selection:text-brand-600 font-sans">
      {/* Top Navigation */}
      <header className="max-w-6xl w-full mx-auto px-6 h-16 flex items-center justify-between border-b border-slate-200/90 dark:border-slate-800/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shadow-sm">
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">MailPilot</span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn-primary flex items-center gap-1.5 text-xs font-semibold"
            >
              <span>Open Mailbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-ghost text-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary flex items-center gap-1.5 text-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-16 pb-20 space-y-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
            <span>Private Gmail intelligence layer • AES-256 encrypted</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Email, refined by quiet intelligence.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant 3-sentence thread summaries, tone-calibrated draft replies, and human-in-the-loop dispatch. Connected directly to your Gmail via secure OAuth.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="btn-primary px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-glow"
            >
              <span>Start Free with MailPilot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary px-5 py-3 text-sm font-semibold"
            >
              Sign In to Demo
            </Link>
          </div>
        </div>

        {/* Minimalist Product Preview */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card dark:shadow-card-dark overflow-hidden">
          {/* Mockup Window Header */}
          <div className="px-4 py-3 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
              <span className="ml-2 text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">mailpilot.app/inbox</span>
            </div>
            <div className="text-[11px] font-mono font-semibold text-brand-700 dark:text-brand-300 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
              OAuth Active
            </div>
          </div>

          {/* Mockup Content Grid */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/90 dark:divide-slate-800">
            {/* Thread & Summary Column */}
            <div className="p-6 space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Thread & Synthesis</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Sarah Jenkins</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">10:42 AM</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Q3 Product Roadmap Review</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 font-sans">
                  "Hi Alex, attaching the updated roadmap. Can we confirm the AI feature rollout by Friday at 4 PM? Also need your thoughts on section 3..."
                </p>
              </div>

              {/* Minimal Summary Box */}
              <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-slate-950 border border-brand-200/70 dark:border-slate-800 space-y-1.5 shadow-subtle">
                <div className="flex items-center gap-1.5 text-brand-800 dark:text-brand-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3-Sentence Executive Summary</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  Sarah requested confirmation on Q3 AI deliverables by Friday at 4:00 PM EST and specifically asked for review on section 3 timeline milestones.
                </p>
              </div>
            </div>

            {/* Generated Tone Draft Column */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  Tone-Aware Reply
                </div>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {(['Professional', 'Friendly', 'Concise'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setActiveTab(tone)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        activeTab === tone
                          ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-line leading-relaxed min-h-[140px] shadow-subtle">
                {draftPreviews[activeTab]}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Human review required before sending
                </span>
                <span className="text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-brand-200/80 dark:border-slate-700 shadow-sm">
                  Ready to Dispatch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="pt-10 border-t border-slate-200/90 dark:border-slate-800">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-card dark:shadow-card-dark">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Deterministic AI Pipeline</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Cleans reply artifacts and signature noise. Utilizes high-precision summarization with structured JSON outputs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-card dark:shadow-card-dark">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Zero Password Storage</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Authenticates directly via Google OAuth 2.0 with minimal scopes. All refresh tokens are encrypted using AES-256-GCM.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-card dark:shadow-card-dark">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Auditable & Traceable</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Complete audit trails for every summarized thread, generated draft, and dispatched message with exact latency telemetry.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-8 border-t border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div>© 2026 MailPilot. Focused inbox productivity.</div>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
};
