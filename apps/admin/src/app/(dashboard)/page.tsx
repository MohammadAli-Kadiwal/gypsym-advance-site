'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  Building2,
  Layers,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  CalendarCheck,
  Inbox,
  Handshake,
  Image as ImageIcon,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { useCmsCollection } from '@/lib/store';
import { fetchApi } from '@/lib/api-client';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { Button } from '@/components/ui/button';
import { getSiteUrl } from '@/lib/site-url';

interface MetricCounts {
  pages: number;
  publishedPages: number;
  blogs: number;
  publishedBlogs: number;
  services: number;
  activeServices: number;
  clients: number;
  activeClients: number;
  partners: number;
  activePartners: number;
  bookings: number;
  upcomingBookings: number;
  inquiries: number;
  newInquiries: number;
  media: number;
}

export default function DashboardPage() {
  const { data: localPages } = useCmsCollection('pages');
  const { data: localBlogs } = useCmsCollection('blogs');
  const { data: localMedia } = useCmsCollection('media');
  const { data: localServices } = useCmsCollection('services');

  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date | null>(null);

  const [counts, setCounts] = React.useState<MetricCounts>({
    pages: 0,
    publishedPages: 0,
    blogs: 0,
    publishedBlogs: 0,
    services: 0,
    activeServices: 0,
    clients: 0,
    activeClients: 0,
    partners: 0,
    activePartners: 0,
    bookings: 0,
    upcomingBookings: 0,
    inquiries: 0,
    newInquiries: 0,
    media: 0,
  });

  // Load live dynamic metrics from backend APIs with graceful fallback to store collections
  const loadDynamicMetrics = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [
        pagesRes,
        blogsRes,
        servicesRes,
        clientsRes,
        partnersRes,
        bookingsRes,
        inquiriesRes,
      ] = await Promise.allSettled([
        fetchApi<any>('/pages'),
        fetchApi<any>('/cms/blog').catch(() => fetchApi<any>('/blog')),
        fetchApi<any>('/services'),
        fetchApi<any>('/clients'),
        fetchApi<any>('/partners'),
        fetchApi<any>('/bookings/metrics').catch(() => fetchApi<any>('/bookings?limit=1')),
        fetchApi<any>('/inquiries?limit=1'),
      ]);

      const nextCounts: MetricCounts = {
        pages: localPages.length || 0,
        publishedPages: localPages.filter((p: any) => p.status === 'PUBLISHED' || !p.status).length || 0,
        blogs: localBlogs.length || 0,
        publishedBlogs: localBlogs.filter((b: any) => b.status === 'PUBLISHED').length || 0,
        services: localServices.length || 0,
        activeServices: localServices.filter((s: any) => s.status === 'PUBLISHED' || !s.status).length || 0,
        clients: 0,
        activeClients: 0,
        partners: 0,
        activePartners: 0,
        bookings: 0,
        upcomingBookings: 0,
        inquiries: 0,
        newInquiries: 0,
        media: localMedia.length || 0,
      };

      // 1. Pages
      if (pagesRes.status === 'fulfilled' && pagesRes.value) {
        const raw = pagesRes.value;
        const list = Array.isArray(raw) ? raw : raw?.data || [];
        if (Array.isArray(list)) {
          nextCounts.pages = list.length;
          nextCounts.publishedPages = list.filter((p: any) => p.status === 'PUBLISHED' || !p.status).length;
        }
      }

      // 2. Blog Posts
      if (blogsRes.status === 'fulfilled' && blogsRes.value) {
        const raw = blogsRes.value;
        const list = Array.isArray(raw) ? raw : raw?.data || [];
        if (Array.isArray(list)) {
          nextCounts.blogs = list.length;
          nextCounts.publishedBlogs = list.filter((b: any) => b.status === 'PUBLISHED').length;
        }
      }

      // 3. Services
      if (servicesRes.status === 'fulfilled' && servicesRes.value) {
        const raw = servicesRes.value;
        const list = Array.isArray(raw) ? raw : raw?.data || [];
        if (Array.isArray(list)) {
          nextCounts.services = list.length;
          nextCounts.activeServices = list.filter((s: any) => s.status === 'PUBLISHED' || !s.status).length;
        }
      }

      // 4. Clients
      if (clientsRes.status === 'fulfilled' && clientsRes.value) {
        const raw = clientsRes.value;
        const list = Array.isArray(raw) ? raw : raw?.data || [];
        if (Array.isArray(list)) {
          nextCounts.clients = list.length;
          nextCounts.activeClients = list.filter((c: any) => c.isActive !== false).length;
        }
      }

      // 5. Partners
      if (partnersRes.status === 'fulfilled' && partnersRes.value) {
        const raw = partnersRes.value;
        const list = Array.isArray(raw) ? raw : raw?.data || [];
        if (Array.isArray(list)) {
          nextCounts.partners = list.length;
          nextCounts.activePartners = list.filter((p: any) => p.status === 'PUBLISHED' || !p.status).length;
        }
      }

      // 6. Bookings
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
        const raw = bookingsRes.value;
        const metrics = raw?.data || raw;
        if (metrics && typeof metrics.total === 'number') {
          nextCounts.bookings = metrics.total;
          nextCounts.upcomingBookings = metrics.upcoming || 0;
        } else if (metrics?.pagination && typeof metrics.pagination.total === 'number') {
          nextCounts.bookings = metrics.pagination.total;
        }
      }

      // 7. Inquiries
      if (inquiriesRes.status === 'fulfilled' && inquiriesRes.value) {
        const raw = inquiriesRes.value;
        const data = raw?.data || raw;
        if (typeof data?.total === 'number') {
          nextCounts.inquiries = data.total;
        } else if (Array.isArray(data?.items)) {
          nextCounts.inquiries = data.items.length;
        }
      }

      setCounts(nextCounts);
      setLastRefreshed(new Date());
    } catch {
      // Fallback already populated with local storage store values
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [localPages, localBlogs, localMedia, localServices]);

  React.useEffect(() => {
    loadDynamicMetrics();
  }, [loadDynamicMetrics]);

  // Combined total items registered in system
  const totalEntities =
    counts.pages + counts.blogs + counts.services + counts.clients + counts.partners + counts.media;

  // Donut chart segments calculated dynamically
  const donutSegments = React.useMemo(() => {
    const rawSegments = [
      { label: 'Pages', count: counts.pages, color: 'hsl(var(--primary))' },
      { label: 'Articles', count: counts.blogs, color: '#10b981' },
      { label: 'Services', count: counts.services, color: '#f59e0b' },
      { label: 'Clients', count: counts.clients, color: '#6366f1' },
      { label: 'Partners', count: counts.partners, color: '#ec4899' },
      { label: 'Media', count: counts.media, color: '#8b5cf6' },
    ];

    const circumference = 251.327; // 2 * PI * 40
    const total = rawSegments.reduce((sum, s) => sum + s.count, 0);

    if (total === 0) {
      return { segments: [], total: 0 };
    }

    let accumulatedOffset = 0;
    const computed = rawSegments
      .filter((s) => s.count > 0)
      .map((s) => {
        const ratio = s.count / total;
        const strokeLength = ratio * circumference;
        const offset = accumulatedOffset;
        accumulatedOffset += strokeLength;
        return {
          ...s,
          ratio,
          percentage: Math.round(ratio * 100),
          strokeDasharray: `${strokeLength} ${circumference}`,
          strokeDashoffset: -offset,
        };
      });

    return { segments: computed, total };
  }, [counts]);

  return (
    <AdminContentContainer variant="standard">
      <AdminPageHeader
        title="Dashboard"
        description="Live operational telemetry, content inventory, and platform metrics."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDynamicMetrics(true)}
              disabled={isRefreshing}
              className="gap-1.5 cursor-pointer text-xs"
              title="Refresh all metrics from database"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
            </Button>
            <Button asChild variant="default" size="sm" className="gap-1.5 cursor-pointer text-xs">
              <a href={getSiteUrl()} target="_blank" rel="noreferrer">
                <span>View Live Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        }
      />

      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6 sm:p-8 shadow-xs">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Enterprise Suite</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back 👋
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Monitor and manage live services, editorial articles, client partnerships, discovery consultations, and system configurations.
          </p>

          {lastRefreshed && (
            <div className="pt-1 flex items-center space-x-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live telemetry synchronized at {lastRefreshed.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Primary Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pages */}
        <Link
          href="/pages"
          className="group p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Pages
            </span>
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div suppressHydrationWarning className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="inline-block w-8 h-8 rounded-md bg-muted animate-pulse" />
              ) : (
                counts.pages
              )}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[11px]">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                {counts.publishedPages} Live
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">published routes</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Articles */}
        <Link
          href="/editorial/blog"
          className="group p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Published Articles
            </span>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-500/20 transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div suppressHydrationWarning className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="inline-block w-8 h-8 rounded-md bg-muted animate-pulse" />
              ) : (
                counts.blogs
              )}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="h-3 w-3 mr-0.5" />
                {counts.publishedBlogs} Live
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">articles indexed</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Services */}
        <Link
          href="/content/services"
          className="group p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Practice Services
            </span>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-500/20 transition-colors">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div suppressHydrationWarning className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="inline-block w-8 h-8 rounded-md bg-muted animate-pulse" />
              ) : (
                counts.services
              )}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                {counts.activeServices} Active
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">solutions live</span>
            </div>
          </div>
        </Link>

        {/* Card 4: Clients */}
        <Link
          href="/content/clients"
          className="group p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Client Alliances
            </span>
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-indigo-500/20 transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div suppressHydrationWarning className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <span className="inline-block w-8 h-8 rounded-md bg-muted animate-pulse" />
              ) : (
                counts.clients
              )}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                {counts.activeClients} Active
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">marquee accounts</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Operational Activity & Inbound Pulse Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric A: Discovery Bookings */}
        <Link
          href="/bookings"
          className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/50 transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Discovery Calls
            </span>
            <div suppressHydrationWarning className="text-2xl font-black text-foreground">
              {isLoading ? '...' : counts.bookings}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock3 className="h-3 w-3 text-emerald-500" />
              <span>{counts.upcomingBookings} upcoming appointments</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </Link>

        {/* Metric B: Form Submissions */}
        <Link
          href="/content/submissions"
          className="p-4 rounded-xl bg-card border border-border hover:border-blue-500/50 transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Inbound Inquiries
            </span>
            <div suppressHydrationWarning className="text-2xl font-black text-foreground">
              {isLoading ? '...' : counts.inquiries}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-blue-500" />
              <span>Enterprise client leads</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Inbox className="h-5 w-5" />
          </div>
        </Link>

        {/* Metric C: Strategic Partners */}
        <Link
          href="/content/partners"
          className="p-4 rounded-xl bg-card border border-border hover:border-pink-500/50 transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Ecosystem Partners
            </span>
            <div suppressHydrationWarning className="text-2xl font-black text-foreground">
              {isLoading ? '...' : counts.partners}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Handshake className="h-3 w-3 text-pink-500" />
              <span>Technology & cloud alliances</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Handshake className="h-5 w-5" />
          </div>
        </Link>

        {/* Metric D: Media Library */}
        <Link
          href="/media"
          className="p-4 rounded-xl bg-card border border-border hover:border-purple-500/50 transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              DAM Media Library
            </span>
            <div suppressHydrationWarning className="text-2xl font-black text-foreground">
              {isLoading ? '...' : counts.media}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ImageIcon className="h-3 w-3 text-purple-500" />
              <span>Digital assets indexed</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ImageIcon className="h-5 w-5" />
          </div>
        </Link>
      </div>

      {/* 4. Lower Row: Telemetry Chart & Content Structure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Traffic & Publishing Velocity (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Traffic & Publishing Velocity
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monthly visitor requests and editorial release trend
              </p>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>
          </div>

          {/* SVG Telemetry Chart */}
          <div className="pt-4 pb-2">
            <div className="h-48 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="1" />

                {/* Shaded Area */}
                <path
                  d="M 0 160 Q 100 140, 180 90 T 320 110 T 450 40 T 600 65 L 600 170 L 0 170 Z"
                  fill="url(#areaGradient)"
                />

                {/* Smooth Curve Line */}
                <path
                  d="M 0 160 Q 100 140, 180 90 T 320 110 T 450 40 T 600 65"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Highlight Nodes */}
                <circle cx="180" cy="90" r="4" fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth="2" />
                <circle cx="450" cy="40" r="5" fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth="2" />
                <circle cx="600" cy="65" r="4" fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth="2" />
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground pt-2 border-t border-border px-1">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* Right: Content Structure Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Content Structure Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live entities registered in Gypsym database
            </p>
          </div>

          {/* Dynamic Donut Chart Visual */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="hsl(var(--border))"
                  strokeWidth="11"
                />
                {/* Dynamically Computed Segments */}
                {donutSegments.segments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="11"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                ))}
              </svg>

              {/* Center Content */}
              <div className="absolute flex flex-col items-center text-center">
                <span suppressHydrationWarning className="text-2xl font-black text-foreground">
                  {isLoading ? '...' : totalEntities}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total Items
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border text-xs">
            <Link
              href="/pages"
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-foreground font-medium">Pages</span>
              </div>
              <span suppressHydrationWarning className="font-bold text-foreground">
                {counts.pages}
              </span>
            </Link>

            <Link
              href="/editorial/blog"
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-foreground font-medium">Articles</span>
              </div>
              <span suppressHydrationWarning className="font-bold text-foreground">
                {counts.blogs}
              </span>
            </Link>

            <Link
              href="/content/services"
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-foreground font-medium">Services</span>
              </div>
              <span suppressHydrationWarning className="font-bold text-foreground">
                {counts.services}
              </span>
            </Link>

            <Link
              href="/content/clients"
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span className="text-foreground font-medium">Clients</span>
              </div>
              <span suppressHydrationWarning className="font-bold text-foreground">
                {counts.clients}
              </span>
            </Link>

            <Link
              href="/content/partners"
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                <span className="text-foreground font-medium">Partners</span>
              </div>
              <span suppressHydrationWarning className="font-bold text-foreground">
                {counts.partners}
              </span>
            </Link>

            <Link
              href="/media"
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span className="text-foreground font-medium">Media</span>
              </div>
              <span suppressHydrationWarning className="font-bold text-foreground">
                {counts.media}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AdminContentContainer>
  );
}
