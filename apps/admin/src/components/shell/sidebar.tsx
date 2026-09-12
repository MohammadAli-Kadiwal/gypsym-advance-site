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
  MessageSquareQuote,
  Briefcase,
  Palette,
  Sliders,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';


interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);



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
          label: 'Blog Posts',
          href: '/editorial/blog',
          icon: BookOpen,
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
          label: 'Portfolio',
          href: '/content/portfolio',
          icon: Briefcase,
        },
        {
          label: 'Testimonials',
          href: '/content/testimonials',
          icon: MessageSquareQuote,
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
          label: 'Settings',
          href: '/site/settings',
          icon: Settings,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          label: 'Users & Roles',
          href: '/system/users',
          icon: Users,
        },
      ],
    },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 flex flex-col border-r border-[#eaedf3] bg-white z-40 transition-all duration-300 shadow-[1px_0_4px_rgba(0,0,0,0.015)] select-none ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#eaedf3]">
        <Link href="/" className="flex items-center space-x-3 overflow-hidden group">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            <span className="tracking-tighter">GT</span>
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                Gypsym Technology
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Enterprise Suite
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Categorized Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

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

      {/* Bottom Organization / User Status Card (Matching Reference) */}
      <div className="p-3 border-t border-[#eaedf3]">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 transition-colors">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                AS
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-800 truncate">
                  Gypsym Enterprise
                </span>
                <div className="flex items-center space-x-1">
                  <span className="inline-block px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 font-semibold text-[9px] border border-blue-100">
                    Active Portal
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              title="Gypsym Enterprise (Active Portal)"
              className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              AS
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
