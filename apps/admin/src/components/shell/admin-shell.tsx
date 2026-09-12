'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useAuth } from '@/lib/auth-context';
import { NotificationProvider, ToastContainer } from '@/lib/notifications';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return (
    <NotificationProvider>
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

        {/* Single Global Toast Notification Container */}
        <ToastContainer />
      </div>
    </NotificationProvider>
  );
}
