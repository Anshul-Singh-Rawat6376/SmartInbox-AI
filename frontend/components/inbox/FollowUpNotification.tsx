'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Clock, Edit3, Send, Timer, X } from 'lucide-react';

interface PendingFollowUp {
  _id: string;
  subject: string;
  to: string;
  stepNumber: number;
  delayDays?: number;
  draft?: string;
}

export default function FollowUpNotification() {
  const [pending, setPending] = useState<PendingFollowUp[]>([]);
  const [editDraft, setEditDraft] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetchPendingReviews = useCallback(async () => {
    try {
      const { data } = await api.get('/followup?status=pending_review');
      const items = (data.followUps || []).filter(
        (f: PendingFollowUp) => !dismissed.has(f._id)
      );
      setPending(items);
    } catch {
      // fail silently
    }
  }, [dismissed]);

  useEffect(() => {
    fetchPendingReviews();
    const interval = setInterval(fetchPendingReviews, 60_000);
    return () => clearInterval(interval);
  }, [fetchPendingReviews]);

  const handleSend = async (id: string) => {
    try {
      if (editDraft.trim()) {
        await api.put(`/followup/${id}/draft`, { draft: editDraft });
      }
      await api.put(`/followup/${id}/status`, { status: 'sent' });
      setActiveId(null);
      setEditDraft('');
      fetchPendingReviews();
    } catch {
      // fail silently
    }
  };

  const handleSnooze = async (id: string) => {
    try {
      await api.put(`/followup/${id}/status`, { status: 'snoozed' });
      fetchPendingReviews();
    } catch {
      // fail silently
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    setPending((prev) => prev.filter((f) => f._id !== id));
    if (activeId === id) {
      setActiveId(null);
      setEditDraft('');
    }
  };

  if (pending.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full space-y-2">
      {pending.slice(0, 3).map((fu) => (
        <div
          key={fu._id}
          className="glass-card animate-in slide-in-from-bottom-4 overflow-hidden rounded-xl border-indigo-100/80 shadow-lg"
        >
          <div className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-amber-700 mb-0.5">Follow-up Ready for Review</p>
                <p className="truncate text-sm font-medium text-slate-900">{fu.subject}</p>
                <p className="text-xs text-slate-500">
                  To: {fu.to}
                  {fu.delayDays ? ` · After ${fu.delayDays} day${fu.delayDays > 1 ? 's' : ''}` : ` · Follow-up ${fu.stepNumber}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(fu._id)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {activeId === fu._id ? (
            <div className="px-4 pb-3 space-y-2">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                className="min-h-[80px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setActiveId(null); setEditDraft(''); }}
                  className="text-xs h-7 flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSend(fu._id)}
                  className="h-7 flex-1 text-xs"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-3 flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setActiveId(fu._id);
                  setEditDraft(fu.draft || '');
                }}
                className="h-7 flex-1 text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit & Send
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSend(fu._id)}
                className="text-xs h-7 flex-1"
              >
                <Send className="h-3 w-3 mr-1" />
                Send Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSnooze(fu._id)}
                className="text-xs h-7"
              >
                <Timer className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
