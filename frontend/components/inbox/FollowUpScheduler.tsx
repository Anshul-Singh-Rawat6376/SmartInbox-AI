'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, X, Send, Timer, Zap, Edit3 } from 'lucide-react';

interface FollowUpSchedulerProps {
  threadId: string;
  messageId: string;
  to: string;
  subject: string;
  onClose: () => void;
  onScheduled: () => void;
}

export default function FollowUpScheduler({
  threadId,
  messageId,
  to,
  subject,
  onClose,
  onScheduled,
}: FollowUpSchedulerProps) {
  const [delayDays, setDelayDays] = useState<number>(2);
  const [mode, setMode] = useState<'manual' | 'auto' | 'hybrid'>('manual');
  const [tone, setTone] = useState<'friendly' | 'formal' | 'assertive' | 'short'>('friendly');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customDelay, setCustomDelay] = useState('');

  const presets = [1, 2, 3, 5, 7];

  const applyDelay = (delay: number) => {
    if (!Number.isFinite(delay) || delay < 1) return;
    setDelayDays(delay);
  };

  const handleSchedule = async () => {
    if (!delayDays || delayDays < 1) {
      setError('Choose after how many days to follow up');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await api.post('/followup/config', {
        threadId,
        messageId,
        to,
        subject,
        delayDays,
        delays: [delayDays],
        mode,
        tone,
        timeOfDay,
      });
      onScheduled();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to schedule follow-ups');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-2 shrink-0 border-t border-indigo-100 bg-indigo-50/40 px-3 py-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-900">Schedule Follow-up</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Delay presets */}
        <div>
          <Label className="mb-2 block text-xs text-slate-500">Follow up after (days)</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => applyDelay(val)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  delayDays === val
                    ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                }`}
              >
                {val} day{val > 1 ? 's' : ''}
              </button>
            ))}
            {/* Custom add */}
            <div className="flex gap-1">
              <input
                type="number"
                min="1"
                max="90"
                placeholder="custom"
                value={customDelay}
                onChange={(e) => setCustomDelay(e.target.value)}
                className="w-16 rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = parseInt(customDelay, 10);
                    if (val > 0) {
                      applyDelay(val);
                      setCustomDelay('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const val = parseInt(customDelay, 10);
                  if (val > 0) {
                    applyDelay(val);
                    setCustomDelay('');
                  }
                }}
                className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          Follow-up will be sent after <span className="font-semibold">{delayDays} day{delayDays > 1 ? 's' : ''}</span> if there is no reply.
        </div>

        {/* Mode + Tone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">Mode</Label>
            <div className="space-y-1">
              {([
                { key: 'manual', label: 'Manual', desc: 'Review before send', icon: Edit3 },
                { key: 'auto', label: 'Auto', desc: 'Send directly', icon: Zap },
                { key: 'hybrid', label: 'Hybrid', desc: '1st manual, rest auto', icon: Timer },
              ] as const).map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-left transition-colors ${
                    mode === key
                      ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <div>
                    <span className="font-medium">{label}</span>
                    <span className="text-[10px] opacity-70 ml-1">{desc}</span>
                  </div>
                </button>
              ))}
            </div>
            {/* Time Picker */}
            <div className="mt-3">
              <Label className="mb-1.5 block text-xs text-slate-500">Time of Day</Label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">Tone</Label>
            <div className="space-y-1">
              {(['friendly', 'formal', 'assertive', 'short'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-md text-left capitalize transition-colors ${
                    tone === t
                      ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSchedule}
            disabled={saving || delayDays < 1}
            className="h-8 flex-1 text-xs"
          >
            {saving ? (
              <span className="animate-spin mr-1">⏳</span>
            ) : (
              <Send className="w-3 h-3 mr-1" />
            )}
            Schedule Follow-up
          </Button>
        </div>
      </div>
    </div>
  );
}
