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
} from 'lucide-react';
import { useAuth, RoleType } from '@/lib/auth-context';
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
  const { user, theme, toggleTheme, switchRole, logout } = useAuth();
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

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

  const rolesList: RoleType[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER'];

  // Current page title mapping
  const pageTitle = React.useMemo(() => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/pages')) return 'Pages';
    if (pathname.startsWith('/editorial/blog')) return 'Blog Posts';
    if (pathname.startsWith('/content/services')) return 'Services';
    if (pathname.startsWith('/content/clients')) return 'Clients';
    if (pathname.startsWith('/content/partners')) return 'Partners';
    if (pathname.startsWith('/content/testimonials')) return 'Testimonials';
    if (pathname.startsWith('/site/branding')) return 'Branding & Identity';
    if (pathname.startsWith('/site/navigation')) return 'Navigation';
    if (pathname.startsWith('/site/settings')) return 'Settings';
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
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
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => router.push('/system/inbox')}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Notifications & Inquiries"
            >
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                2
              </span>
            </button>
          </div>

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

              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Switch Test Role
              </div>
              <div className="grid grid-cols-2 gap-1 px-1 mb-1">
                {rolesList.map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg text-left transition-colors ${
                      user?.role === r
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {r.split('_')[0]}
                  </button>
                ))}
              </div>

              <DropdownMenuSeparator className="h-px bg-slate-100 my-1" />

              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push('/login');
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
