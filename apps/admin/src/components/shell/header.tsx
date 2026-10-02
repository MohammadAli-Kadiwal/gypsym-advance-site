'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Sun,
  Moon,
  PanelLeft,
  Menu,
  CheckCheck,
  ShieldCheck,
  Mail,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useBranding } from '@/lib/branding-context';
import { useSystemNotifications } from '@/lib/system-notifications-context';
import { CommandPalette } from './command-palette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';

function getActivePageName(path: string): { title: string; section?: string } {
  if (!path || path === '/') return { title: 'Dashboard', section: 'Overview' };
  if (path.startsWith('/pages/countries')) return { title: 'Country Landing Pages', section: 'Content' };
  if (path.startsWith('/pages/roi-calculator')) return { title: 'ROI Calculator Studio', section: 'Pages' };
  if (path.startsWith('/pages')) return { title: 'Pages CMS', section: 'Content' };
  if (path.startsWith('/tools/roi-calculator')) return { title: 'ROI Calculator Tool', section: 'Tools & Labs' };
  if (path.startsWith('/site/branding')) return { title: 'Branding & Colors', section: 'Site & Branding' };
  if (path.startsWith('/site/navigation')) return { title: 'Navigation & Header', section: 'Site & Branding' };
  if (path.startsWith('/site/seo')) return { title: 'SEO & Discoverability', section: 'Site & Branding' };
  if (path.startsWith('/site/socials')) return { title: 'Social Profiles', section: 'Site & Branding' };
  if (path.startsWith('/settings/footer')) return { title: 'Footer Settings', section: 'Site & Branding' };
  if (path.startsWith('/editorial/blog')) return { title: 'Blog Posts', section: 'Editorial' };
  if (path.startsWith('/content/portfolio')) return { title: 'Portfolio Projects', section: 'Content' };
  if (path.startsWith('/content/services')) return { title: 'Services', section: 'Content' };
  if (path.startsWith('/system/notifications')) return { title: 'Notification Center', section: 'System' };
  if (path.startsWith('/system/users')) return { title: 'Users & Roles', section: 'System' };

  const last = path.split('/').filter(Boolean).pop() || '';
  const title = last.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return { title: title || 'Admin Page' };
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, theme, toggleTheme, logout } = useAuth();
  const { toggleSidebar, toggleMobile } = useSidebar();
  const branding = useBranding();
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSystemNotifications();
  const [notifDropdownOpen, setNotifDropdownOpen] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  const activePage = React.useMemo(() => getActivePageName(pathname || ''), [pathname]);

  const activeLogo = branding.getLogoForTheme(theme);

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

  const displayedNotifications = React.useMemo(() => {
    if (!notifications || notifications.length === 0) return [];
    const unreadItems = notifications.filter((n: any) => !n.isRead);
    if (unreadItems.length > 0) {
      const readItems = notifications.filter((n: any) => n.isRead);
      const combined = [...unreadItems, ...readItems];
      return combined.slice(0, Math.max(unreadItems.length, 3));
    }
    return notifications.slice(0, 3);
  }, [notifications]);

  // Global CMD+K and CMD+J shortcut listeners
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  const userDisplayName = React.useMemo(() => {
    if (!user?.name) return 'Admin';
    return user.name;
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white dark:bg-card px-4 sm:px-6 shadow-xs transition-colors">
        {/* Left Section: Mobile Menu Trigger / Desktop Collapse Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger drawer trigger */}
          <button
            type="button"
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open Mobile Menu"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle icon */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:inline-flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle Desktop Sidebar"
            title="Toggle Sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          {/* Active Page Indicator in Admin Header */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/70 min-w-0">
            {activePage.section && (
              <span className="text-[11px] font-medium text-muted-foreground hidden lg:inline">
                {activePage.section} /
              </span>
            )}
            <span className="text-xs font-bold text-foreground truncate max-w-[180px] lg:max-w-none">
              {activePage.title}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
              Active
            </span>
          </div>

          {/* Mobile Logo indicator (if sidebar is hidden on mobile) */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              {activeLogo && !logoError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeLogo}
                  alt={branding.companyName}
                  className="h-7 w-auto max-w-[100px] object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                  <span>GT</span>
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Right Section: Global Search, Theme Switcher, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search Pill (Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 cursor-pointer text-muted-foreground hover:text-foreground transition-all text-xs w-44 md:w-56"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="font-normal truncate">Search...</span>
            <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-card text-muted-foreground border border-border shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="sm:hidden h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Search"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle theme mode"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-foreground" />
            )}
          </button>

          {/* Notification Bell with Badge & Interactive Dropdown */}
          <DropdownMenu open={notifDropdownOpen} onOpenChange={setNotifDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none cursor-pointer"
                title="Notifications & Inquiries"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card shadow-xs pointer-events-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-80 sm:w-96 rounded-2xl border border-border bg-popover text-popover-foreground p-0 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 overflow-hidden"
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/20">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium border border-border">
                      Recent (3)
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
                {displayedNotifications && displayedNotifications.length > 0 ? (
                  displayedNotifications.map((notif: any) => {
                    const isUnread = !notif.isRead;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                          isUnread ? 'bg-primary/5' : 'bg-transparent'
                        }`}
                      >
                        <div
                          className={`rounded-full p-2 shrink-0 mt-0.5 ${
                            notif.category === 'SECURITY'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : notif.category === 'INQUIRY'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : notif.category === 'BOOKING'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
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
                                isUnread ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
                              }`}
                            >
                              {notif.title}
                            </h4>
                            {isUnread && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                            {notif.timestamp || 'Just now'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-medium text-foreground">No notifications</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">You&apos;re completely up to date.</p>
                  </div>
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 border-t border-border bg-muted/40 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    router.push('/system/notifications');
                  }}
                  className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted font-medium transition-colors cursor-pointer text-[11px]"
                >
                  Notification Center
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    router.push('/content/submissions');
                  }}
                  className="px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                >
                  <span>Inquiries & Leads</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-muted transition-colors focus:outline-none border border-transparent hover:border-border cursor-pointer">
                <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {user?.role === 'SUPER_ADMIN' ? 'Admin' : (user?.role || 'Admin')}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 rounded-2xl border border-border bg-popover text-popover-foreground p-2 shadow-xl text-xs z-50 animate-in fade-in-50 zoom-in-95"
            >
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="font-semibold text-foreground">{user?.name || 'Administrator'}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.email || 'admin@gypsym.com'}</div>
                <div className="mt-1.5 inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {user?.role || 'SUPER_ADMIN'}
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => router.push('/site/settings')}
                className="flex items-center px-3 py-2 cursor-pointer rounded-xl hover:bg-muted text-foreground transition-colors"
              >
                <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span>Workspace Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="h-px bg-border my-1" />

              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                }}
                className="flex items-center px-3 py-2 cursor-pointer rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
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
