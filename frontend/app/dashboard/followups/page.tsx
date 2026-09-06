'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import api from '@/lib/axios';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import {
  Clock,
  Send,
  XCircle,
  CheckCircle2,
  Loader2,
  Edit3,
  Timer,
  Ban,
  RotateCcw,
  Settings2,
} from 'lucide-react';

interface FollowUp {
  _id: string;
  threadId: string;
  to: string;
  subject: string;
  stepNumber: number;
  delayDays: number;
  scheduledTime: string;
  status: 'pending' | 'pending_review' | 'sent' | 'cancelled' | 'snoozed';
  mode: 'manual' | 'auto' | 'hybrid';
  draft?: string;
  tone: string;
  createdAt: string;
}

type TabType = 'upcoming' | 'sent' | 'cancelled';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  pending_review: { label: 'Needs Review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Edit3 },
  sent: { label: 'Sent', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-gray-50 text-gray-500 border-gray-200', icon: XCircle },
  snoozed: { label: 'Snoozed', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Timer },
};

export default function FollowUpsPage() {
  const { user } = useUserStore();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  
  // Settings edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'manual' | 'auto' | 'hybrid'>('hybrid');
  const [editTone, setEditTone] = useState<string>('friendly');
  const [editDelayDays, setEditDelayDays] = useState<number>(2);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/followup');
      setFollowUps(data.followUps || []);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFollowUps();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/followup/${id}/status`, { status });
      setToast({ message: `Follow-up ${status}`, type: 'success' });
      fetchFollowUps();
    } catch (error) {
      setToast({ message: 'Failed to update follow-up', type: 'error' });
    }
  };

  const saveDraftAndSend = async (id: string) => {
    try {
      if (editDraft.trim()) {
        await api.put(`/followup/${id}/draft`, { draft: editDraft });
      }
      await api.put(`/followup/${id}/status`, { status: 'sent' });
      setReviewingId(null);
      setEditDraft('');
      setToast({ message: 'Follow-up sent!', type: 'success' });
      fetchFollowUps();
    } catch (error) {
      setToast({ message: 'Failed to send follow-up', type: 'error' });
    }
  };

  const saveSettings = async (id: string) => {
    try {
      const scheduledTime = new Date(`${editDate}T${editTime}`).toISOString();
      const followUp = followUps.find((f) => f._id === id);
      
      const payload: any = {
        mode: editMode,
        tone: editTone,
        delayDays: editDelayDays,
        scheduledTime,
      };

      // Restart cancelled or sent follow-ups
      if (followUp && (followUp.status === 'cancelled' || followUp.status === 'sent')) {
        payload.status = 'pending';
      }

      await api.put(`/followup/${id}/config`, payload);
      setEditingId(null);
      setToast({ message: 'Follow-up settings saved!', type: 'success' });
      fetchFollowUps();
    } catch (error) {
      setToast({ message: 'Failed to save settings', type: 'error' });
    }
  };

  const filtered = followUps.filter((f) => {
    if (activeTab === 'upcoming') return ['pending', 'pending_review', 'snoozed'].includes(f.status);
    if (activeTab === 'sent') return f.status === 'sent';
    return f.status === 'cancelled';
  });

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'upcoming', label: 'Upcoming', icon: Clock },
    { key: 'sent', label: 'Sent', icon: Send },
    { key: 'cancelled', label: 'Cancelled', icon: Ban },
  ];

  const counts = {
    upcoming: followUps.filter(f => ['pending', 'pending_review', 'snoozed'].includes(f.status)).length,
    sent: followUps.filter(f => f.status === 'sent').length,
    cancelled: followUps.filter(f => f.status === 'cancelled').length,
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your automated email follow-ups</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFollowUps}
            disabled={loading}
            className=""
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex w-fit gap-1 rounded-xl bg-indigo-100/80 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-indigo-200 text-indigo-700'
                  }`}>
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="glass-card border-indigo-100/80">
            <CardContent className="py-16 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-indigo-300" />
              <h3 className="mb-2 text-lg font-medium text-slate-900">
                No {activeTab} follow-ups
              </h3>
              <p className="text-sm text-slate-600">
                {activeTab === 'upcoming'
                  ? 'Schedule follow-ups when composing emails'
                  : activeTab === 'sent'
                  ? 'Sent follow-ups will appear here'
                  : 'Cancelled follow-ups will appear here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((followUp) => {
              const config = statusConfig[followUp.status];
              const StatusIcon = config.icon;
              const isReviewing = reviewingId === followUp._id;
              const scheduledDate = new Date(followUp.scheduledTime);

              return (
                <Card key={followUp._id} className="glass-card border-indigo-100/80 transition-shadow hover:shadow-xl">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                          <span className="text-xs text-slate-400">After {followUp.delayDays} day{followUp.delayDays > 1 ? 's' : ''}</span>
                          <span className="text-xs capitalize text-slate-400">• {followUp.mode}</span>
                        </div>
                        <h4 className="truncate text-sm font-medium text-slate-900">{followUp.subject}</h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                          To: {followUp.to} · Scheduled: {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        {followUp.draft && !isReviewing && (
                          <p className="mt-2 line-clamp-2 text-xs italic text-slate-400">
                            &quot;{followUp.draft.substring(0, 120)}...&quot;
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {followUp.status === 'pending_review' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setReviewingId(isReviewing ? null : followUp._id);
                              setEditDraft(followUp.draft || '');
                            }}
                            className="h-8 bg-indigo-600 text-xs text-white hover:bg-indigo-500"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                            onClick={() => {
                              if (editingId === followUp._id) {
                                setEditingId(null);
                              } else {
                                setEditingId(followUp._id);
                                setReviewingId(null);
                                setEditMode(followUp.mode);
                                setEditTone(followUp.tone);
                                setEditDelayDays(followUp.delayDays || 2);
                                const dt = new Date(followUp.scheduledTime);
                                setEditDate(dt.toISOString().split('T')[0]);
                                setEditTime(dt.toTimeString().substring(0, 5));
                              }
                            }}
                            className="h-8 text-xs"
                          >
                            <Settings2 className="h-3 w-3 mr-1" />
                            Settings
                          </Button>
                          
                          {['pending', 'pending_review', 'snoozed'].includes(followUp.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(followUp._id, 'snoozed')}
                              className="h-8 text-xs"
                            >
                              <Timer className="h-3 w-3 mr-1" />
                              Snooze
                            </Button>
                          )}

                          {followUp.status !== 'cancelled' && followUp.status !== 'sent' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(followUp._id, 'cancelled')}
                              className="h-8 border-red-200 text-xs text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                    {/* Review Panel */}
                    {isReviewing && (
                      <div className="mt-4 border-t border-indigo-100 pt-4">
                        <label className="mb-2 block text-xs font-medium text-slate-500">Edit AI-generated draft</label>
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          className="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <div className="flex items-center justify-end gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setReviewingId(null); setEditDraft(''); }}
                            className="text-xs h-8"
                          >
                            Discard
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveDraftAndSend(followUp._id)}
                            className="h-8 text-xs"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Settings Panel */}
                    {editingId === followUp._id && (
                      <div className="mt-4 space-y-4 border-t border-indigo-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Follow up after (days)</label>
                            <input
                              type="number"
                              min="1"
                              max="90"
                              value={editDelayDays}
                              onChange={e => setEditDelayDays(Math.max(1, Number(e.target.value) || 1))}
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Schedule</label>
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={editDate}
                                onChange={e => setEditDate(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                              <input
                                type="time"
                                value={editTime}
                                onChange={e => setEditTime(e.target.value)}
                                className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Sending Mode</label>
                            <select
                              value={editMode}
                              onChange={(e: any) => setEditMode(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                              <option value="manual">Manual Review</option>
                              <option value="auto">Auto Send</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">AI Tone</label>
                            <select
                              value={editTone}
                              onChange={e => setEditTone(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                              <option value="friendly">Friendly</option>
                              <option value="formal">Formal</option>
                              <option value="assertive">Assertive</option>
                              <option value="short">Short</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-end gap-2 border-t border-indigo-100 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="text-xs h-8"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveSettings(followUp._id)}
                            className="h-8 bg-indigo-600 text-xs text-white hover:bg-indigo-500"
                          >
                            Save Settings
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppShell>
  );
}
