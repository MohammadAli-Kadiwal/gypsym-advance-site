'use client';

import * as React from 'react';
import {
  FileCode,
  Save,
  ExternalLink,
  Plus,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import { seoService, SitemapConfigData } from '@/services/seo.service';

export function SitemapTab() {
  const [config, setConfig] = React.useState<SitemapConfigData>({
    includePages: true,
    includeServices: true,
    includePortfolio: true,
    includeCategories: true,
    includeBlog: true,
    excludedSlugs: ['admin', 'login', 'draft', 'api'],
    defaultChangefreq: 'weekly',
    defaultPriority: 0.7,
  });

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [newExcludedSlug, setNewExcludedSlug] = React.useState('');
  const [showXmlPreview, setShowXmlPreview] = React.useState(false);
  const [xmlPreviewText, setXmlPreviewText] = React.useState('');
  const [loadingXml, setLoadingXml] = React.useState(false);

  const loadSitemapConfig = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await seoService.getSitemap();
      if (data && typeof data === 'object') {
        setConfig({
          includePages: data.includePages ?? true,
          includeServices: data.includeServices ?? true,
          includePortfolio: data.includePortfolio ?? true,
          includeCategories: data.includeCategories ?? true,
          includeBlog: data.includeBlog ?? true,
          excludedSlugs: Array.isArray(data.excludedSlugs) ? data.excludedSlugs : [],
          defaultChangefreq: data.defaultChangefreq || 'weekly',
          defaultPriority: data.defaultPriority ?? 0.7,
        });
      }
    } catch (err) {
      notify.error({ title: 'Failed to load sitemap settings', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSitemapConfig();
  }, [loadSitemapConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await seoService.updateSitemap(config);
      notify.success({ title: 'Sitemap updated', description: 'XML Sitemap inclusion settings saved.' });
    } catch (err) {
      notify.error({ title: 'Failed to save sitemap settings', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const addExcludedSlug = () => {
    const val = newExcludedSlug.trim().replace(/^\//, '');
    if (val && !config.excludedSlugs.includes(val)) {
      setConfig((prev) => ({
        ...prev,
        excludedSlugs: [...prev.excludedSlugs, val],
      }));
      setNewExcludedSlug('');
    }
  };

  const removeExcludedSlug = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      excludedSlugs: prev.excludedSlugs.filter((_, i) => i !== idx),
    }));
  };

  const handlePreviewXml = async () => {
    try {
      setLoadingXml(true);
      setShowXmlPreview(true);
      const res = await fetch('/api/v1/seo/public/sitemap-urls');
      const data = await res.json();
      const urls: Array<{ url: string; lastModified?: string; changeFrequency?: string; priority?: number }> =
        data?.data?.urls || [];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      urls.forEach((u) => {
        xml += `  <url>\n`;
        xml += `    <loc>${u.url}</loc>\n`;
        if (u.lastModified) xml += `    <lastmod>${u.lastModified}</lastmod>\n`;
        if (u.changeFrequency) xml += `    <changefreq>${u.changeFrequency}</changefreq>\n`;
        if (u.priority !== undefined) xml += `    <priority>${u.priority}</priority>\n`;
        xml += `  </url>\n`;
      });
      xml += `</urlset>`;
      setXmlPreviewText(xml);
    } catch (err) {
      setXmlPreviewText('<!-- Failed to fetch live sitemap preview -->');
    } finally {
      setLoadingXml(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Loading Sitemap Configuration...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Dynamic XML Sitemap
              </CardTitle>
              <CardDescription>
                Configure which CMS content types are dynamically indexed into <code>/sitemap.xml</code> for Google, Bing, and search crawlers.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open('http://localhost:3000/sitemap.xml', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Live /sitemap.xml
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handlePreviewXml} disabled={loadingXml}>
                <Eye className="h-4 w-4 mr-2" />
                Preview XML
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Type Inclusions */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Content Types to Include in Sitemap</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="inc-pages" className="font-semibold cursor-pointer">CMS Pages</Label>
                  <p className="text-xs text-muted-foreground">Standard & custom landing pages</p>
                </div>
                <Switch
                  id="inc-pages"
                  checked={config.includePages}
                  onCheckedChange={(checked) => setConfig((p) => ({ ...p, includePages: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="inc-services" className="font-semibold cursor-pointer">Services</Label>
                  <p className="text-xs text-muted-foreground">Enterprise service offering pages</p>
                </div>
                <Switch
                  id="inc-services"
                  checked={config.includeServices}
                  onCheckedChange={(checked) => setConfig((p) => ({ ...p, includeServices: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="inc-portfolio" className="font-semibold cursor-pointer">Portfolio Projects</Label>
                  <p className="text-xs text-muted-foreground">Case studies and client projects</p>
                </div>
                <Switch
                  id="inc-portfolio"
                  checked={config.includePortfolio}
                  onCheckedChange={(checked) => setConfig((p) => ({ ...p, includePortfolio: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="inc-cats" className="font-semibold cursor-pointer">Categories</Label>
                  <p className="text-xs text-muted-foreground">Portfolio & service taxonomy pages</p>
                </div>
                <Switch
                  id="inc-cats"
                  checked={config.includeCategories}
                  onCheckedChange={(checked) => setConfig((p) => ({ ...p, includeCategories: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="inc-blog" className="font-semibold cursor-pointer">Blog Articles</Label>
                  <p className="text-xs text-muted-foreground">Published articles & insights</p>
                </div>
                <Switch
                  id="inc-blog"
                  checked={config.includeBlog}
                  onCheckedChange={(checked) => setConfig((p) => ({ ...p, includeBlog: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Crawl Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="defaultChangefreq">Default Crawl Frequency (changefreq)</Label>
              <select
                id="defaultChangefreq"
                value={config.defaultChangefreq}
                onChange={(e) => setConfig((p) => ({ ...p, defaultChangefreq: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
              >
                <option value="always">Always (Real-time dynamic)</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (Recommended)</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="defaultPriority">Default Priority (0.1 - 1.0)</Label>
              <Input
                id="defaultPriority"
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                value={config.defaultPriority}
                onChange={(e) => setConfig((p) => ({ ...p, defaultPriority: parseFloat(e.target.value) || 0.7 }))}
              />
            </div>
          </div>

          {/* Excluded Slugs */}
          <div className="space-y-3 pt-4 border-t">
            <div className="space-y-1">
              <Label>Excluded URL Slugs</Label>
              <p className="text-xs text-muted-foreground">
                Slugs listed here will never be indexed into the XML sitemap, preventing private or system URLs from leaking.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. admin or private-portal"
                value={newExcludedSlug}
                onChange={(e) => setNewExcludedSlug(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExcludedSlug();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addExcludedSlug}>
                <Plus className="h-4 w-4 mr-1" /> Add Exclusion
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.excludedSlugs.map((slug, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1.5 py-1 px-2.5 font-mono text-xs">
                  /{slug}
                  <button
                    type="button"
                    onClick={() => removeExcludedSlug(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* XML Live Preview Section */}
          {showXmlPreview && (
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Live XML Output Preview:</span>
                <Button variant="ghost" size="sm" onClick={() => setShowXmlPreview(false)}>
                  Hide Preview
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted/60 font-mono text-xs overflow-x-auto max-h-80 border">
                {xmlPreviewText}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
