import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import { useEmailStore } from '../store/emailStore';
import { integrationApi } from '../services/api';

export const Integrations: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    integrationStatus,
    fetchIntegrationStatus,
    connectDemoGmail,
    disconnectGmail
  } = useEmailStore();

  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchIntegrationStatus();

    const status = searchParams.get('status');
    const error = searchParams.get('error');
    const demo = searchParams.get('demo_connect');

    if (status === 'connected') {
      setStatusMsg({ text: 'Gmail successfully connected via OAuth.', type: 'success' });
    } else if (error) {
      setStatusMsg({ text: `OAuth error: ${error}`, type: 'error' });
    } else if (demo) {
      connectDemoGmail();
      setStatusMsg({ text: 'Demo Mailbox connected successfully.', type: 'success' });
    }
  }, [searchParams, fetchIntegrationStatus, connectDemoGmail]);

  const handleStartOAuth = async () => {
    setIsLoadingOAuth(true);
    try {
      const res = await integrationApi.startOAuth();
      if (res.data.mode === 'google_oauth' && res.data.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        await connectDemoGmail();
        setStatusMsg({
          text: 'Demo Gmail simulation connected. (Configure GOOGLE_CLIENT_ID in server/.env for live Google OAuth)',
          type: 'success'
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.error?.message || 'Failed to start OAuth flow',
        type: 'error'
      });
    } finally {
      setIsLoadingOAuth(false);
    }
  };

  const isConnected = integrationStatus?.isConnected;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Accounts & Integrations</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your connected Gmail account, OAuth permissions, and cryptographic token policies.
        </p>
      </div>

      {/* Status Alert Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 animate-in fade-in shadow-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="font-mono text-sm text-slate-400 hover:text-slate-700 dark:hover:text-white px-2">✕</button>
        </div>
      )}

      {/* Gmail OAuth Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-6 shadow-card dark:shadow-card-dark">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-slate-800 border border-brand-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Google Workspace / Gmail</h3>
                {isConnected ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-mono bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
                    Connected
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-mono bg-amber-50 dark:bg-slate-850 border border-amber-200 dark:border-slate-750 text-amber-700 dark:text-amber-400 font-semibold shadow-sm">
                    Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Direct OAuth 2.0 connection to retrieve mailbox threads, update labels, and dispatch email
              </p>
            </div>
          </div>

          <div>
            {isConnected ? (
              <button
                onClick={() => disconnectGmail()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors shadow-subtle"
              >
                <Trash2 className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleStartOAuth}
                disabled={isLoadingOAuth}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-sm hover:shadow-glow"
              >
                {isLoadingOAuth ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                <span>Connect Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Details & Scopes */}
        {isConnected && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-mono uppercase mb-1 font-semibold">Connected Identity</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 text-sm font-bold">
                  {integrationStatus?.email || 'demo.user@mailpilot.ai'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-mono uppercase mb-1 font-semibold">Security Cipher</span>
                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  AES-256-GCM Encrypted at Rest
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-xs font-mono uppercase mb-2 font-semibold">Granted OAuth Scopes</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'https://www.googleapis.com/auth/gmail.readonly',
                  'https://www.googleapis.com/auth/gmail.send',
                  'https://www.googleapis.com/auth/gmail.modify'
                ].map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs shadow-subtle">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Architecture Callout */}
        <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-slate-900/40 border border-brand-200/70 dark:border-slate-800 text-xs space-y-1.5 shadow-subtle">
          <div className="flex items-center gap-2 text-brand-800 dark:text-brand-300 font-bold text-xs">
            <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Zero Password Storage Architecture</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            MailPilot authenticates exclusively via Google OAuth 2.0 with short-lived tokens. Your Google passwords and personal account credentials are never transmitted or stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};
