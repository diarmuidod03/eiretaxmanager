'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userId, loadFromServer, setUserId } = useAppStore();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }

    // User is authenticated
    const sessionUserId = (session.user as any)?.id;
    if (sessionUserId) {
      if (sessionUserId !== userId) {
        // Different user - reset and load their data
        setUserId(sessionUserId);
        loadFromServer(sessionUserId);
      }
      // Same user - data already loaded
    }
  }, [session, status, router, userId, loadFromServer, setUserId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

