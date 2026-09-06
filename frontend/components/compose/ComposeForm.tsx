'use client';

import { Input } from '@/components/ui/input';
import { MultiEmailInput } from '@/components/ui/multi-email-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Check, Clock, Settings2 } from 'lucide-react';

type Tone = 'formal' | 'friendly' | 'assertive' | 'short';

interface ComposeFormProps {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  showCc: boolean;
  showBcc: boolean;
  selectedTone: Tone;
  aiSuggestion: string | null;
  onToChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onShowCcChange: (show: boolean) => void;
  onShowBccChange: (show: boolean) => void;
  onToneChange: (tone: Tone) => void;
  onUseSuggestion: () => void;
  onDismissSuggestion: () => void;
  followUpEnabled: boolean;
  followUpDelays: number[];
  followUpMode: 'manual' | 'auto' | 'hybrid';
  onFollowUpEnabledChange: (enabled: boolean) => void;
  onFollowUpDelaysChange: (delays: number[]) => void;
  onFollowUpModeChange: (mode: 'manual' | 'auto' | 'hybrid') => void;
  followUpTone: Tone;
  onFollowUpToneChange: (tone: Tone) => void;
  followUpTime: string;
  onFollowUpTimeChange: (time: string) => void;
}

export default function ComposeForm({
  to,
  cc,
  bcc,
  subject,
  body,
  showCc,
  showBcc,
  selectedTone,
  aiSuggestion,
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  onBodyChange,
  onShowCcChange,
  onShowBccChange,
  onToneChange,
  onUseSuggestion,
  onDismissSuggestion,
  followUpEnabled,
  followUpDelays,
  followUpMode,
  onFollowUpEnabledChange,
  onFollowUpDelaysChange,
  onFollowUpModeChange,
  followUpTone,
  onFollowUpToneChange,
  followUpTime,
  onFollowUpTimeChange,
}: ComposeFormProps) {
  const tones: Tone[] = ['formal', 'friendly', 'assertive', 'short'];
  const selectedDelay = followUpDelays[0] || 2;

  const applyDelay = (delay: number) => {
    if (!Number.isFinite(delay) || delay < 1) return;
    onFollowUpDelaysChange([delay]);
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl border-indigo-100/80">
      {/* Recipients */}
      <div className="border-b border-indigo-100">
        <div className="flex items-center px-3 sm:px-4 py-2 sm:py-3">
          <Label className="w-10 shrink-0 text-xs text-slate-500 sm:w-14 sm:text-sm">To</Label>
          <MultiEmailInput
            value={to}
            onChange={(val) => onToChange(val)}
            placeholder="recipient@example.com"
            className="min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-slate-900 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center gap-2 text-xs shrink-0 ml-2">
            {!showCc && (
              <button
                type="button"
                onClick={() => onShowCcChange(true)}
                className="text-slate-400 transition-colors hover:text-indigo-700"
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                type="button"
                onClick={() => onShowBccChange(true)}
                className="text-slate-400 transition-colors hover:text-indigo-700"
              >
                Bcc
              </button>
            )}
          </div>
        </div>

        {/* CC Field */}
        {showCc && (
          <div className="flex items-center border-t border-indigo-100 px-3 py-2 sm:px-4 sm:py-3">
            <Label className="w-10 shrink-0 text-xs text-slate-500 sm:w-14 sm:text-sm">Cc</Label>
            <MultiEmailInput
              value={cc}
              onChange={(val) => onCcChange(val)}
              placeholder="cc@example.com"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-slate-900 shadow-none focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => {
                onShowCcChange(false);
                onCcChange('');
              }}
              className="ml-2 text-slate-400 transition-colors hover:text-indigo-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* BCC Field */}
        {showBcc && (
          <div className="flex items-center border-t border-indigo-100 px-3 py-2 sm:px-4 sm:py-3">
            <Label className="w-10 shrink-0 text-xs text-slate-500 sm:w-14 sm:text-sm">Bcc</Label>
            <MultiEmailInput
              value={bcc}
              onChange={(val) => onBccChange(val)}
              placeholder="bcc@example.com"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-slate-900 shadow-none focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => {
                onShowBccChange(false);
                onBccChange('');
              }}
              className="ml-2 text-slate-400 transition-colors hover:text-indigo-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Subject */}
      <div className="border-b border-indigo-100">
        <div className="flex items-center px-3 sm:px-4 py-2 sm:py-3">
          <Label className="w-10 shrink-0 text-xs text-slate-500 sm:w-14 sm:text-sm">Subject</Label>
          <Input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Email subject"
            className="min-w-0 flex-1 border-0 bg-transparent px-0 text-sm font-medium text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="border-b border-indigo-100 bg-indigo-50/60 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="mb-2 flex items-center text-xs font-medium text-slate-500">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced Version
              </p>
              <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {aiSuggestion}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onDismissSuggestion}
                className="h-8 flex-1 text-xs sm:flex-none"
              >
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onUseSuggestion}
                className="h-8 flex-1 text-xs sm:flex-none"
              >
                <Check className="h-3 w-3 mr-1" />
                Use
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-3 sm:p-4">
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Write your message..."
          className="min-h-[200px] w-full resize-none bg-transparent text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:outline-none sm:min-h-[280px]"
        />
      </div>

      {/* Tone Options */}
      <div className="border-t border-indigo-100 bg-indigo-50/40 px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="shrink-0 text-xs text-slate-500">Tone:</span>
            {tones.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => onToneChange(tone)}
                className={`px-2 sm:px-2.5 py-1 text-xs rounded-full transition-colors shrink-0 ${
                  selectedTone === tone
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                }`}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </button>
            ))}
          </div>

          <div className="shrink-0 text-xs text-slate-400">{body.length} chars</div>
        </div>
      </div>

      {/* Follow-up Settings */}
      <div className="rounded-b-xl border-t border-indigo-100 bg-white px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-slate-900">Automated Follow-ups</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={followUpEnabled}
              onChange={(e) => onFollowUpEnabledChange(e.target.checked)}
            />
            <div className="peer h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-indigo-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-['']"></div>
          </label>
        </div>
        
        {followUpEnabled && (
          <div className="space-y-4 border-t border-indigo-100 pt-3">
            {/* Quick presets */}
            <div>
              <Label className="mb-2 block text-xs text-slate-500">Follow up after (days)</Label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 5, 7].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => applyDelay(val)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedDelay === val
                        ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                    }`}
                  >
                    {val} day{val > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom delay input */}
            <div>
              <Label className="mb-2 block text-xs text-slate-500">Or enter custom days</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="e.g. 10"
                  className="w-20 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = parseInt((e.target as HTMLInputElement).value);
                      if (val > 0) {
                        applyDelay(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  id="custom-delay-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('custom-delay-input') as HTMLInputElement;
                    const val = parseInt(input?.value);
                    if (val > 0) {
                      applyDelay(val);
                      input.value = '';
                    }
                  }}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Set
                </button>
              </div>
            </div>

            <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
              Follow-up will be sent after <span className="font-semibold">{selectedDelay} day{selectedDelay > 1 ? 's' : ''}</span> if there is no reply.
            </div>
            
            <div>
              <Label className="mb-2 block text-xs text-slate-500">Sending Mode</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onFollowUpModeChange('manual')}
                  className={`px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
                    followUpMode === 'manual'
                      ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                  }`}
                >
                  <div className="font-semibold">Manual Review</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Approve before sending</div>
                </button>
                <button
                  type="button"
                  onClick={() => onFollowUpModeChange('auto')}
                  className={`px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
                    followUpMode === 'auto'
                      ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                  }`}
                >
                  <div className="font-semibold">Auto Send</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Send automatically</div>
                </button>
                <button
                  type="button"
                  onClick={() => onFollowUpModeChange('hybrid')}
                  className={`px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
                    followUpMode === 'hybrid'
                      ? 'border border-indigo-200 bg-indigo-100 text-indigo-700'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50'
                  }`}
                >
                  <div className="font-semibold">Hybrid</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Review 1st, auto later</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Follow-up Time */}
              <div>
                <Label className="mb-2 block text-xs text-slate-500">Time of Day</Label>
                <input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => onFollowUpTimeChange(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-32"
                />
              </div>

              {/* Tone Selector */}
              <div>
                <Label className="mb-2 block text-xs text-slate-500">Follow-up Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {(['friendly', 'formal', 'assertive', 'short'] as Tone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onFollowUpToneChange(t)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                        followUpTone === t
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
          </div>
        )}
      </div>
    </div>
  );
}
