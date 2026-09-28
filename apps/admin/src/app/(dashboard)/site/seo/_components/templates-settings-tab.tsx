'use client';

import * as React from 'react';
import {
  Sliders,
  Save,
  Key,
  BarChart3,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import {
  seoService,
  SeoTemplatesData,
  GlobalSeoData,
} from '@/services/seo.service';

export function TemplatesSettingsTab() {
  const [templates, setTemplates] = React.useState<SeoTemplatesData>({
    pageTitleTemplate: '{pageTitle} | {siteName}',
    serviceTitleTemplate: '{serviceName} | {siteName}',
    portfolioTitleTemplate: '{projectName} | Enterprise Portfolio | {siteName}',
    categoryTitleTemplate: '{categoryName} | {siteName}',
    blogTitleTemplate: '{articleTitle} | Insights | {siteName}',
    pageDescTemplate: '{pageDesc}',
    serviceDescTemplate: 'Explore enterprise {serviceName} solutions engineered by {siteName}.',
    portfolioDescTemplate: 'Enterprise case study for {projectName} delivered by {siteName}.',
  });

  const [globalSeo, setGlobalSeo] = React.useState<GlobalSeoData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [t, g] = await Promise.all([
        seoService.getTemplates(),
        seoService.getGlobal(),
      ]);
      if (t && typeof t === 'object') {
        setTemplates((prev) => ({ ...prev, ...t }));
      }
      setGlobalSeo(g);
    } catch (err) {
      notify.error({ title: 'Failed to load templates & settings', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const promises: Promise<any>[] = [seoService.updateTemplates(templates)];
      if (globalSeo) {
        promises.push(seoService.updateGlobal(globalSeo));
      }
      await Promise.all(promises);
      notify.success({ title: 'SEO settings saved', description: 'Templates and webmaster verification tokens updated.' });
    } catch (err) {
      notify.error({ title: 'Failed to save settings', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !globalSeo) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Loading SEO Templates & Settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Title & Description Templates */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Dynamic SEO Title & Description Templates
              </CardTitle>
              <CardDescription>
                Establish consistent, formulaic title tag formats across content types without manual duplication.
              </CardDescription>
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-3.5 rounded-lg bg-muted/40 border flex items-start gap-2.5 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              Available variables: <Badge variant="outline" className="font-mono text-[10px] mx-1">{'{pageTitle}'}</Badge>
              <Badge variant="outline" className="font-mono text-[10px] mx-1">{'{serviceName}'}</Badge>
              <Badge variant="outline" className="font-mono text-[10px] mx-1">{'{projectName}'}</Badge>
              <Badge variant="outline" className="font-mono text-[10px] mx-1">{'{categoryName}'}</Badge>
              <Badge variant="outline" className="font-mono text-[10px] mx-1">{'{siteName}'}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pageTitleTemplate">Pages Title Template</Label>
              <Input
                id="pageTitleTemplate"
                value={templates.pageTitleTemplate || ''}
                onChange={(e) => setTemplates((p) => ({ ...p, pageTitleTemplate: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="serviceTitleTemplate">Services Title Template</Label>
              <Input
                id="serviceTitleTemplate"
                value={templates.serviceTitleTemplate || ''}
                onChange={(e) => setTemplates((p) => ({ ...p, serviceTitleTemplate: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="portfolioTitleTemplate">Portfolio Project Title Template</Label>
              <Input
                id="portfolioTitleTemplate"
                value={templates.portfolioTitleTemplate || ''}
                onChange={(e) => setTemplates((p) => ({ ...p, portfolioTitleTemplate: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryTitleTemplate">Category Taxonomy Title Template</Label>
              <Input
                id="categoryTitleTemplate"
                value={templates.categoryTitleTemplate || ''}
                onChange={(e) => setTemplates((p) => ({ ...p, categoryTitleTemplate: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="serviceDescTemplate">Service Default Description Template</Label>
              <Input
                id="serviceDescTemplate"
                value={templates.serviceDescTemplate || ''}
                onChange={(e) => setTemplates((p) => ({ ...p, serviceDescTemplate: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="portfolioDescTemplate">Portfolio Default Description Template</Label>
              <Input
                id="portfolioDescTemplate"
                value={templates.portfolioDescTemplate || ''}
                onChange={(e) => setTemplates((p) => ({ ...p, portfolioDescTemplate: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webmaster Search Engine Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Search Engine Verification Tokens
          </CardTitle>
          <CardDescription>
            Authenticate ownership of Gypsym Technology with Google Search Console, Bing Webmaster Tools, and other search engines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="googleVerification">Google Search Console Verification (content)</Label>
              <Input
                id="googleVerification"
                placeholder="google-site-verification-token"
                value={globalSeo.googleVerification || ''}
                onChange={(e) => setGlobalSeo((p) => (p ? { ...p, googleVerification: e.target.value } : p))}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Injected as <code>&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bingVerification">Bing Webmaster Verification (content)</Label>
              <Input
                id="bingVerification"
                placeholder="msvalidate.01-token"
                value={globalSeo.bingVerification || ''}
                onChange={(e) => setGlobalSeo((p) => (p ? { ...p, bingVerification: e.target.value } : p))}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Injected as <code>&lt;meta name=&quot;msvalidate.01&quot; content=&quot;...&quot; /&gt;</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="yandexVerification">Yandex Verification Token</Label>
              <Input
                id="yandexVerification"
                placeholder="yandex-verification-token"
                value={globalSeo.yandexVerification || ''}
                onChange={(e) => setGlobalSeo((p) => (p ? { ...p, yandexVerification: e.target.value } : p))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="baiduVerification">Baidu Verification Token</Label>
              <Input
                id="baiduVerification"
                placeholder="baidu-site-verification-token"
                value={globalSeo.baiduVerification || ''}
                onChange={(e) => setGlobalSeo((p) => (p ? { ...p, baiduVerification: e.target.value } : p))}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Measurement IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics & Conversion Tracking
          </CardTitle>
          <CardDescription>
            Configure public measurement tokens. No private secrets or credentials will be stored in frontend bundles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="googleAnalyticsId">Google Analytics 4 (G-XXXXX)</Label>
              <Input
                id="googleAnalyticsId"
                placeholder="G-ABC123XYZ"
                value={globalSeo.googleAnalyticsId || ''}
                onChange={(e) => setGlobalSeo((p) => (p ? { ...p, googleAnalyticsId: e.target.value } : p))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gtmId">Google Tag Manager (GTM-XXXXX)</Label>
              <Input
                id="gtmId"
                placeholder="GTM-1234567"
                value={globalSeo.gtmId || ''}
                onChange={(e) => setGlobalSeo((p) => (p ? { ...p, gtmId: e.target.value } : p))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
              <Input
                id="metaPixelId"
                placeholder="1234567890"
                value={globalSeo.metaPixelId || ''}
                onChange={(e) => setGlobalSeo((p) => (p ? { ...p, metaPixelId: e.target.value } : p))}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
