'use client';

import { Sparkles, Wand2, Reply, Clock, Loader2, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIActionsBarProps {
  aiLoading: string | null;
  aiResult: { type: string; content: string } | null;
  onGenerateSummary: () => void;
  onGenerateReply: (tone: string) => void;
  onGenerateFollowUp: () => void;
  onCopyToClipboard: (text: string) => void;
  onClearAiResult: () => void;
  copiedToClipboard: boolean;
}

export default function AIActionsBar({
  aiLoading,
  aiResult,
  onGenerateSummary,
  onGenerateReply,
  onGenerateFollowUp,
  onCopyToClipboard,
  onClearAiResult,
  copiedToClipboard,
}: AIActionsBarProps) {
  return (
    <>
      {/* AI Actions Buttons */}
      <div className="shrink-0 overflow-x-auto border-b border-indigo-100 bg-indigo-50/50 px-2 py-2 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          <span className="mr-1 shrink-0 text-xs font-medium text-slate-500">
            <Sparkles className="h-3 w-3 inline mr-1" />
            <span className="hidden sm:inline">AI:</span>
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerateSummary}
            disabled={aiLoading !== null}
            className="h-7 shrink-0 px-2 text-xs text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
          >
            {aiLoading === 'summary' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3 mr-1" />
            )}
            <span className="hidden sm:inline">Summarize</span>
            <span className="sm:hidden">Sum</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onGenerateReply('friendly')}
            disabled={aiLoading !== null}
            className="h-7 shrink-0 px-2 text-xs text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
          >
            {aiLoading === 'reply' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Reply className="h-3 w-3 mr-1" />
            )}
            Reply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerateFollowUp}
            disabled={aiLoading !== null}
            className="h-7 shrink-0 px-2 text-xs text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
          >
            {aiLoading === 'followup' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            <span className="hidden sm:inline">Follow-up</span>
            <span className="sm:hidden">Follow</span>
          </Button>
        </div>
      </div>

      {/* AI Result - Collapsible */}
      {aiResult && (
        <div
          className={`px-3 sm:px-4 py-2 sm:py-3 border-b shrink-0 max-h-40 overflow-y-auto ${
            aiResult.type === 'error'
              ? 'bg-red-50 border-red-100'
              : 'border-indigo-100 bg-indigo-50/60'
          }`}
        >
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium mb-1 sm:mb-1.5 ${
                  aiResult.type === 'error' ? 'text-red-600' : 'text-slate-500'
                }`}
              >
                {aiResult.type === 'summary' && 'Summary'}
                {aiResult.type === 'reply' && 'Generated Reply'}
                {aiResult.type === 'followup' && 'Follow-up'}
                {aiResult.type === 'error' && 'Error'}
              </p>
              <p
                className={`text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                  aiResult.type === 'error' ? 'text-red-600' : 'text-slate-700'
                }`}
              >
                {aiResult.content}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {aiResult.type !== 'error' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopyToClipboard(aiResult.content)}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                >
                  {copiedToClipboard ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearAiResult}
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
