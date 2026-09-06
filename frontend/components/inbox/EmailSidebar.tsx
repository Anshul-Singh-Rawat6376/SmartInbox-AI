'use client';

import { Inbox, Star, Send, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailTab } from './types';

interface EmailSidebarProps {
  activeTab: EmailTab;
  unreadCount: number;
  syncing: boolean;
  onTabChange: (tab: EmailTab) => void;
  onSync: () => void;
  onClose?: () => void;
}

export default function EmailSidebar({
  activeTab,
  unreadCount,
  syncing,
  onTabChange,
  onSync,
  onClose,
}: EmailSidebarProps) {
  const tabs = [
    { id: 'inbox' as EmailTab, label: 'Inbox', icon: Inbox, count: unreadCount },
    { id: 'starred' as EmailTab, label: 'Starred', icon: Star },
    { id: 'sent' as EmailTab, label: 'Sent', icon: Send },
  ];

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-indigo-100 bg-white/80 p-3 backdrop-blur-sm">
      {/* Mobile Close Button */}
      {onClose && (
        <div className="flex items-center justify-between mb-3 lg:hidden">
          <span className="text-sm font-medium text-slate-900">Menu</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-indigo-50"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      )}
      
      <div className="mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={syncing}
          className="h-8 w-full text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync'}
        </Button>
      </div>
      
      <nav className="space-y-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-auto min-w-[20px] rounded-full bg-indigo-600 px-1.5 py-0.5 text-center text-xs text-white">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
