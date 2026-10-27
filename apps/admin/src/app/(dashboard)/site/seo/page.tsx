'use client';

import * as React from 'react';
import {
  Globe,
  LayoutDashboard,
  FileText,
  Bot,
  Sparkles,
  ArrowRight,
  FileCode,
  Shield,
  FileJson,
  Share2,
  Link2,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import { seoService } from '@/services/seo.service';
import { AdminContentContainer, AdminPageHeader, AdminPageLoadingState } from '@/components/layout/admin-page';

import { SeoDashboardTab } from './_components/seo-dashboard-tab';
import { GlobalSeoTab } from './_components/global-seo-tab';
import { PageSeoTab } from './_components/page-seo-tab';
import { EditPageSeoDialog } from './_components/edit-page-seo-dialog';
import { PageAuditDialog } from './_components/page-audit-dialog';
import { AeoTab } from './_components/aeo-tab';
import { GeoTab } from './_components/geo-tab';
import { RedirectsTab } from './_components/redirects-tab';
import { SitemapTab } from './_components/sitemap-tab';
import { RobotsTab } from './_components/robots-tab';
import { SocialPreviewTab } from './_components/social-preview-tab';
import { SchemaTab } from './_components/schema-tab';
import { CanonicalsTab } from './_components/canonicals-tab';
import { TemplatesSettingsTab } from './_components/templates-settings-tab';
import { GlobalSeoSettings, PageSeoItem } from './_components/types';

const TAB_PARAM_MAP: Record<string, string> = {
  dashboard: 'dashboard',
  global: 'global-seo',
  pages: 'page-seo',
  aeo: 'aeo',
  geo: 'geo',
  redirects: 'redirects',
  sitemap: 'sitemap',
  robots: 'robots',
  schema: 'schema',
  previews: 'previews',
  canonicals: 'canonicals',
  settings: 'settings',
};

function resolveTabFromParam(param: string | null): string {
  if (!param) return 'dashboard';
  const clean = param.toLowerCase().trim().replace(/[\s_]+/g, '-');
  if (['page-seo', 'pages-seo', 'pages', 'page', 'pageseo', 'page-by-page'].includes(clean)) return 'pages';
  if (['global-seo', 'global', 'globalseo'].includes(clean)) return 'global';
  if (['dashboard', 'dash'].includes(clean)) return 'dashboard';
  if (['aeo', 'answer-engine'].includes(clean)) return 'aeo';
  if (['geo', 'generative-engine'].includes(clean)) return 'geo';
  if (['redirects', 'redirect'].includes(clean)) return 'redirects';
  if (['sitemap', 'sitemaps'].includes(clean)) return 'sitemap';
  if (['robots', 'robots-txt', 'robot'].includes(clean)) return 'robots';
  if (['schema', 'structured-data', 'jsonld'].includes(clean)) return 'schema';
  if (['previews', 'preview', 'social-previews'].includes(clean)) return 'previews';
  if (['canonicals', 'canonical', 'hreflang'].includes(clean)) return 'canonicals';
  if (['settings', 'templates', 'template'].includes(clean)) return 'settings';
  return 'dashboard';
}

function SeoManagementContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState<string>(() => resolveTabFromParam(searchParams.get('tab')));

  React.useEffect(() => {
    const rawTab = searchParams.get('tab');
    if (rawTab) {
      const fromUrl = resolveTabFromParam(rawTab);
      if (fromUrl && fromUrl !== activeTab) {
        setActiveTab(fromUrl);
      }
    }
  }, [searchParams]);

  const handleTabChange = (val: string, rule?: string) => {
    setActiveTab(val);
    const paramVal = TAB_PARAM_MAP[val] || val;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', paramVal);
    if (rule) {
      url.searchParams.set('rule', rule);
    } else if (val !== 'pages') {
      url.searchParams.delete('rule');
    }
    window.history.pushState({}, '', url.toString());
  };

  // Dashboard & Global State
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [globalSettings, setGlobalSettings] = React.useState<GlobalSeoSettings | null>(null);
  const [pages, setPages] = React.useState<PageSeoItem[]>([]);

  // Loading States
  const [loadingDashboard, setLoadingDashboard] = React.useState(true);
  const [loadingPages, setLoadingPages] = React.useState(true);
  const [savingGlobal, setSavingGlobal] = React.useState(false);

  // Dialog States
  const [editingPage, setEditingPage] = React.useState<PageSeoItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [auditingPage, setAuditingPage] = React.useState<PageSeoItem | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = React.useState(false);

  // Load Initial Data
  const loadDashboard = React.useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const res = await seoService.getDashboard();
      setDashboardData(res);
    } catch (err) {
      notify.error({ title: 'Failed to load SEO dashboard', description: normalizeErrorMessage(err) });
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const loadGlobal = React.useCallback(async () => {
    try {
      const res = await seoService.getGlobal();
      if (res) {
        setGlobalSettings({
          siteName: res.siteName || '',
          siteTitle: res.siteTitle || '',
          siteDescription: res.siteDescription || '',
          siteUrl: res.siteUrl || '',
          defaultTitle: res.defaultTitle || '',
          defaultDescription: res.defaultDescription || '',
          defaultKeywords: Array.isArray(res.defaultKeywords) ? res.defaultKeywords : [],
          defaultOgImage: res.defaultOgImage || '',
          defaultSocialImage: res.defaultSocialImage || '',
          favicon: res.favicon || '',
          defaultAuthor: res.defaultAuthor || '',
          organizationName: res.organizationName || '',
          organizationLogo: res.organizationLogo || '',
          organizationDescription: res.organizationDescription || '',
          phone: res.phone || '',
          email: res.email || '',
          address: res.address || '',
          country: res.country || '',
          socialProfiles: Array.isArray(res.socialProfiles) ? res.socialProfiles : [],
          defaultLanguage: res.defaultLanguage || 'en',
          defaultLocale: res.defaultLocale || 'en-US',
          timezone: res.timezone || 'UTC',
          metaTitleTemplate: res.metaTitleTemplate || '{pageTitle} | {siteName}',
          canonicalBaseUrl: res.canonicalBaseUrl || '',
          ogDefaultImage: res.ogDefaultImage || '',
          twitterCard: res.twitterCard || 'summary_large_image',
          twitterHandle: res.twitterHandle || '',
          robotsIndex: res.robotsIndex ?? true,
          robotsFollow: res.robotsFollow ?? true,
          googleVerification: res.googleVerification || '',
          bingVerification: res.bingVerification || '',
          yandexVerification: res.yandexVerification || '',
          baiduVerification: res.baiduVerification || '',
          googleAnalyticsId: res.googleAnalyticsId || '',
          gtmId: res.gtmId || '',
          metaPixelId: res.metaPixelId || '',
        });
      }
    } catch (err) {
      notify.error({ title: 'Failed to load global SEO', description: normalizeErrorMessage(err) });
    }
  }, []);

  const loadPages = React.useCallback(async () => {
    try {
      setLoadingPages(true);
      const res = await seoService.getPages();
      if (Array.isArray(res)) {
        const unique = new Map<string, PageSeoItem>();
        for (const item of res) {
          const key = `${item.type || 'PAGE'}:${item.slug}`;
          if (!unique.has(key)) {
            unique.set(key, item);
          }
        }
        setPages(Array.from(unique.values()));
      } else {
        setPages([]);
      }
    } catch (err) {
      notify.error({ title: 'Failed to load pages for SEO', description: normalizeErrorMessage(err) });
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const refreshAll = React.useCallback(() => {
    loadDashboard();
    loadGlobal();
    loadPages();
  }, [loadDashboard, loadGlobal, loadPages]);

  React.useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Global Settings Save
  const handleSaveGlobal = async () => {
    if (!globalSettings) return;
    try {
      setSavingGlobal(true);
      await seoService.updateGlobal(globalSettings);
      notify.success({ title: 'Global SEO saved', description: 'Settings successfully updated across the site.' });
      loadDashboard();
    } catch (err) {
      notify.error({ title: 'Failed to save global SEO', description: normalizeErrorMessage(err) });
    } finally {
      setSavingGlobal(false);
    }
  };

  // Page SEO Save
  const handleSavePageSeo = async (pageId: string, data: any) => {
    try {
      await seoService.updatePageSeo(pageId, data);
      notify.success({ title: 'Page SEO updated', description: 'Metadata for this page was saved.' });
      loadPages();
      loadDashboard();
    } catch (err) {
      notify.error({ title: 'Failed to save page SEO', description: normalizeErrorMessage(err) });
      throw err;
    }
  };

  // Audit Click Handler
  const handleAuditPageClick = (pageId: string) => {
    const p = pages.find((item) => item.id === pageId);
    if (p) {
      setAuditingPage(p);
      setIsAuditDialogOpen(true);
    }
  };

  const healthScore = dashboardData?.healthScore ?? 100;
  const isHealthy = healthScore >= 80;
  const isWarning = healthScore >= 50 && healthScore < 80;

  if (loadingDashboard && !dashboardData) {
    return (
      <AdminPageLoadingState
        title="SEO & Discoverability"
        message="Loading SEO health metrics, AEO entity graphs, and search index status..."
        description="Syncing state with Gypsym platform services..."
        variant="wide"
      />
    );
  }

  return (
    <AdminContentContainer variant="wide">
      <AdminPageHeader
        title="SEO & Discoverability"
        description="Enterprise SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) management."
        status={
          <Badge
            variant="outline"
            className={
              isHealthy
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : isWarning
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
            }
          >
            Audit Score: {healthScore}%
          </Badge>
        }
        actions={
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={loadingDashboard} className="gap-2 cursor-pointer">
            <RefreshCw className={`h-4 w-4 ${loadingDashboard ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        }
      />

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="w-full overflow-x-auto no-scrollbar scroll-smooth py-1">
          <TabsList className="h-10 p-1 bg-muted/60 rounded-xl inline-flex w-max min-w-full sm:min-w-0 gap-1 border border-border/50">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <Globe className="h-3.5 w-3.5" />
              <span>Global SEO</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <FileText className="h-3.5 w-3.5" />
              <span>Page SEO</span>
            </TabsTrigger>
            <TabsTrigger value="aeo" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <Bot className="h-3.5 w-3.5" />
              <span>AEO</span>
            </TabsTrigger>
            <TabsTrigger value="geo" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <Sparkles className="h-3.5 w-3.5" />
              <span>GEO</span>
            </TabsTrigger>
            <TabsTrigger value="redirects" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Redirects</span>
            </TabsTrigger>
            <TabsTrigger value="sitemap" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <FileCode className="h-3.5 w-3.5" />
              <span>Sitemap</span>
            </TabsTrigger>
            <TabsTrigger value="robots" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <Shield className="h-3.5 w-3.5" />
              <span>Robots.txt</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <FileJson className="h-3.5 w-3.5" />
              <span>Schema</span>
            </TabsTrigger>
            <TabsTrigger value="previews" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <Share2 className="h-3.5 w-3.5" />
              <span>Previews</span>
            </TabsTrigger>
            <TabsTrigger value="canonicals" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <Link2 className="h-3.5 w-3.5" />
              <span>Canonicals & Hreflang</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs rounded-lg shrink-0 px-3 font-medium transition-all">
              <Sliders className="h-3.5 w-3.5" />
              <span>Settings & Webmasters</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <SeoDashboardTab
            data={dashboardData}
            loading={loadingDashboard}
            onRefresh={loadDashboard}
            onNavigateTab={(tab, rule) => handleTabChange(tab, rule)}
          />
        </TabsContent>

        {/* Tab 2: Global SEO */}
        <TabsContent value="global" className="space-y-4">
          {globalSettings && (
            <GlobalSeoTab
              settings={globalSettings}
              onChange={setGlobalSettings}
              onSave={handleSaveGlobal}
              saving={savingGlobal}
            />
          )}
        </TabsContent>

        {/* Tab 3: Page SEO */}
        <TabsContent value="pages" className="space-y-4">
          <PageSeoTab
            pages={pages}
            loading={loadingPages}
            onEditPage={(page) => {
              setEditingPage(page);
              setIsEditDialogOpen(true);
            }}
            onAuditPage={handleAuditPageClick}
            onRefresh={loadPages}
          />
        </TabsContent>

        {/* Tab 4: AEO */}
        <TabsContent value="aeo" className="space-y-4">
          <AeoTab />
        </TabsContent>

        {/* Tab 5: GEO */}
        <TabsContent value="geo" className="space-y-4">
          <GeoTab />
        </TabsContent>

        {/* Tab 6: Redirects */}
        <TabsContent value="redirects" className="space-y-4">
          <RedirectsTab />
        </TabsContent>

        {/* Tab 7: Sitemap */}
        <TabsContent value="sitemap" className="space-y-4">
          <SitemapTab />
        </TabsContent>

        {/* Tab 8: Robots.txt */}
        <TabsContent value="robots" className="space-y-4">
          <RobotsTab />
        </TabsContent>

        {/* Tab 9: Schema / Structured Data */}
        <TabsContent value="schema" className="space-y-4">
          <SchemaTab onNavigateTab={handleTabChange} />
        </TabsContent>

        {/* Tab 10: Search & Social Previews */}
        <TabsContent value="previews" className="space-y-4">
          <SocialPreviewTab />
        </TabsContent>

        {/* Tab 11: Canonicals & Hreflang */}
        <TabsContent value="canonicals" className="space-y-4">
          <CanonicalsTab />
        </TabsContent>

        {/* Tab 12: Templates & Settings */}
        <TabsContent value="settings" className="space-y-4">
          <TemplatesSettingsTab />
        </TabsContent>
      </Tabs>

      {/* Edit Page SEO Dialog */}
      <EditPageSeoDialog
        page={editingPage}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSavePageSeo}
        canonicalBaseUrl={globalSettings?.canonicalBaseUrl || globalSettings?.siteUrl}
        defaultOgImage={globalSettings?.defaultOgImage || globalSettings?.ogDefaultImage || '/og-default.png'}
      />

      {/* On-Page SEO Deep Audit Dialog */}
      <PageAuditDialog
        page={auditingPage}
        open={isAuditDialogOpen}
        onOpenChange={setIsAuditDialogOpen}
        onEditPage={(page) => {
          setEditingPage(page);
          setIsEditDialogOpen(true);
        }}
      />
    </AdminContentContainer>
  );
}

export default function SeoManagementPage() {
  return (
    <React.Suspense
      fallback={
        <AdminPageLoadingState
          message="Loading SEO health metrics, AEO entity graphs, and search index status..."
          description="Syncing state with Gypsym platform services..."
          variant="wide"
        />
      }
    >
      <SeoManagementContent />
    </React.Suspense>
  );
}
