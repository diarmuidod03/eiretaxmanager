'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { hasCompletedOnboarding, userId, loadFromServer, setUserId } = useAppStore();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // User is authenticated - load their data
    const sessionUserId = (session.user as any)?.id;
    if (sessionUserId) {
      if (sessionUserId !== userId) {
        // New user or different user - reset store and load their data
        setUserId(sessionUserId);
        loadFromServer(sessionUserId).then(() => {
          // After loading, check onboarding status
          const state = useAppStore.getState();
          if (state.hasCompletedOnboarding) {
            router.push('/dashboard');
          } else {
            // First time user - redirect to onboarding
            router.push('/onboarding');
          }
        });
      } else {
        // Same user - data already loaded, just redirect based on onboarding status
        if (hasCompletedOnboarding) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    }
  }, [session, status, router, hasCompletedOnboarding, userId, loadFromServer, setUserId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

