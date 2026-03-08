
'use client';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { AppHeader } from '@/components/app-shell/app-header';
import { BottomNav } from '@/components/app-shell/bottom-nav';
import type { UserRole } from '@/lib/types';

import { usePathname } from 'next/navigation';

export const AppShell = ({ children, role, user }: { children: ReactNode, role: UserRole, user: User }) => {
  const pathname = usePathname();
  const hideHeaderRoutes = ['/profile', '/settings', '/profile/trust'];
  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {!shouldHideHeader && <AppHeader role={role} />}
      {/* 
        Add padding bottom so the main scrolling content isn't 
        hidden behind the fixed BottomNav (h-16 + pb-safe env = ~h-24)
      */}
      <main className="flex-1 overflow-y-auto pb-24 relative">
        {children}
      </main>
      <BottomNav role={role} />
    </div>
  );
}
