import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmailStore } from '../store/emailStore';
import { ThreadView } from '../components/ThreadView/ThreadView';

export const Thread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeThread, fetchThreadDetail, isLoadingThreadDetail } = useEmailStore();

  useEffect(() => {
    if (id) {
      fetchThreadDetail(id);
    }
  }, [id, fetchThreadDetail]);

  if (isLoadingThreadDetail) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-[#0b0f17]">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!activeThread) {
    return (
      <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-[#0b0f17] h-full flex flex-col items-center justify-center font-sans">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Thread not found</h3>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary text-xs"
        >
          Return to Mailbox
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-[#0b0f17]">
      <ThreadView thread={activeThread} onBack={() => navigate('/dashboard')} />
    </div>
  );
};
