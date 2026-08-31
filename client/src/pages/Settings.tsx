import React, { useEffect, useState } from 'react';
import { User, Cpu, ShieldCheck, RefreshCw, CheckCircle2, Sun, Moon, Laptop, Palette } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { aiApi } from '../services/api';
import { useThemeStore, Theme } from '../store/themeStore';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [aiHealth, setAiHealth] = useState<{
    geminiKeyConfigured: boolean;
    primaryProvider: string;
    status: string;
  } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await aiApi.getHealth();
      setAiHealth(res.data);
    } catch (err) {
      console.error('Failed to fetch AI health:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const themeOptions: Array<{ id: Theme; title: string; desc: string; icon: React.ReactNode; previewBg: string; previewCard: string }> = [
    {
      id: 'light',
      title: 'Light Tonal',
      desc: 'Warm neutral slate with crisp white cards and indigo accents',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      previewBg: 'bg-slate-100 border-slate-300',
      previewCard: 'bg-white border-slate-200 text-slate-800'
    },
    {
      id: 'dark',
      title: 'Deep Obsidian',
      desc: 'Luxurious dark slate navy with soft glowing contrast',
      icon: <Moon className="w-5 h-5 text-brand-400" />,
      previewBg: 'bg-[#0b0f17] border-slate-800',
      previewCard: 'bg-slate-850 border-slate-700 text-slate-200'
    },
    {
      id: 'system',
      title: 'System Preference',
      desc: 'Automatically synchronizes with your device operating system setting',
      icon: <Laptop className="w-5 h-5 text-slate-500 dark:text-slate-400" />,
      previewBg: 'bg-gradient-to-r from-slate-100 to-slate-900 border-slate-400',
      previewCard: 'bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Settings & Security</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Inspect workspace identity, appearance themes, AI pipeline health, and security configurations.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance & Theme Chooser Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-5 shadow-card dark:shadow-card-dark">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Appearance & Theme</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light tonal aesthetic and deep dark mode</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-1">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                      : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      {opt.icon}
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{opt.title}</span>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-600 dark:bg-brand-400 ring-4 ring-brand-500/20"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{opt.desc}</p>

                  {/* Micro Visual Card Mockup */}
                  <div className={`w-full h-12 rounded-xl border p-2 flex items-center gap-2 ${opt.previewBg}`}>
                    <div className={`h-full flex-1 rounded-lg border p-1.5 flex items-center justify-between shadow-subtle ${opt.previewCard}`}>
                      <div className="w-12 h-2 rounded bg-slate-300 dark:bg-slate-600"></div>
                      <div className="w-4 h-2 rounded bg-brand-500"></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-card dark:shadow-card-dark">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">User Identity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated account profile</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 dark:text-slate-400 block text-xs font-mono uppercase font-semibold">Full Name</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{user?.name || 'Alex Vance'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 dark:text-slate-400 block text-xs font-mono uppercase font-semibold">Email Address</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 text-sm">{user?.email || 'alex@company.com'}</span>
            </div>
          </div>
        </div>

        {/* AI Health Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Engine Health</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Model pipeline and fallback status</p>
              </div>
            </div>

            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-xs">Primary Provider:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100 text-sm font-bold">
                {aiHealth?.geminiKeyConfigured ? 'Google Gemini 1.5 Flash' : 'Deterministic Template Engine'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-xs">API Key Status:</span>
              <span className="px-2.5 py-0.5 rounded-full font-mono text-xs bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-semibold">
                {aiHealth?.geminiKeyConfigured ? 'Configured & Active' : 'Offline (Template Fallback)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-xs">Pipeline Status:</span>
              <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Security & Cryptography Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-card dark:shadow-card-dark">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Security Policies</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographic protection standards</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-700 dark:text-slate-300 font-mono">
            <div>• Password Hashing: bcrypt (Cost Factor 12)</div>
            <div>• Token Storage: AES-256-GCM authenticated encryption at rest</div>
            <div>• Session Lifespan: JSON Web Tokens (7-day duration)</div>
            <div>• Color Theme Engine: Dynamic Dual Theme (Tonal Light & Deep Slate Dark)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
