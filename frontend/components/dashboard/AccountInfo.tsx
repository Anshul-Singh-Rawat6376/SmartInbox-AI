import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';
import { DashboardStats } from './types';

interface AccountInfoProps {
  stats: DashboardStats;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AccountInfo({ stats }: AccountInfoProps) {
  return (
    <Card className="glass-card border-indigo-100/80">
      <CardHeader className="border-b border-indigo-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <User className="h-4 w-4 text-indigo-600" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-3">
        <div>
          <p className="mb-0.5 text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900">{stats.userInfo.email}</p>
        </div>
        <div>
          <p className="mb-0.5 text-xs text-slate-500">Member Since</p>
          <p className="text-sm font-medium text-slate-900">{formatDate(stats.userInfo.createdAt)}</p>
        </div>
        <div>
          <p className="mb-0.5 text-xs text-slate-500">Account Age</p>
          <p className="text-sm font-medium text-slate-900">{stats.accountAge} days</p>
        </div>
        <div>
          <p className="mb-0.5 text-xs text-slate-500">Unread Emails</p>
          <p className="text-sm font-medium text-slate-900">{stats.unreadEmails}</p>
        </div>
        <Link href="/settings">
          <Button className="mt-3 w-full">
            <Settings className="h-4 w-4 mr-2" />
            Manage Settings
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
