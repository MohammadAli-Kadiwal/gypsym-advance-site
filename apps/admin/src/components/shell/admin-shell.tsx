'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useAuth } from '@/lib/auth-context';
import { NotificationProvider, ToastContainer } from '@/lib/notifications';
import { SidebarProvider } from '@/lib/sidebar-context';
import { BrandingProvider } from '@/lib/branding-context';
import { SystemNotificationsProvider } from '@/lib/system-notifications-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AdminFullscreenLoader } from '@/components/ui/loader';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden');
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <AdminFullscreenLoader message="Securing enterprise cluster session..." badge="GYPSYM OS" />;
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return (
    <BrandingProvider>
      <NotificationProvider>
        <SystemNotificationsProvider>
          <SidebarProvider>
            <TooltipProvider delayDuration={150}>
              {/* Toast renders at root level — outside overflow-hidden so fixed positioning works correctly */}
              <ToastContainer />
              <div className="fixed inset-0 flex h-full w-full overflow-hidden bg-background text-foreground antialiased">
                {/* Desktop and Mobile-Drawer Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col min-w-0 min-h-0 h-full overflow-hidden bg-background">
                  <Header />
                  <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                    {children}
                  </main>
                </div>
              </div>
            </TooltipProvider>
          </SidebarProvider>
        </SystemNotificationsProvider>
      </NotificationProvider>
    </BrandingProvider>
  );
}
