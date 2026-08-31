import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, Wand2, ShieldCheck, CheckSquare, Sparkles } from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import { Tone, ActionItem } from '../../types';

interface ReplyPanelProps {
  threadId: string;
  recipient: string;
  subject: string;
  onSent?: () => void;
}

const TONES: Array<{ id: Tone; label: string; desc: string }> = [
  { id: 'Professional', label: 'Professional', desc: 'Clear, polite, and business-ready' },
  { id: 'Friendly', label: 'Friendly', desc: 'Warm and approachable' },
  { id: 'Formal', label: 'Formal', desc: 'High formality for executives & partners' },
  { id: 'Concise', label: 'Concise', desc: 'Direct and brief' }
];

export const ReplyPanel: React.FC<ReplyPanelProps> = ({ threadId, recipient, subject, onSent }) => {
  const {
    generateReplyDraft,
    aiDrafts,
    isGeneratingReply,
    sendEmail,
    isSending,
    extractActions,
    aiActionItems
  } = useEmailStore();

  const [selectedTone, setSelectedTone] = useState<Tone>('Professional');
  const [instruction, setInstruction] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showActionItems, setShowActionItems] = useState(false);

  const existingDraft = aiDrafts[threadId];
  const actionItems: ActionItem[] = aiActionItems[threadId] || [];

  useEffect(() => {
    if (existingDraft && existingDraft.draft) {
      setDraftContent(existingDraft.draft);
    }
  }, [existingDraft]);

  const handleGenerate = async () => {
    await generateReplyDraft(threadId, selectedTone, instruction);
  };

  const handleCopy = () => {
    if (!draftContent) return;
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!draftContent.trim()) return;
    const ok = await sendEmail({
      to: recipient,
      subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
      body: draftContent,
      threadId
    });
    if (ok) {
      setDraftContent('');
      if (onSent) onSent();
    }
  };

  const handleExtractActions = async () => {
    setShowActionItems(true);
    await extractActions(threadId);
  };

  const handleQuickPolish = () => {
    if (!draftContent) return;
    const polished = draftContent
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
    setDraftContent(polished);
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0d121c]/95 backdrop-blur-md p-4 md:p-5 space-y-3.5 shrink-0 select-none shadow-card">
      {/* Top Bar: Tone Selector & Action Items Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mr-1 uppercase font-semibold">
            Tone:
          </span>
          {TONES.map((t) => {
            const isSelected = selectedTone === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTone(t.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-750'
                }`}
                title={t.desc}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleExtractActions}
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-750 px-3 py-1.5 rounded-xl flex items-center gap-2 transition-colors shadow-subtle"
        >
          <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Action Items</span>
        </button>
      </div>

      {/* Action Items Drawer */}
      {showActionItems && actionItems.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 animate-in fade-in duration-150 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Extracted Action Items ({actionItems.length})
            </span>
            <button
              onClick={() => setShowActionItems(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-mono"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {actionItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-subtle">
                <div className="font-bold text-slate-900 dark:text-slate-200 mb-1">{item.task}</div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>📅 {item.dueDate}</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">@{item.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruction Input & AI Draft Button */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Direct the reply: 'Confirm attendance', 'Request proposal update'..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 transition-all font-sans"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGeneratingReply}
          className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-brand-300 border border-brand-200 dark:border-slate-700 font-bold text-xs disabled:opacity-50 flex items-center gap-2 transition-all shrink-0 active:scale-95 shadow-sm"
        >
          {isGeneratingReply ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-brand-600 dark:border-brand-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Drafting...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Generate Draft</span>
            </>
          )}
        </button>
      </div>

      {/* Editable Reply Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Draft Message</span>
            {existingDraft && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-mono font-medium">
                {existingDraft.aiProvider === 'gemini' ? 'Gemini 1.5' : 'Synthesized'}
              </span>
            )}
          </span>
          <div className="flex items-center gap-3">
            {draftContent && (
              <>
                <button
                  onClick={handleQuickPolish}
                  className="hover:text-brand-600 dark:hover:text-white flex items-center gap-1.5 text-xs transition-colors font-medium"
                  title="Format spacing & structure"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Clean</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="hover:text-brand-600 dark:hover:text-white flex items-center gap-1.5 text-xs transition-colors font-medium"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          rows={4}
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Draft reply appears here for your review and edits..."
          className="w-full p-3.5 text-sm font-sans leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 focus:bg-white dark:focus:bg-slate-900 transition-all resize-y select-text"
        />

        {/* Footer: Safety Assurance & Send Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Human-in-the-loop: Dispatched only on your click.</span>
          </div>

          <button
            onClick={handleSend}
            disabled={isSending || !draftContent.trim()}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-sm hover:shadow-glow"
          >
            {isSending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
