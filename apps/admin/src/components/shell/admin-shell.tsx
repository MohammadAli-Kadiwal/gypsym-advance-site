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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Securing cluster session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return (
    <BrandingProvider>
      <NotificationProvider>
        <SystemNotificationsProvider>
          <SidebarProvider>
            {/* Toast renders at root level — outside overflow-hidden so fixed positioning works correctly */}
            <ToastContainer />
            <div className="flex h-screen overflow-hidden bg-[#f4f6fa] text-slate-800 antialiased">
              {/* Collapsible Workspace Sidebar */}
              <Sidebar />

              {/* Main Content Area */}
              <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden bg-[#f4f6fa]">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </SystemNotificationsProvider>
      </NotificationProvider>
    </BrandingProvider>
  );
}

