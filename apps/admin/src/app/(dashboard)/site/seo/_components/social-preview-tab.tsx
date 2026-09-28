'use client';

import * as React from 'react';
import {
  Share2,
  Search,
  Smartphone,
  Monitor,
  Twitter,
  Linkedin,
  MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { seoService, GlobalSeoData } from '@/services/seo.service';
import { PageSeoItem } from './types';

export function SocialPreviewTab() {
  const [globalSeo, setGlobalSeo] = React.useState<GlobalSeoData | null>(null);
  const [pages, setPages] = React.useState<PageSeoItem[]>([]);
  const [selectedPageId, setSelectedPageId] = React.useState<string>('global');
  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [g, p] = await Promise.all([
          seoService.getGlobal(),
          seoService.getPages(),
        ]);
        setGlobalSeo(g);
        setPages(Array.isArray(p) ? p : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedPage = React.useMemo(() => {
    if (selectedPageId === 'global') return null;
    return pages.find((p) => p.id === selectedPageId) || null;
  }, [pages, selectedPageId]);

  // Derived preview data
  const previewTitle = React.useMemo(() => {
    if (selectedPage?.seoMetadata?.metaTitle) return selectedPage.seoMetadata.metaTitle;
    if (selectedPage) {
      const template = globalSeo?.metaTitleTemplate || '{pageTitle} | {siteName}';
      return template
        .replace('{pageTitle}', selectedPage.title)
        .replace('{siteName}', globalSeo?.siteName || 'Gypsym Technology');
    }
    return globalSeo?.defaultTitle || globalSeo?.siteTitle || 'Gypsym Technology | Enterprise Engineering';
  }, [selectedPage, globalSeo]);

  const previewDescription = React.useMemo(() => {
    if (selectedPage?.seoMetadata?.metaDescription) return selectedPage.seoMetadata.metaDescription;
    return globalSeo?.defaultDescription || globalSeo?.siteDescription || 'Enterprise software engineering architecture, distributed cloud systems, and AI ecosystems.';
  }, [selectedPage, globalSeo]);

  const previewUrl = React.useMemo(() => {
    const base = globalSeo?.siteUrl || 'https://gypsym.com';
    if (!selectedPage || selectedPage.slug === 'home' || selectedPage.slug === '/') {
      return base;
    }
    return `${base.replace(/\/$/, '')}/${selectedPage.slug}`;
  }, [selectedPage, globalSeo]);

  const previewImage = React.useMemo(() => {
    if (selectedPage?.seoMetadata?.ogImageUrl) return selectedPage.seoMetadata.ogImageUrl;
    return globalSeo?.defaultOgImage || globalSeo?.defaultSocialImage || '/og-image.jpg';
  }, [selectedPage, globalSeo]);

  const siteName = globalSeo?.siteName || 'Gypsym Technology';

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Loading Search & Social Previews...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target Selector */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Search & Social Card Previews
              </CardTitle>
              <CardDescription>
                Simulate how search engines (Google SERP) and social networks (LinkedIn, X, WhatsApp, Facebook) render rich snippets.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Select Page Context:</Label>
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="h-9 px-3 rounded-md border bg-background text-sm font-medium"
              >
                <option value="global">Global Defaults</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    Page: {p.title} (/{p.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="google" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Google SERP
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                Open Graph / LinkedIn
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter / X Card
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messaging
              </TabsTrigger>
            </TabsList>

            {/* Google SERP Tab */}
            <TabsContent value="google" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Google Search Result Snippet</span>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                  <Button
                    size="sm"
                    variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-3.5 w-3.5 mr-1" /> Desktop
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-3.5 w-3.5 mr-1" /> Mobile
                  </Button>
                </div>
              </div>

              {/* SERP Card */}
              <div
                className={`p-5 rounded-xl border bg-card shadow-sm space-y-1.5 transition-all ${
                  previewDevice === 'mobile' ? 'max-w-md mx-auto' : 'max-w-2xl'
                }`}
              >
                {/* SERP Header / Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    G
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">{siteName}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{previewUrl}</span>
                  </div>
                </div>

                {/* SERP Title */}
                <h3 className="text-lg text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer line-clamp-1 leading-snug">
                  {previewTitle}
                </h3>

                {/* SERP Snippet */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {previewDescription}
                </p>

                {/* Metrics Bar */}
                <div className="pt-3 border-t flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>
                    Title: <strong>{previewTitle.length}</strong> / 60 chars{' '}
                    {previewTitle.length > 60 ? (
                      <span className="text-amber-500 font-semibold">(May truncate)</span>
                    ) : (
                      <span className="text-emerald-500 font-semibold">(Optimal)</span>
                    )}
                  </span>
                  <span>
                    Description: <strong>{previewDescription.length}</strong> / 160 chars{' '}
                    {previewDescription.length > 160 ? (
                      <span className="text-amber-500 font-semibold">(May truncate)</span>
                    ) : (
                      <span className="text-emerald-500 font-semibold">(Optimal)</span>
                    )}
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* Social / Open Graph Tab */}
            <TabsContent value="social" className="space-y-4">
              <span className="text-xs font-semibold text-muted-foreground">Facebook & LinkedIn Feed Card</span>
              <div className="max-w-xl border rounded-xl overflow-hidden bg-card shadow-sm">
                <div className="h-56 bg-muted relative flex items-center justify-center overflow-hidden border-b">
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewImage} alt="OG Card" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-xs text-muted-foreground">
                      No OG image configured
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1 bg-card">
                  <div className="text-[11px] text-muted-foreground uppercase font-medium">
                    {new URL(previewUrl).hostname}
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">{previewTitle}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{previewDescription}</p>
                </div>
              </div>
            </TabsContent>

            {/* Twitter / X Tab */}
            <TabsContent value="twitter" className="space-y-4">
              <span className="text-xs font-semibold text-muted-foreground">Twitter / X Large Summary Card</span>
              <div className="max-w-xl border rounded-2xl overflow-hidden bg-card shadow-sm">
                <div className="h-60 bg-muted relative flex items-center justify-center overflow-hidden border-b">
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewImage} alt="Twitter Card" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-xs text-muted-foreground">
                      No Twitter card image configured
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1 bg-card">
                  <div className="text-[11px] text-muted-foreground">
                    {new URL(previewUrl).hostname}
                  </div>
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">{previewTitle}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{previewDescription}</p>
                </div>
              </div>
            </TabsContent>

            {/* Chat / Messaging Tab */}
            <TabsContent value="chat" className="space-y-4">
              <span className="text-xs font-semibold text-muted-foreground">WhatsApp / iMessage / Slack Snippet</span>
              <div className="max-w-md p-3.5 rounded-xl border bg-muted/30 border-l-4 border-l-primary space-y-2">
                <div className="text-[11px] font-semibold text-primary">{siteName}</div>
                <div className="font-bold text-sm text-foreground">{previewTitle}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{previewDescription}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{previewUrl}</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
