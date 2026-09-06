'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Mail, Archive, Trash2, Reply, MoreHorizontal, Download, ExternalLink, ChevronDown, ChevronUp, Image as ImageIcon, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Email } from './types';
import AIActionsBar from './AIActionsBar';
import ReplyBox from './ReplyBox';
import FollowUpScheduler from './FollowUpScheduler';
import api from '@/lib/axios';

interface EmailViewerProps {
  email: Email | null;
  showReply: boolean;
  replyBody: string;
  sendingReply: boolean;
  aiLoading: string | null;
  aiResult: { type: string; content: string } | null;
  onArchive: (email: Email) => void;
  onTrash: (email: Email) => void;
  onSetShowReply: (show: boolean) => void;
  onSetReplyBody: (body: string) => void;
  onSendReply: () => void;
  onGenerateSummary: () => void;
  onGenerateReply: (tone: string) => void;
  onGenerateFollowUp: () => void;
  onCopyToClipboard: (text: string) => void;
  onClearAiResult: () => void;
  copiedToClipboard: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Function to check if content is HTML
function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

// Enhanced HTML sanitization that preserves images and links
function sanitizeHtml(html: string): string {
  // Create a temporary div to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove dangerous elements
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form'];
  dangerousTags.forEach(tag => {
    const elements = doc.getElementsByTagName(tag);
    while (elements.length > 0) {
      elements[0].parentNode?.removeChild(elements[0]);
    }
  });
  
  // Remove dangerous attributes
  const allElements = doc.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    const attrs = el.attributes;
    for (let j = attrs.length - 1; j >= 0; j--) {
      const attr = attrs[j];
      if (attr.name.startsWith('on') || attr.value.includes('javascript:')) {
        el.removeAttribute(attr.name);
      }
    }
  }
  
  // Process images to ensure they load properly
  const images = doc.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    // Add loading lazy and error handling
    img.setAttribute('loading', 'lazy');
    img.setAttribute('crossorigin', 'anonymous');
    // Ensure images have max-width
    const currentStyle = img.getAttribute('style') || '';
    img.setAttribute('style', `${currentStyle}; max-width: 100%; height: auto;`);
  }
  
  // Make links open in new tab
  const links = doc.getElementsByTagName('a');
  for (let i = 0; i < links.length; i++) {
    links[i].setAttribute('target', '_blank');
    links[i].setAttribute('rel', 'noopener noreferrer');
  }
  
  return doc.body.innerHTML;
}

