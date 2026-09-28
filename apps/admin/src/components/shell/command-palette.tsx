'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Search,
  FileText,
  Layers,
  Users,
  BookOpen,
  Building2,
  Handshake,
  MessageSquareQuote,
  Palette,
  Sliders,
  Bell,
  Mail,
  Moon,
  Sun,
  CalendarCheck,
  ShieldCheck,
  FileCode,
  PanelBottom,
  ExternalLink,
  PanelLeft,
  CheckCheck,
  X,
  LayoutDashboard,
  Settings,
  ArrowRight,
  Briefcase,
  Share2,
  Code,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { useSystemNotifications } from '@/lib/system-notifications-context';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Pages' | 'Content' | 'Leads' | 'Bookings' | 'Site' | 'System' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  path?: string;
  action?: () => void;
  badge?: string;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { toggleTheme, theme } = useAuth();
  const { toggleSidebar } = useSidebar();
  const { notifications, markAllAsRead, unreadCount } = useSystemNotifications();

  const [query, setQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setSelectedCategory('All');
    }
  }, [open]);

  // Static Navigation & Studio Items
  const staticCommands = React.useMemo<CommandItem[]>(
    () => [
      // Navigation & Dashboards
      {
        id: 'nav-dashboard',
        title: 'Executive Dashboard',
        subtitle: 'Telemetry, edge signals & KPIs',
        path: '/',
        category: 'Pages',
        icon: LayoutDashboard,
        keywords: 'home stats metrics analytics overview',
      },
      {
        id: 'nav-pages',
        title: 'Pages Directory',
        subtitle: 'Manage all site landing pages',
        path: '/pages',
        category: 'Pages',
        icon: FileText,
        keywords: 'pages sitemap list landing',
      },
      {
        id: 'nav-home',
        title: 'Home Page Studio',
        subtitle: 'Hero, Daylight and conversion sections',
        path: '/pages/home',
        category: 'Pages',
        icon: FileText,
        keywords: 'homepage hero daylight visual editor',
      },
      {
        id: 'nav-about',
        title: 'About Page Studio',
        subtitle: 'Company story, vision and values',
        path: '/pages/about',
        category: 'Pages',
        icon: FileText,
        keywords: 'about mission story',
      },
      {
        id: 'nav-book',
        title: 'Book Discovery Studio',
        subtitle: 'Discovery call scheduling layout',
        path: '/pages/book',
        category: 'Pages',
        icon: CalendarCheck,
        keywords: 'calendar booking consultation appointment',
      },
      {
        id: 'nav-contact',
        title: 'Contact Studio',
        subtitle: 'Global inquiries and direct channels',
        path: '/pages/contact',
        category: 'Pages',
        icon: Mail,
        keywords: 'contact reach email form',
      },
      {
        id: 'nav-portfolio',
        title: 'Portfolio & Case Studies Studio',
        subtitle: 'Featured client e-commerce architectures',
        path: '/pages/portfolio',
        category: 'Pages',
        icon: Briefcase,
        keywords: 'work portfolio cases client projects showcase',
      },

      // Content & Collections
      {
        id: 'content-services',
        title: 'Services & Capabilities',
        subtitle: 'Shopify architecture and engineering services',
        path: '/content/services',
        category: 'Content',
        icon: Layers,
        keywords: 'services capabilities offerings solutions',
      },
      {
        id: 'content-clients',
        title: 'Clients & Global Brands',
        subtitle: 'Brand logo roster and trust proof',
        path: '/content/clients',
        category: 'Content',
        icon: Building2,
        keywords: 'clients brands logos customers',
      },
      {
        id: 'content-partners',
        title: 'Partners & Alliances',
        subtitle: 'Technology and platform partner network',
        path: '/content/partners',
        category: 'Content',
        icon: Handshake,
        keywords: 'partners ecosystem shopify plus klaviyo',
      },
      {
        id: 'content-testimonials',
        title: 'Testimonials & Reviews',
        subtitle: 'Client feedback and enterprise ratings',
        path: '/content/testimonials',
        category: 'Content',
        icon: MessageSquareQuote,
        keywords: 'reviews quotes feedback trust',
      },
      {
        id: 'content-team',
        title: 'Team Profiles',
        subtitle: 'Leadership and specialist architects',
        path: '/content/team',
        category: 'Content',
        icon: Users,
        keywords: 'team staff architects people leadership',
      },
      {
        id: 'content-blog',
        title: 'Blog Articles & Editorial',
        subtitle: 'E-commerce insights and engineering articles',
        path: '/editorial/blog',
        category: 'Content',
        icon: BookOpen,
        keywords: 'blog posts news editorial articles insights',
      },
      {
        id: 'content-inquiries',
        title: 'Inquiries & Form Submissions',
        subtitle: 'Inbound contact leads and prospect triage',
        path: '/content/submissions',
        category: 'Leads',
        icon: Mail,
        keywords: 'inquiries leads forms contact prospects submissions',
      },
      {
        id: 'content-bookings',
        title: 'Discovery Call Bookings',
        subtitle: 'Client consultation calendar and slots',
        path: '/bookings',
        category: 'Bookings',
        icon: CalendarCheck,
        keywords: 'bookings appointments discovery calls schedule',
      },

      // Site & Settings
      {
        id: 'site-branding',
        title: 'Branding & Identity',
        subtitle: 'Logos, monograms, typography & palettes',
        path: '/site/branding',
        category: 'Site',
        icon: Palette,
        keywords: 'brand logo favicon colors typography fonts',
      },
      {
        id: 'site-navigation',
        title: 'Navigation Menus',
        subtitle: 'Header navbar and interactive flyouts',
        path: '/site/navigation',
        category: 'Site',
        icon: Sliders,
        keywords: 'navigation menu header links navbar',
      },
      {
        id: 'site-socials',
        title: 'Social Profiles & Channels',
        subtitle: 'Official public profiles (LinkedIn, X, GitHub, YouTube)',
        path: '/site/socials',
        category: 'Site',
        icon: Share2,
        keywords: 'social profiles links media linkedin twitter github instagram youtube channels',
      },
      {
        id: 'site-footer',
        title: 'Footer Settings',
        subtitle: 'Footer columns, links, badges & full width',
        path: '/settings/footer',
        category: 'Site',
        icon: PanelBottom,
        keywords: 'footer columns legal copyright links layout',
      },
      {
        id: 'site-seo',
        title: 'SEO & Metadata Studio',
        subtitle: 'Meta titles, OpenGraph and page-by-page SEO health score',
        path: '/site/seo',
        category: 'Site',
        icon: Search,
        keywords: 'seo metadata score google search opengraph titles sitemap',
      },
      {
        id: 'site-scripts',
        title: 'Analytics & Custom Scripts',
        subtitle: 'Google Analytics (GA4), Meta Pixel, GTM, and custom code injection',
        path: '/site/settings/scripts',
        category: 'Site',
        icon: Code,
        keywords: 'google analytics ga4 meta facebook pixel gtm scripts tracking head body injection code',
      },
      {
        id: 'site-security',
        title: 'Security & Login Protection',
        subtitle: 'Brute-force IP lockouts, 5-attempt bans, and 7-day session duration',
        path: '/site/settings/security',
        category: 'Site',
        icon: ShieldAlert,
        keywords: 'security login lockout brute force password block ip session expiry attempts protection',
      },
      {
        id: 'site-settings',
        title: 'General Settings',
        subtitle: 'Core site attributes and parameters',
        path: '/site/settings',
        category: 'Site',
        icon: Settings,
        keywords: 'settings configuration general site',
      },
      {
        id: 'site-email',
        title: 'Email & SMTP Transport',
        subtitle: 'Outbound mail credentials and lead dispatch',
        path: '/site/settings/email',
        category: 'Site',
        icon: Mail,
        keywords: 'email smtp notifications transport credentials',
      },
      {
        id: 'site-email-templates',
        title: 'Email Templates',
        subtitle: 'Auto-reply and notification HTML templates',
        path: '/site/settings/email-templates',
        category: 'Site',
        icon: FileCode,
        keywords: 'email templates autoresponder html notifications',
      },
      {
        id: 'site-recaptcha',
        title: 'reCAPTCHA Protection',
        subtitle: 'Google reCAPTCHA v2/v3 anti-abuse defense',
        path: '/site/settings/recaptcha',
        category: 'Site',
        icon: ShieldCheck,
        keywords: 'recaptcha security spam anti-bot bot protection',
      },

      // System & Administration
      {
        id: 'sys-notifications',
        title: 'System Notification Center',
        subtitle: 'Live alerts, lead triage and audit signals',
        path: '/system/notifications',
        category: 'System',
        icon: Bell,
        keywords: 'notifications alerts signals unread center',
      },
      {
        id: 'sys-users',
        title: 'Users & IAM Roles',
        subtitle: 'Admin accounts and RBAC access permissions',
        path: '/system/users',
        category: 'System',
        icon: Users,
        keywords: 'users accounts members permissions roles access iam',
      },

      // Quick Actions
      {
        id: 'act-view-site',
        title: 'Open Live Website',
        subtitle: 'Visit public site in a new browser tab',
        category: 'Actions',
        icon: ExternalLink,
        action: () => {
          if (typeof window !== 'undefined') {
            window.open(window.location.origin.replace(':3001', ':3000'), '_blank');
          }
        },
        keywords: 'website preview live open public visit',
      },
      {
        id: 'act-toggle-theme',
        title: 'Toggle Color Theme',
        subtitle: `Switch to ${theme === 'dark' ? 'Daylight Light' : 'Cosmic Dark'} mode`,
        category: 'Actions',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => toggleTheme(),
        keywords: 'theme dark light mode color daylight toggle',
      },
      {
        id: 'act-toggle-sidebar',
        title: 'Toggle Workspace Sidebar',
        subtitle: 'Expand or collapse the navigation sidebar',
        category: 'Actions',
        icon: PanelLeft,
        action: () => toggleSidebar(),
        keywords: 'sidebar collapse expand toggle workspace',
      },
      {
        id: 'act-mark-read',
        title: 'Mark All Notifications Read',
        subtitle: `Acknowledge all ${unreadCount > 0 ? unreadCount : ''} pending alerts`,
        category: 'Actions',
        icon: CheckCheck,
        action: () => markAllAsRead(),
        keywords: 'mark read notifications clear dismiss all acknowledge',
      },
    ],
    [theme, toggleTheme, toggleSidebar, markAllAsRead, unreadCount]
  );

  // Dynamic live inquiries from System Notifications
  const dynamicInquiryCommands = React.useMemo<CommandItem[]>(() => {
    return notifications
      .filter((n) => n.category === 'INQUIRY')
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.message,
        path: '/content/submissions',
        category: 'Leads' as const,
        icon: Mail,
        badge: item.badge || 'INQUIRY',
        keywords: `${item.senderName || ''} ${item.senderEmail || ''} ${item.companyName || ''} inquiry lead prospect`,
      }));
  }, [notifications]);

  // Dynamic live bookings from System Notifications
  const dynamicBookingCommands = React.useMemo<CommandItem[]>(() => {
    return notifications
      .filter((n) => n.category === 'BOOKING')
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.message,
        path: '/bookings',
        category: 'Bookings' as const,
        icon: CalendarCheck,
        badge: item.badge || 'BOOKING',
        keywords: `${item.senderName || ''} ${item.senderEmail || ''} booking discovery consultation call appointment`,
      }));
  }, [notifications]);

  // Combined searchable command items
  const allCommands = React.useMemo(() => {
    return [...staticCommands, ...dynamicInquiryCommands, ...dynamicBookingCommands];
  }, [staticCommands, dynamicInquiryCommands, dynamicBookingCommands]);

  // Filter commands by search query and category tab
  const filteredCommands = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    return allCommands.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Query filter
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const subMatch = item.subtitle?.toLowerCase().includes(q) ?? false;
      const catMatch = item.category.toLowerCase().includes(q);
      const kwMatch = item.keywords?.toLowerCase().includes(q) ?? false;
      return titleMatch || subMatch || catMatch || kwMatch;
    });
  }, [allCommands, query, selectedCategory]);

  // Reset selectedIndex if it goes out of bounds
  React.useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(0);
    }
  }, [filteredCommands.length, selectedIndex]);

  // Auto-scroll the active item into view
  React.useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>(`[data-cmd-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleExecute = (item: CommandItem) => {
    onOpenChange(false);
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(filteredCommands.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecute(filteredCommands[selectedIndex]);
      }
    }
  };

  const categories = ['All', 'Pages', 'Content', 'Leads', 'Bookings', 'Site', 'System', 'Actions'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="p-0 max-w-2xl w-[92vw] sm:w-full overflow-hidden shadow-2xl border border-slate-200/90 bg-white rounded-2xl sm:rounded-3xl"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="h-5 w-5 text-blue-600 mr-3 shrink-0" />
          <input
            placeholder="Type to search pages, live leads, bookings, or quick actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-normal"
            autoFocus
          />

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-100 text-[10px] font-mono text-slate-500 font-semibold cursor-pointer hover:bg-slate-200 transition-colors"
            >
              ESC
            </kbd>
          </div>
        </div>

        {/* Quick Filter Category Pills */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y-0">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No matching results found</p>
              <p className="text-[11px] text-slate-400">
                Try searching for a page name, client inquiry, or booking appointment.
              </p>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id + idx}
                  data-cmd-index={idx}
                  type="button"
                  onClick={() => handleExecute(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-950 ring-1 ring-blue-500/30 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 transition-colors ${
                        item.category === 'Leads'
                          ? 'bg-blue-100/70 text-blue-600'
                          : item.category === 'Bookings'
                          ? 'bg-emerald-100/70 text-emerald-600'
                          : item.category === 'Actions'
                          ? 'bg-amber-100/70 text-amber-600'
                          : item.category === 'Site'
                          ? 'bg-violet-100/70 text-violet-600'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 text-[9px] font-bold font-mono">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                        item.category === 'Leads'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.category === 'Bookings'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.category === 'Actions'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.category}
                    </span>

                    {isSelected ? (
                      <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-mono font-bold shadow-2xs">
                        <span>↵</span>
                      </span>
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] shadow-2xs">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] shadow-2xs">
                ↓
              </kbd>
              <span className="text-slate-400">navigate</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] shadow-2xs">
                ↵
              </kbd>
              <span className="text-slate-400">select</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] shadow-2xs">
                esc
              </kbd>
              <span className="text-slate-400">close</span>
            </span>
          </div>

          <span className="text-slate-400 font-mono text-[10px]">
            {filteredCommands.length} command{filteredCommands.length === 1 ? '' : 's'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
