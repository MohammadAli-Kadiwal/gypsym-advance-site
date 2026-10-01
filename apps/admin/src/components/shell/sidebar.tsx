'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Layers,
  Building2,
  Handshake,
  MessageSquareQuote,
  Briefcase,
  Palette,
  Sliders,
  Settings,
  Users,
  Inbox,
  Mail,
  CalendarCheck,
  ShieldCheck,
  FileCode,
  PanelBottom,
  Search,
  Bell,
  Share2,
  Code,
  ShieldAlert,
  Globe,
  UserCheck,
} from 'lucide-react';
import { useAuth, RoleType } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useBranding, isValidImageUrl } from '@/lib/branding-context';
import { useSystemNotifications } from '@/lib/system-notifications-context';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiredPermission?: string;
  allowedRoles?: RoleType[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const { user, hasPermission } = useAuth();
  const branding = useBranding();
  const { unreadCount, unreadInquiriesCount, unreadBookingsCount } = useSystemNotifications();
  const [logoError, setLogoError] = React.useState(false);
  const resolvedLogo =
    (isValidImageUrl(branding.logoLight) && branding.logoLight) ||
    (isValidImageUrl(branding.favicon) && branding.favicon) ||
    (isValidImageUrl(branding.logoDark) && branding.logoDark) ||
    null;
  const logoUrl = resolvedLogo && !logoError ? resolvedLogo : null;

  const navigationSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'CONTENT & CMS',
      items: [
        {
          label: 'Pages',
          href: '/pages',
          icon: FileText,
        },
        {
          label: 'Country Pages',
          href: '/pages/countries',
          icon: Globe,
        },
        {
          label: 'Blog Posts',
          href: '/editorial/blog',
          icon: BookOpen,
        },
        {
          label: 'Author Profile',
          href: '/editorial/author',
          icon: UserCheck,
        },
        {
          label: 'Services',
          href: '/content/services',
          icon: Layers,
        },
        {
          label: 'Clients',
          href: '/content/clients',
          icon: Building2,
        },
        {
          label: 'Partners',
          href: '/content/partners',
          icon: Handshake,
        },
        {
          label: 'Portfolio',
          href: '/content/portfolio',
          icon: Briefcase,
        },
        {
          label: 'Team Profiles',
          href: '/content/team',
          icon: Users,
        },
        {
          label: 'Testimonials',
          href: '/content/testimonials',
          icon: MessageSquareQuote,
        },
        {
          label: 'Inquiries',
          href: '/content/submissions',
          icon: Inbox,
          badge: unreadInquiriesCount > 0 ? String(unreadInquiriesCount) : undefined,
        },
        {
          label: 'Bookings',
          href: '/bookings',
          icon: CalendarCheck,
          badge: unreadBookingsCount > 0 ? String(unreadBookingsCount) : undefined,
        },
      ],
    },
    {
      title: 'SITE & BRANDING',
      items: [
        {
          label: 'Branding & Colors',
          href: '/site/branding',
          icon: Palette,
        },
        {
          label: 'Navigation',
          href: '/site/navigation',
          icon: Sliders,
        },
        {
          label: 'Social Profiles',
          href: '/site/socials',
          icon: Share2,
        },
        {
          label: 'Footer Settings',
          href: '/settings/footer',
          icon: PanelBottom,
        },
        {
          label: 'SEO & Discoverability',
          href: '/site/seo',
          icon: Search,
        },
        {
          label: 'Analytics & Scripts',
          href: '/site/settings/scripts',
          icon: Code,
        },
        {
          label: 'Settings',
          href: '/site/settings',
          icon: Settings,
        },
        {
          label: 'Email / SMTP',
          href: '/site/settings/email',
          icon: Mail,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
        },
        {
          label: 'Email Templates',
          href: '/site/settings/email-templates',
          icon: FileCode,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
        },
        {
          label: 'reCAPTCHA Protection',
          href: '/site/settings/recaptcha',
          icon: ShieldCheck,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
        },
        {
          label: 'Security & Lockout',
          href: '/site/settings/security',
          icon: ShieldAlert,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          label: 'Notification Center',
          href: '/system/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? String(unreadCount) : undefined,
        },
        {
          label: 'Users & Roles',
          href: '/system/users',
          icon: Users,
          allowedRoles: ['SUPER_ADMIN'],
        },
      ],
    },
  ];

  const isItemVisible = (item: NavItem) => {
    if (!user) return true;
    if (user.role === 'SUPER_ADMIN') return true;
    if (item.allowedRoles && !item.allowedRoles.includes(user.role)) return false;
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
    return true;
  };

  const visibleSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter(isItemVisible),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 flex flex-col border-r border-[#eaedf3] bg-white z-40 transition-all duration-300 shadow-[1px_0_4px_rgba(0,0,0,0.015)] select-none ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-4 border-b border-[#eaedf3]">
        <Link href="/" className="flex items-center space-x-3 overflow-hidden group">
          {/* Logo or Monogram */}
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={branding.companyName}
              className={`object-contain shrink-0 ${collapsed ? 'h-8 w-8' : 'h-8 max-w-[120px]'}`}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              <span className="tracking-tighter">GT</span>
            </div>
          )}

          {!collapsed && !logoUrl && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {branding.companyName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Enterprise Suite
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Categorized Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
        {visibleSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = (() => {
                  if (item.href === '/') return pathname === '/';
                  if (item.href === '/pages') {
                    return pathname === '/pages' || (pathname.startsWith('/pages/') && !pathname.startsWith('/pages/countries'));
                  }
                  if (item.href === '/site/settings') {
                    return pathname === '/site/settings';
                  }
                  return pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                })();

                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
                      isActive
                        ? 'bg-slate-100 text-blue-600 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-100/80 text-blue-700 font-bold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
