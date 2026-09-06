import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { DashboardStats } from './types';

interface StatsGridProps {
  stats: DashboardStats;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-card border-indigo-100/80 transition-shadow hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">
            Total Emails
          </CardTitle>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <Mail className="h-5 w-5 text-indigo-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-1 text-3xl font-bold text-slate-900">{stats.totalEmails}</div>
          <p className="text-xs text-slate-500">Emails processed</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-indigo-100/80 transition-shadow hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">
            AI Drafts
          </CardTitle>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <Sparkles className="h-5 w-5 text-indigo-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-1 text-3xl font-bold text-slate-900">{stats.emailsWithAI}</div>
          <p className="text-xs text-slate-500">AI-powered replies</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-indigo-100/80 transition-shadow hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">
            Time Saved
          </CardTitle>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <Clock className="h-5 w-5 text-indigo-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-1 text-3xl font-bold text-slate-900">{formatTime(stats.timeSavedMinutes)}</div>
          <p className="text-xs text-slate-500">Estimated time saved</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-indigo-100/80 transition-shadow hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">
            High Priority
          </CardTitle>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <TrendingUp className="h-5 w-5 text-indigo-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-1 text-3xl font-bold text-slate-900">{stats.highPriorityEmails}</div>
          <p className="text-xs text-slate-500">Requiring attention</p>
        </CardContent>
      </Card>
    </div>
  );
}
