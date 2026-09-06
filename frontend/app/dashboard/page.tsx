'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import api from '@/lib/axios';
import AppShell from '@/components/layout/AppShell';
import StatsGrid from '@/components/dashboard/StatsGrid';
import PriorityBreakdown from '@/components/dashboard/PriorityBreakdown';
import AccountInfo from '@/components/dashboard/AccountInfo';
import CategoryStats from '@/components/dashboard/CategoryStats';
import EmailActivity from '@/components/dashboard/EmailActivity';
import AIActivity from '@/components/dashboard/AIActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import {
  Inbox,
  Send,
  RefreshCw,
  Mail,
  Sparkles,
  TrendingUp,
  Clock,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type { DashboardStats } from '@/components/dashboard/types';

export default function DashboardPage() {
  const { user } = useUserStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/analytics/dashboard');
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncEmails = async () => {
    try {
      setSyncing(true);
      await api.get('/gmail/messages?maxResults=100');
      await fetchStats();
      setToast({ message: 'Emails synced successfully', type: 'success' });
    } catch (error) {
      console.error('Error syncing emails:', error);
      setToast({ message: 'Failed to sync emails', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="mt-1 text-slate-600">
                Manage your emails with AI-powered assistance
              </p>
            </div>
            <Button
              variant="outline"
              onClick={syncEmails}
              disabled={syncing}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Emails'}
            </Button>
          </div>

          {/* Quick Action Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/inbox">
              <Card className="glass-card group cursor-pointer border-indigo-100/80 transition-all hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 transition-transform group-hover:scale-105">
                    <Inbox className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900">Open Inbox</h3>
                    <p className="text-sm text-slate-600">
                      Read and manage your emails
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600">
                    <span className="text-sm font-medium">{stats?.totalEmails || 0}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/compose">
              <Card className="glass-card group cursor-pointer border-indigo-100/80 transition-all hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 transition-transform group-hover:scale-105">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900">Compose Email</h3>
                    <p className="text-sm text-slate-600">
                      Write with AI assistance
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* AI Features */}
        <Card className="glass-card mb-8 border-indigo-100/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-slate-500">
              AI Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white/70 p-3 transition-colors hover:bg-indigo-50/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                  <Mail className="h-4 w-4 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Summarize</p>
                  <p className="text-xs text-slate-500">Quick summaries</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white/70 p-3 transition-colors hover:bg-indigo-50/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                  <Send className="h-4 w-4 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Smart Reply</p>
                  <p className="text-xs text-slate-500">Generate responses</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white/70 p-3 transition-colors hover:bg-indigo-50/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                  <Clock className="h-4 w-4 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Follow-up</p>
                  <p className="text-xs text-slate-500">Create follow-ups</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white/70 p-3 transition-colors hover:bg-indigo-50/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                  <TrendingUp className="h-4 w-4 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Enhance</p>
                  <p className="text-xs text-slate-500">Improve writing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : stats ? (
          <>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
              Analytics
            </h2>
            
            <StatsGrid stats={stats} />

            {/* Row with Priority Breakdown and Account Info - both equal size */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <PriorityBreakdown stats={stats} />
              <AccountInfo stats={stats} />
            </div>

            {/* Row with Category Stats and Email Activity */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <CategoryStats stats={stats} />
              <EmailActivity stats={stats} />
            </div>

            <AIActivity stats={stats} />
          </>
        ) : (
          <Card className="glass-card border-indigo-100/80">
            <CardContent className="py-12 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-indigo-300" />
              <h3 className="mb-2 text-lg font-medium text-slate-900">
                No email data yet
              </h3>
              <p className="mb-4 text-slate-600">
                Click &quot;Sync Emails&quot; to fetch your emails
              </p>
              <Button
                onClick={syncEmails}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Toast Notification */}
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
