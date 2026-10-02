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
  Calculator,
  Tags,
} from 'lucide-react';
import { useAuth, RoleType } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useBranding } from '@/lib/branding-context';
import { useSystemNotifications } from '@/lib/system-notifications-context';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  const { collapsed, mobileOpen, setMobileOpen, closeMobile } = useSidebar();
  const { user, theme, hasPermission } = useAuth();
  const branding = useBranding();
  const { unreadCount, unreadInquiriesCount, unreadBookingsCount } = useSystemNotifications();
  const [logoError, setLogoError] = React.useState(false);

  const activeLogo = branding.getLogoForTheme(theme);

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
          label: 'Blog Categories',
          href: '/editorial/categories',
          icon: Tags,
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
      title: 'TOOLS & LABS',
      items: [
        {
          label: 'ROI Calculator',
          href: '/tools/roi-calculator',
          icon: Calculator,
          badge: 'New',
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

  const renderNavList = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-4 border-b border-border/80 shrink-0">
          <Link
            href="/"
            onClick={isMobile ? closeMobile : undefined}
            className="flex items-center space-x-3 overflow-hidden group cursor-pointer"
          >
            {activeLogo && !logoError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeLogo}
                alt={branding.companyName}
                className={`object-contain shrink-0 ${isCollapsed ? 'h-8 w-8' : 'h-8 max-w-[130px]'}`}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                <span className="tracking-tighter">GT</span>
              </div>
            )}

            {!isCollapsed && !activeLogo && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                  {branding.companyName}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  Enterprise Suite
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {visibleSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {section.title}
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = (() => {
                    if (item.href === '/') return pathname === '/';
                    if (item.href === '/pages') {
                      return (
                        pathname === '/pages' ||
                        (pathname.startsWith('/pages/') && !pathname.startsWith('/pages/countries'))
                      );
                    }
                    if (item.href === '/site/settings') {
                      return pathname === '/site/settings';
                    }
                    return (
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(`${item.href}/`))
                    );
                  })();

                  const navItemNode = (
                    <Link
                      href={item.href}
                      onClick={isMobile ? closeMobile : undefined}
                      className={`flex items-center ${
                        isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                      } py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-2xs border-r-2 border-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-medium transition-colors ${
                            isActive
                              ? 'bg-primary/20 text-primary font-bold'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href + item.label}>
                        <TooltipTrigger asChild>{navItemNode}</TooltipTrigger>
                        <TooltipContent side="right" className="font-semibold text-xs">
                          <div className="flex items-center gap-2">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[10px]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.href + item.label}>{navItemNode}</React.Fragment>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (Sticky, Collapsible) */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen shrink-0 border-r border-border bg-sidebar z-40 transition-all duration-300 select-none ${
          collapsed ? 'w-[72px]' : 'w-[272px]'
        }`}
      >
        {renderNavList(false)}
      </aside>

      {/* Mobile Off-Canvas Drawer (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r border-border">
          {renderNavList(true)}
        </SheetContent>
      </Sheet>
    </>
  );
}
