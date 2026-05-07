
// src/app/(app)/layout.tsx
'use client';
import type { ReactNode } from 'react';
import { Suspense, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/common/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell } from '@/components/app-shell/app-shell';
import { DonationsProvider } from '@/context/donations-context';
import { EmergencyAlertsProvider } from '@/context/emergency-alerts-context';
import { DeliveryProvider } from '@/context/delivery-context';
import { TrackingEngineProvider } from '@/context/tracking-engine-context';
import dynamic from 'next/dynamic';
import type { UserRole } from '@/lib/types';

const AiBot = dynamic(() => import('@/components/ai-bot/ai-bot').then(m => ({ default: m.AiBot })), {
  ssr: false,
});


function AppLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'donor';
  const { user, isUserLoading, userError } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (userError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-destructive p-6 text-center">
          <Logo />
          <p className="font-bold">Session Error</p>
          <p className="text-sm opacity-80 max-w-xs">{userError.message || 'An error occurred loading your session. Please try logging in again.'}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
          <Button variant="ghost" onClick={() => router.push('/login')} className="mt-2">
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 animate-spin rounded-full" />
            <p className="text-muted-foreground">Loading user session...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null; // Let the useEffect handle the redirect
  }


  return (
    <EmergencyAlertsProvider>
      <DonationsProvider>
        <DeliveryProvider>
          <TrackingEngineProvider>
            <AppShell role={role} user={user}>
              <Suspense fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Logo />
                    <p>Loading page...</p>
                  </div>
                </div>
              }>
                {children}
              </Suspense>
            </AppShell>
            <AiBot />
          </TrackingEngineProvider>
        </DeliveryProvider>
      </DonationsProvider>
    </EmergencyAlertsProvider>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}
