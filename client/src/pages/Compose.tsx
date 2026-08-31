import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Wand2, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useEmailStore } from '../store/emailStore';

const TEMPLATES = [
  {
    name: 'Follow-up',
    subject: 'Following up on our recent conversation',
    prompt: 'Write a polite follow-up checking in on the status of our proposal sent last week.'
  },
  {
    name: 'Meeting Request',
    subject: 'Request for brief alignment sync',
    prompt: 'Request a 20-minute Zoom call this Thursday or Friday to discuss next milestones.'
  },
  {
    name: 'Status Update',
    subject: 'Project Status Update & Milestone Delivery',
    prompt: 'Provide a brief bulleted update stating that the frontend and backend integration is complete.'
  }
];

export const Compose: React.FC = () => {
  const navigate = useNavigate();
  const { sendEmail, isSending } = useEmailStore();

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyTemplate = (tpl: { subject: string; prompt: string }) => {
    setSubject(tpl.subject);
    setAiPrompt(tpl.prompt);
  };

  const handleAiDraft = () => {
    if (!aiPrompt) return;
    setIsDrafting(true);
    setTimeout(() => {
      const generated = `Hi there,\n\n${aiPrompt}\n\nPlease let me know if you have any questions or require additional details.\n\nBest regards,\nAlex`;
      setBody(generated);
      setIsDrafting(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!to || !subject || !body) {
      setErrorMsg('Please complete recipient, subject, and message body.');
      return;
    }

    const ok = await sendEmail({ to, subject, body });
    if (ok) {
      setSentSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setErrorMsg('Failed to send email. Please verify connection and recipient email.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-subtle"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Message</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Dispatched directly via your authenticated Gmail connection</p>
          </div>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in shadow-sm">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Email successfully sent. Returning to mailbox...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-sm shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* AI Prompt Assistant Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-card dark:shadow-card-dark">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>AI Prompt Assistant</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(t)}
                className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-brand-700 dark:text-brand-300 text-xs font-medium border border-brand-200/70 dark:border-slate-700 transition-colors shrink-0"
              >
                + {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Direct the draft: 'Politely ask for contract review before Monday'..."
            className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20"
          />
          <button
            type="button"
            onClick={handleAiDraft}
            disabled={isDrafting || !aiPrompt}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-sm active:scale-95"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isDrafting ? 'Drafting...' : 'Auto-Draft'}</span>
          </button>
        </div>
      </div>

      {/* Main Compose Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-card dark:shadow-card-dark">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">Recipient</label>
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="sarah@example.com"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 transition-all font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Discussion regarding roadmap milestone"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 transition-all font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">Body</label>
          <textarea
            required
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email here or draft using the assistant above..."
            className="w-full p-4 text-sm font-sans leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 transition-all resize-y select-text"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Sends via OAuth token without storing passwords.</span>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-sm hover:shadow-glow"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
