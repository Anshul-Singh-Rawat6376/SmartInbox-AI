import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { DashboardStats } from './types';

interface EmailActivityProps {
  stats: DashboardStats;
}

export default function EmailActivity({ stats }: EmailActivityProps) {
  if (stats.emailsOverTime.length === 0) return null;

  return (
    <Card className="glass-card border-indigo-100/80">
      <CardHeader className="border-b border-indigo-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Calendar className="h-4 w-4 text-indigo-600" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Emails processed in the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-3">
          {stats.emailsOverTime.slice(-7).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-sm font-semibold text-slate-900">{item.count} emails</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
