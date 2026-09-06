'use client';

import { Reply, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReplyBoxProps {
  showReply: boolean;
  replyBody: string;
  sendingReply: boolean;
  aiLoading: string | null;
  onSetShowReply: (show: boolean) => void;
  onSetReplyBody: (body: string) => void;
  onSendReply: () => void;
  onGenerateReply: (tone: string) => void;
}

export default function ReplyBox({
  showReply,
  replyBody,
  sendingReply,
  aiLoading,
  onSetShowReply,
  onSetReplyBody,
  onSendReply,
  onGenerateReply,
}: ReplyBoxProps) {
  if (!showReply) {
    return (
      <div className="shrink-0 border-t border-indigo-100 bg-white/80 p-2 backdrop-blur-sm sm:p-3">
        <Button
          onClick={() => onSetShowReply(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </Button>
      </div>
    );
  }

  return (
    <div className="flex max-h-[50vh] shrink-0 flex-col border-t border-indigo-100 bg-white/85 sm:max-h-none">
      {/* Reply Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-indigo-100 bg-indigo-50/60 px-3 py-2 sm:px-4">
        <span className="text-sm font-medium text-slate-700">Reply</span>
        <button
          onClick={() => {
            onSetShowReply(false);
            onSetReplyBody('');
          }}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-indigo-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tone Options */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-indigo-100 px-3 py-2 sm:gap-2 sm:px-4">
        <span className="mr-1 shrink-0 text-xs text-slate-500">Tone:</span>
        <button
          onClick={() => onGenerateReply('formal')}
          disabled={aiLoading !== null}
          className="shrink-0 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 sm:px-2.5"
        >
          Formal
        </button>
        <button
          onClick={() => onGenerateReply('friendly')}
          disabled={aiLoading !== null}
          className="shrink-0 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 sm:px-2.5"
        >
          Friendly
        </button>
        <button
          onClick={() => onGenerateReply('short')}
          disabled={aiLoading !== null}
          className="shrink-0 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 sm:px-2.5"
        >
          Short
        </button>
      </div>

      {/* Textarea */}
      <div className="p-2 sm:p-4 flex-1 min-h-0">
        <textarea
          value={replyBody}
          onChange={(e) => onSetReplyBody(e.target.value)}
          placeholder="Write your reply..."
          className="h-full min-h-[80px] w-full resize-none rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:min-h-[100px] sm:p-3"
        />
      </div>

      {/* Actions */}
      <div className="px-2 sm:px-4 pb-2 sm:pb-4 flex items-center justify-end gap-2 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onSetShowReply(false);
            onSetReplyBody('');
          }}
          className="text-xs text-slate-500 sm:text-sm"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSendReply}
          disabled={sendingReply || !replyBody.trim()}
          className="px-3 text-xs sm:px-4 sm:text-sm"
        >
          {sendingReply ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
          ) : (
            <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
