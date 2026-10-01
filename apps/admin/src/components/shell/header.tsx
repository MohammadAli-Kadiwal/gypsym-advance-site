'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Sun,
  Moon,
  PanelLeft,
  CheckCheck,
  ShieldCheck,
  Mail,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useSystemNotifications } from '@/lib/system-notifications-context';
import { CommandPalette } from './command-palette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, theme, toggleTheme, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSystemNotifications();
  const [notifDropdownOpen, setNotifDropdownOpen] = React.useState(false);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      router.push(notif.link);
    } else if (notif.category === 'INQUIRY') {
      router.push('/content/submissions');
    } else if (notif.category === 'BOOKING') {
      router.push('/bookings');
    } else {
      router.push('/system/notifications');
    }
  };

  // Dynamic notification list for dropdown:
  // If unread exist: show ALL new/unread ones (e.g. if 10 new, show all 10)
  // If all are marked as read: show only the last 3 most recent
  const displayedNotifications = React.useMemo(() => {
    if (!notifications || notifications.length === 0) return [];

    const unreadItems = notifications.filter((n: any) => !n.isRead);

    if (unreadItems.length > 0) {
      const readItems = notifications.filter((n: any) => n.isRead);
      const combined = [...unreadItems, ...readItems];
      return combined.slice(0, Math.max(unreadItems.length, 3));
    }

    // If all are marked as read: show strictly only the last 3
    return notifications.slice(0, 3);
  }, [notifications]);

  // Global CMD+K shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current page title mapping
  const pageTitle = React.useMemo(() => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/pages/countries')) return 'Country Pages';
    if (pathname.startsWith('/pages')) return 'Pages';
    if (pathname.startsWith('/editorial/blog')) return 'Blog Posts';
    if (pathname.startsWith('/editorial/author')) return 'Author Profile Settings';
    if (pathname.startsWith('/content/services')) return 'Services';
    if (pathname.startsWith('/content/clients')) return 'Clients';
    if (pathname.startsWith('/content/partners')) return 'Partners';
    if (pathname.startsWith('/content/portfolio')) return 'Portfolio';
    if (pathname.startsWith('/content/team')) return 'Team Profiles';
    if (pathname.startsWith('/content/testimonials')) return 'Testimonials';
    if (pathname.startsWith('/content/submissions')) return 'Inquiries';
    if (pathname.startsWith('/bookings')) return 'Bookings';
    if (pathname.startsWith('/site/branding')) return 'Branding & Identity';
    if (pathname.startsWith('/site/navigation')) return 'Navigation';
    if (pathname.startsWith('/site/socials')) return 'Social Profiles';
    if (pathname.startsWith('/site/settings/recaptcha')) return 'reCAPTCHA & Security';
    if (pathname.startsWith('/site/settings/security')) return 'Security & Lockout';
    if (pathname.startsWith('/site/settings/scripts')) return 'Analytics & Custom Scripts';
    if (pathname.startsWith('/site/settings/email-templates')) return 'Email Templates';
    if (pathname.startsWith('/site/settings/email')) return 'Email / SMTP';
    if (pathname.startsWith('/site/settings/footer')) return 'Footer Settings';
    if (pathname.startsWith('/site/settings')) return 'Settings';
    if (pathname.startsWith('/system/notifications')) return 'Notification Center';
    if (pathname.startsWith('/system/users')) return 'Users & Access';
    if (pathname.startsWith('/system/audit')) return 'System Audit';
    return 'Dashboard';
  }, [pathname]);

  // User display name format
  const userDisplayName = React.useMemo(() => {
    if (!user?.name) return 'Admin';
    return user.name;
  }, [user]);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[#eaedf3] bg-white px-6 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        {/* Left: Sidebar toggle icon + Current Page Title (matching reference) */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="font-bold text-sm tracking-tight text-slate-900">
            {pageTitle}
          </span>
        </div>

        {/* Right: Search, Theme Toggle, Notification Bell, User Profile (matching reference) */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Search Pill */}
          <div
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer text-slate-400 hover:text-slate-600 transition-all text-xs w-48 sm:w-56"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="font-normal text-slate-500">Search...</span>
            <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-400 border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Notification Bell with Badge & Interactive Dropdown */}
          <DropdownMenu open={notifDropdownOpen} onOpenChange={setNotifDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                title="Notifications & Inquiries"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px] text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs pointer-events-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200">
                      Recent (3)
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                {displayedNotifications && displayedNotifications.length > 0 ? (
                  displayedNotifications.map((notif: any) => {
                    const isUnread = !notif.isRead;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                          isUnread ? 'bg-blue-50/30' : 'bg-white'
                        }`}
                      >
                        <div
                          className={`rounded-full p-2 shrink-0 mt-0.5 ${
                            notif.category === 'SECURITY'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : notif.category === 'INQUIRY'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : notif.category === 'BOOKING'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-violet-50 text-violet-600 border border-violet-100'
                          }`}
                        >
                          {notif.category === 'SECURITY' ? (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          ) : notif.category === 'INQUIRY' ? (
                            <Mail className="h-3.5 w-3.5" />
                          ) : notif.category === 'BOOKING' ? (
                            <CalendarCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Bell className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              className={`text-xs truncate ${
                                isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                              }`}
                            >
                              {notif.title}
                            </h4>
                            {isUnread && (
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.timestamp || 'Just now'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-medium text-slate-600">No notifications</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">You&apos;re completely up to date.</p>
                  </div>
                )}
              </div>

              {/* Footer Links */}
              <div className="p-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    router.push('/system/notifications');
                  }}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors cursor-pointer text-[11px]"
                >
                  Notification Center
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    router.push('/system/inbox');
                  }}
                  className="px-3 py-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                >
                  <span>Leads & Inquiries</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none border border-transparent hover:border-slate-200">
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {userDisplayName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {user?.role === 'SUPER_ADMIN' ? 'Admin' : (user?.role || 'Admin')}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl text-xs z-50 animate-in fade-in-50 zoom-in-95"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="font-semibold text-slate-900">{user?.name || 'Administrator'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@gypsym.com'}</div>
                <div className="mt-1.5 inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {user?.role || 'SUPER_ADMIN'}
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => router.push('/site/settings')}
                className="flex items-center px-3 py-2 cursor-pointer rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span>Workspace Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="h-px bg-slate-100 my-1" />

              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                }}
                className="flex items-center px-3 py-2 cursor-pointer rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global CMD+K Dialog */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  );
}