// Convert plain text to formatted HTML
function textToHtml(text: string): string {
  return text
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Convert URLs to links
    .replace(
      /(https?:\/\/[^\s<]+[^\s<.,:;"')\]\}])/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
    )
    // Convert email addresses to mailto links
    .replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" class="text-blue-600 hover:underline">$1</a>'
    )
    // Convert newlines to <br>
    .replace(/\n/g, '<br>');
}

export default function EmailViewer({
  email,
  showReply,
  replyBody,
  sendingReply,
  aiLoading,
  aiResult,
  onArchive,
  onTrash,
  onSetShowReply,
  onSetReplyBody,
  onSendReply,
  onGenerateSummary,
  onGenerateReply,
  onGenerateFollowUp,
  onCopyToClipboard,
  onClearAiResult,
  copiedToClipboard,
  onBack,
  showBackButton,
}: EmailViewerProps) {
  const [showImages, setShowImages] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [threadFollowUps, setThreadFollowUps] = useState<any[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchThreadFollowUps = useCallback(async (threadId: string) => {
    try {
      const { data } = await api.get(`/followup?threadId=${threadId}`);
      setThreadFollowUps(data.followUps || []);
    } catch {
      setThreadFollowUps([]);
    }
  }, []);

  useEffect(() => {
    if (email?.threadId) {
      fetchThreadFollowUps(email.threadId);
    } else {
      setThreadFollowUps([]);
    }
  }, [email?.threadId, fetchThreadFollowUps]);

  const formatSenderName = (from: string) => {
    const match = from.match(/^([^<]+)/);
    return match ? match[1].trim().replace(/"/g, '') : from;
  };

  const extractEmail = (from: string) => {
    const match = from.match(/<([^>]+)>/);
    return match ? match[1] : from;
  };

  const getInitials = (from: string) => {
    const name = formatSenderName(from);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (from: string) => {
    // Generate a consistent color based on the email
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    ];
    const hash = from.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle image loading errors
  useEffect(() => {
    if (contentRef.current) {
      const images = contentRef.current.getElementsByTagName('img');
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        img.onerror = () => {
          // Replace broken image with placeholder
          img.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'inline-flex items-center justify-center bg-slate-100 rounded px-3 py-2 text-slate-400 text-sm';
          placeholder.innerHTML = '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Image';
          img.parentNode?.insertBefore(placeholder, img);
        };
      }
    }
  }, [email]);

  if (!email) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-50/40 to-slate-100/60">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <Mail className="h-10 w-10 text-slate-300" />
          </div>
          <p className="text-lg font-medium text-slate-600">Select an email</p>
          <p className="mt-1 text-sm text-slate-400">Choose a message from the list to read</p>
        </div>
      </div>
    );
  }

  // Prefer htmlBody for rich formatting, fall back to body or snippet
  const htmlContent = email.htmlBody || '';
  const textContent = email.body || email.snippet || '';
  const hasHtmlContent = htmlContent && isHtml(htmlContent);

  // Process content for display
  let displayContent = '';
  if (hasHtmlContent && showImages) {
    displayContent = sanitizeHtml(htmlContent);
  } else if (hasHtmlContent && !showImages) {
    // Strip images from HTML
    const strippedHtml = htmlContent.replace(/<img[^>]*>/gi, '<span class="text-gray-400 text-sm">[Image hidden]</span>');
    displayContent = sanitizeHtml(strippedHtml);
  } else if (textContent) {
    displayContent = textToHtml(textContent);
  }

  return (
    <div className="flex h-full max-h-full flex-1 flex-col overflow-hidden bg-white/85">
      {/* Email Header - Gmail Style */}
      <div className="shrink-0 border-b border-indigo-100 px-3 py-3 sm:px-6 sm:py-4">
        {/* Mobile Back Button + Subject */}
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {showBackButton && (
              <button
                onClick={onBack}
                className="-ml-2 shrink-0 rounded-full p-2 hover:bg-indigo-100 lg:hidden"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
            )}
            <h1 className="flex-1 break-words text-lg font-normal leading-tight text-slate-900 sm:text-xl">
              {email.subject || '(No subject)'}
            </h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(email)}
              className="h-8 w-8 rounded-full p-0 text-slate-500 hover:bg-indigo-100 hover:text-indigo-700 sm:h-9 sm:w-9"
              title="Archive"
            >
              <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTrash(email)}
              className="h-8 w-8 rounded-full p-0 text-slate-500 hover:bg-red-50 hover:text-red-600 sm:h-9 sm:w-9"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowScheduler(!showScheduler)}
              className={`h-8 w-8 rounded-full p-0 sm:h-9 sm:w-9 ${showScheduler ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-indigo-100 hover:text-indigo-700'}`}
              title="Schedule Follow-up"
            >
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Sender Info */}
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Avatar */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getAvatarColor(email.from)} flex items-center justify-center text-white text-xs sm:text-sm font-medium shrink-0 shadow-sm`}>
            {getInitials(email.from)}
          </div>
          
          {/* Sender Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center justify-between gap-1 sm:gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 min-w-0">
                <span className="truncate text-sm font-medium text-slate-900 sm:text-base">{formatSenderName(email.from)}</span>
                <span className="hidden truncate text-xs text-slate-500 sm:inline sm:text-sm">&lt;{extractEmail(email.from)}&gt;</span>
              </div>
              <span className="shrink-0 text-xs text-slate-500 sm:text-sm">{formatShortDate(email.date)}</span>
            </div>
            
            {/* To Line with Expandable Details */}
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center text-sm text-slate-500 transition-colors hover:text-indigo-700"
              >
                <span>to {email.to?.length > 1 ? `${email.to[0].split('@')[0]} and ${email.to.length - 1} others` : (email.to?.[0] || 'me')}</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>

            {/* Expanded Details */}
            {showDetails && (
              <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
                <div className="grid grid-cols-[80px_1fr] gap-1">
                  <span className="text-slate-500">From:</span>
                  <span className="text-slate-700">{email.from}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-1">
                  <span className="text-slate-500">To:</span>
                  <span className="text-slate-700">{email.to?.join(', ') || 'me'}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-1">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-700">{formatDateTime(email.date)}</span>
                </div>
                {email.labels && email.labels.length > 0 && (
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-slate-500">Labels:</span>
                    <div className="flex flex-wrap gap-1">
                      {email.labels.map((label) => (
                        <span key={label} className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Actions */}
      <AIActionsBar
        aiLoading={aiLoading}
        aiResult={aiResult}
        onGenerateSummary={onGenerateSummary}
        onGenerateReply={onGenerateReply}
        onGenerateFollowUp={onGenerateFollowUp}
        onCopyToClipboard={onCopyToClipboard}
        onClearAiResult={onClearAiResult}
        copiedToClipboard={copiedToClipboard}
      />

      {/* Follow-up Status Banner */}
      {threadFollowUps.length > 0 && (
        <div className="shrink-0 border-b border-indigo-100 bg-indigo-50 px-3 py-2 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-indigo-700 sm:text-sm">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              {(() => {
                const pending = threadFollowUps.filter(f => ['pending', 'pending_review', 'snoozed'].includes(f.status));
                const sent = threadFollowUps.filter(f => f.status === 'sent');
                if (pending.length > 0) {
                  const next = pending[0];
                  const date = new Date(next.scheduledTime);
                  const delayText = next.delayDays
                    ? `after ${next.delayDays} day${next.delayDays > 1 ? 's' : ''}`
                    : `follow-up ${next.stepNumber}`;
                  return `Next follow-up ${delayText}: ${date.toLocaleDateString()} (${next.status === 'pending_review' ? 'Needs Review' : next.mode})`;
                }
                if (sent.length > 0) {
                  return `${sent.length} follow-up${sent.length > 1 ? 's' : ''} sent`;
                }
                return 'Follow-ups configured';
              })()}
            </span>
            <a href="/dashboard/followups" className="ml-auto shrink-0 text-xs font-medium text-indigo-600 underline hover:text-indigo-800">
              Manage
            </a>
          </div>
        </div>
      )}

      {/* Image Toggle Banner */}
      {hasHtmlContent && (
        <div className="flex shrink-0 items-center justify-between border-b border-indigo-100 bg-slate-50 px-3 py-2 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm">
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Images in this message</span>
            <span className="sm:hidden">Images</span>
          </div>
          <button
            onClick={() => setShowImages(!showImages)}
            className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700 sm:text-sm"
          >
            {showImages ? 'Hide' : 'Show'}
          </button>
        </div>
      )}

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div 
          ref={contentRef}
          className="email-content p-3 sm:p-6"
          dangerouslySetInnerHTML={{ __html: displayContent || '<p class="text-slate-500">Loading email content...</p>' }}
        />
      </div>

      {/* Follow-up Scheduler Panel */}
      {showScheduler && email && (
        <FollowUpScheduler
          threadId={email.threadId}
          messageId={email.gmailId}
          to={Array.isArray(email.from) ? email.from : email.from}
          subject={email.subject}
          onClose={() => setShowScheduler(false)}
          onScheduled={() => {
            setShowScheduler(false);
            fetchThreadFollowUps(email.threadId);
          }}
        />
      )}

      {/* Reply Section */}
      <ReplyBox
        showReply={showReply}
        replyBody={replyBody}
        sendingReply={sendingReply}
        aiLoading={aiLoading}
        onSetShowReply={onSetShowReply}
        onSetReplyBody={onSetReplyBody}
        onSendReply={onSendReply}
        onGenerateReply={onGenerateReply}
      />

      {/* Gmail-like Email Content Styles */}
      <style jsx global>{`
        .email-content {
          font-family: 'Google Sans', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #202124;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        /* Images */
        .email-content img {
          max-width: 100%;
          height: auto;
          display: inline-block;
          border-radius: 4px;
        }
        
        /* Links */
        .email-content a {
          color: #1a73e8;
          text-decoration: none;
          word-break: break-all;
        }
        .email-content a:hover {
          text-decoration: underline;
        }
        
        /* Tables */
        .email-content table {
          border-collapse: collapse;
          max-width: 100%;
          width: auto;
        }
        .email-content td,
        .email-content th {
          vertical-align: top;
          padding: 8px;
        }
        
        /* Blockquotes */
        .email-content blockquote {
          border-left: 3px solid #dadce0;
          margin: 16px 0;
          padding-left: 16px;
          color: #5f6368;
        }
        
        /* Paragraphs */
        .email-content p {
          margin: 0 0 16px 0;
        }
        .email-content p:last-child {
          margin-bottom: 0;
        }
        
        /* Headings */
        .email-content h1,
        .email-content h2,
        .email-content h3,
        .email-content h4,
        .email-content h5,
        .email-content h6 {
          margin: 24px 0 12px 0;
          font-weight: 500;
          color: #202124;
          line-height: 1.3;
        }
        .email-content h1 { font-size: 24px; }
        .email-content h2 { font-size: 20px; }
        .email-content h3 { font-size: 18px; }
        .email-content h4 { font-size: 16px; }
        .email-content h5 { font-size: 14px; }
        .email-content h6 { font-size: 13px; }
        
        /* Lists */
        .email-content ul,
        .email-content ol {
          margin: 12px 0;
          padding-left: 28px;
        }
        .email-content li {
          margin: 8px 0;
        }
        
        /* Horizontal rule */
        .email-content hr {
          border: none;
          border-top: 1px solid #e8eaed;
          margin: 24px 0;
        }
        
        /* Code */
        .email-content pre {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 13px;
          font-family: 'Google Sans Mono', 'Fira Code', Consolas, monospace;
          margin: 16px 0;
          border: 1px solid #e8eaed;
        }
        .email-content code {
          background: #f1f3f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          font-family: 'Google Sans Mono', 'Fira Code', Consolas, monospace;
        }
        .email-content pre code {
          background: none;
          padding: 0;
        }
        
        /* Gmail quoted text */
        .email-content .gmail_quote,
        .email-content .gmail_attr {
          color: #5f6368;
          border-left: 1px solid #dadce0;
          margin: 16px 0;
          padding-left: 12px;
        }
        
        /* Signature styling */
        .email-content .gmail_signature,
        .email-content div[data-smartmail="gmail_signature"] {
          color: #5f6368;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e8eaed;
        }
        
        /* Button styles in marketing emails */
        .email-content a[style*="background"],
        .email-content a.button,
        .email-content .button {
          display: inline-block;
          border-radius: 4px;
          padding: 10px 20px;
          text-decoration: none !important;
        }
        
        /* Fix for centered content */
        .email-content center,
        .email-content [align="center"] {
          text-align: center;
        }
        
        /* Marketing email container fixes */
        .email-content table[role="presentation"] {
          width: auto !important;
        }
        
        /* Make large tables scrollable */
        .email-content > table {
          display: block;
          overflow-x: auto;
        }
        
        /* Better spacing for divs */
        .email-content div {
          max-width: 100%;
        }
        
        /* Ensure inline styles don't break layout */
        .email-content [style*="width: 100%"],
        .email-content [style*="width:100%"] {
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* Fix fixed widths in emails */
        .email-content [style*="width: 600px"],
        .email-content [style*="width:600px"],
        .email-content [style*="width: 640px"],
        .email-content [style*="width:640px"] {
          max-width: 100% !important;
          width: auto !important;
        }
      `}</style>
    </div>
  );
}
