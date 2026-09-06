'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import Navbar from './Navbar';
import FollowUpNotification from '@/components/inbox/FollowUpNotification';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Only check auth after hydration is complete
  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
    }
  }, [isHydrated, user, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="bg-mesh min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show loading if no user (will redirect)
  if (!user) {
    return (
      <div className="bg-mesh min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <main className="px-2 pb-6 pt-2 sm:px-4">{children}</main>
      <FollowUpNotification />
    </div>
  );
}
