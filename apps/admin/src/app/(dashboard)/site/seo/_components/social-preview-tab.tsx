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
  Globe,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { seoService, GlobalSeoData } from '@/services/seo.service';
import { PageSeoItem } from './types';

export function SocialPreviewTab() {
  const [globalSeo, setGlobalSeo] = React.useState<GlobalSeoData | null>(null);
  const [pages, setPages] = React.useState<PageSeoItem[]>([]);
  const [selectedPageId, setSelectedPageId] = React.useState<string>('global');
  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = React.useState(true);

  // Search & Filter state for Page Selector
  const [pageSearch, setPageSearch] = React.useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState<'ALL' | 'PAGE' | 'SERVICE' | 'BLOG' | 'PORTFOLIO'>('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [g, p] = await Promise.all([seoService.getGlobal(), seoService.getPages()]);
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

  const typeCounts = React.useMemo(() => {
    const counts = { ALL: pages.length, PAGE: 0, SERVICE: 0, BLOG: 0, PORTFOLIO: 0 };
    pages.forEach((p) => {
      const t = (p.type || 'PAGE').toUpperCase() as 'PAGE' | 'SERVICE' | 'BLOG' | 'PORTFOLIO';
      if (counts[t] !== undefined) counts[t]++;
    });
    return counts;
  }, [pages]);

  const filteredPages = React.useMemo(() => {
    return pages.filter((p) => {
      const matchesType =
        selectedTypeFilter === 'ALL' ||
        (p.type || 'PAGE').toUpperCase() === selectedTypeFilter.toUpperCase();

      if (!matchesType) return false;
      if (!pageSearch.trim()) return true;

      const q = pageSearch.toLowerCase();
      const title = (p.title || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      const type = (p.type || 'PAGE').toLowerCase();
      return title.includes(q) || slug.includes(q) || type.includes(q);
    });
  }, [pages, pageSearch, selectedTypeFilter]);

  const selectedPage = React.useMemo(() => {
    if (selectedPageId === 'global') return null;
    return pages.find((p) => p.id === selectedPageId) || null;
  }, [pages, selectedPageId]);

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
    const base = globalSeo?.canonicalBaseUrl || globalSeo?.siteUrl || 'https://gypsym.com';
    if (!selectedPage || selectedPage.slug === 'home' || selectedPage.slug === '/') return base;
    return `${base.replace(/\/$/, '')}/${selectedPage.slug}`;
  }, [selectedPage, globalSeo]);

  const previewImage = React.useMemo(() => {
    if (selectedPage?.seoMetadata?.ogImageUrl) return selectedPage.seoMetadata.ogImageUrl;
    if ((selectedPage?.seoMetadata?.structuredData as any)?.ogImageUrl) {
      return (selectedPage?.seoMetadata?.structuredData as any).ogImageUrl;
    }
    return globalSeo?.defaultOgImage || globalSeo?.defaultSocialImage || '/og-image.jpg';
  }, [selectedPage, globalSeo]);

  const siteName = globalSeo?.siteName || 'Gypsym Technology';

  // Derived hostname safely
  let hostname = 'gypsym.com';
  try { hostname = new URL(previewUrl).hostname; } catch { /* noop */ }

  const titleOk = previewTitle.length <= 60;
  const descOk  = previewDescription.length <= 160;

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Loading Search &amp; Social Previews…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden bg-card">
        {/* ── Header bar ─────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-tight whitespace-nowrap">
                Search &amp; Social Card Previews
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulate how Google SERP, Open Graph, X (Twitter), and messaging apps render snippets.
              </p>
            </div>
          </div>

          {/* Searchable Page Selector Combobox */}
          <div className="relative w-full sm:w-80 md:w-96 shrink-0" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="h-10 w-full px-3 rounded-xl border border-border bg-background hover:bg-muted/30 text-xs font-medium text-foreground flex items-center justify-between gap-2 shadow-2xs transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted border border-border/80 text-foreground shrink-0 uppercase">
                  {selectedPageId === 'global' ? 'GLOBAL' : (selectedPage?.type || 'PAGE')}
                </span>
                <span className="truncate font-semibold text-foreground">
                  {selectedPageId === 'global' ? 'Global Defaults (Site-Wide)' : (selectedPage?.title || 'Select page...')}
                </span>
                {selectedPage && (
                  <span className="text-[11px] text-muted-foreground font-mono truncate hidden sm:inline">
                    (/{selectedPage.slug})
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-primary' : ''
                }`}
              />
            </button>

            {/* Popover Menu with Live Search Bar */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-full sm:w-[420px] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 p-2 space-y-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    placeholder="Search pages by title, slug, or type..."
                    className="h-8 pl-8 pr-7 text-xs rounded-xl bg-muted/40 border-border focus:bg-background"
                    autoFocus
                  />
                  {pageSearch && (
                    <button
                      type="button"
                      onClick={() => setPageSearch('')}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Type Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {(['ALL', 'PAGE', 'SERVICE', 'BLOG', 'PORTFOLIO'] as const).map((t) => {
                    const count = typeCounts[t] || 0;
                    if (t !== 'ALL' && count === 0) return null;
                    const active = selectedTypeFilter === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTypeFilter(t)}
                        className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          active
                            ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {t === 'ALL' ? `All (${count})` : `${t} (${count})`}
                      </button>
                    );
                  })}
                </div>

                {/* Filtered Pages List */}
                <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-border/40 pr-0.5">
                  {/* Option for Global Defaults */}
                  {(!pageSearch.trim() || 'global defaults'.includes(pageSearch.toLowerCase())) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPageId('global');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                        selectedPageId === 'global'
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wide uppercase bg-muted text-foreground border border-border">
                          GLOBAL
                        </span>
                        <span className="font-semibold text-xs">Global Defaults (Site-Wide)</span>
                      </div>
                    </button>
                  )}

                  {filteredPages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No pages found matching &quot;{pageSearch}&quot;
                    </div>
                  ) : (
                    filteredPages.map((p) => {
                      const isSelected = p.id === selectedPageId;
                      const pType = (p.type || 'PAGE').toUpperCase();

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPageId(p.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-muted/50 text-foreground'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wide uppercase ${
                                  pType === 'SERVICE'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : pType === 'BLOG'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : pType === 'PORTFOLIO'
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {pType}
                              </span>
                              <span className="font-medium truncate text-foreground">{p.title}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate pl-0.5 mt-0.5">
                              /{p.slug}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {p.seoMetadata?.ogImageUrl && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                OG Image
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-5">
          <Tabs defaultValue="google" className="space-y-4">
            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <TabsList className="h-8 bg-muted p-0.5 rounded-xl inline-flex w-auto gap-0.5">
                <TabsTrigger value="google" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <Search className="h-3 w-3" />
                  Google SERP
                </TabsTrigger>
                <TabsTrigger value="social" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <Linkedin className="h-3 w-3" />
                  Open Graph
                </TabsTrigger>
                <TabsTrigger value="twitter" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <Twitter className="h-3 w-3" />
                  Twitter / X
                </TabsTrigger>
                <TabsTrigger value="chat" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <MessageSquare className="h-3 w-3" />
                  Messaging
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Google SERP ──────────────────────────────────────── */}
            <TabsContent value="google" className="space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Google Search Result Snippet</span>
                <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-lg shrink-0">
                  <Button
                    size="sm" variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                    className="h-6 px-2 text-[11px] rounded-md cursor-pointer"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-3 w-3 mr-1" />Desktop
                  </Button>
                  <Button
                    size="sm" variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                    className="h-6 px-2 text-[11px] rounded-md cursor-pointer"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-3 w-3 mr-1" />Mobile
                  </Button>
                </div>
              </div>

              {/* SERP Card */}
              <div className={`rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all w-full ${previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl'}`}>
                {/* Google chrome-like bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-0.5 text-[11px] font-mono text-slate-500 truncate min-w-0">
                    {previewUrl}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-2">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-blue-600">G</span>
                    </div>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-xs font-medium text-slate-800 truncate">{siteName}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate">{previewUrl}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg text-[#1a0dab] font-medium hover:underline cursor-pointer line-clamp-2 leading-snug break-words">
                    {previewTitle}
                  </h3>

                  {/* Snippet */}
                  <div className="text-[13px] text-slate-700 leading-relaxed line-clamp-2 break-words">
                    <span className="text-slate-500 text-[11px]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — </span>
                    {previewDescription}
                  </div>

                  {/* Metrics */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {titleOk
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        : <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      <span className="text-[11px] text-slate-500">
                        Title: <strong className="text-slate-700">{previewTitle.length}</strong>/60 chars{' '}
                        <span className={`font-semibold ${titleOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {titleOk ? '(Optimal)' : '(May truncate)'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {descOk
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        : <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      <span className="text-[11px] text-slate-500">
                        Description: <strong className="text-slate-700">{previewDescription.length}</strong>/160 chars{' '}
                        <span className={`font-semibold ${descOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {descOk ? '(Optimal)' : '(May truncate)'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Open Graph / LinkedIn ──────────────────────────── */}
            <TabsContent value="social" className="space-y-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Facebook &amp; LinkedIn Feed Card</span>
              <div className="w-full max-w-lg rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <div className="aspect-[1.91/1] w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewImage} alt="OG preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Share2 className="h-8 w-8 opacity-40" />
                      <span className="text-xs">No OG image configured</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="px-4 py-3 bg-[#f2f3f5] border-t border-slate-200 space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider truncate">{hostname}</div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{previewTitle}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{previewDescription}</p>
                </div>
              </div>
            </TabsContent>

            {/* ── Twitter / X ───────────────────────────────────── */}
            <TabsContent value="twitter" className="space-y-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Twitter / X Large Summary Card</span>
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <div className="aspect-[1.91/1] w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewImage} alt="Twitter card" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Twitter className="h-8 w-8 opacity-40" />
                      <span className="text-xs">No Twitter card image configured</span>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-slate-200 space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-mono">{hostname}</div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{previewTitle}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{previewDescription}</p>
                </div>
              </div>
            </TabsContent>

            {/* ── Messaging / Chat ──────────────────────────────── */}
            <TabsContent value="chat" className="space-y-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp / iMessage / Slack Snippet</span>
              <div className="max-w-sm space-y-3">
                {/* WhatsApp style */}
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-3 py-1.5 bg-[#075e54] flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-white" />
                    <span className="text-[10px] font-semibold text-white">WhatsApp</span>
                  </div>
                  <div className="bg-[#ece5dd] p-3">
                    <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm space-y-1.5 max-w-xs">
                      {previewImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewImage} alt="link preview" className="w-full h-24 object-cover rounded-md" />
                      )}
                      <div className="border-l-4 border-[#25d366] pl-2 space-y-0.5">
                        <div className="text-[10px] font-semibold text-[#075e54]">{siteName}</div>
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">{previewTitle}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-2">{previewDescription}</div>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate">{previewUrl}</div>
                    </div>
                  </div>
                </div>

                {/* Slack style */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs border-l-4 border-l-[#611f69] space-y-1">
                  <div className="text-[10px] font-bold text-[#611f69]">{siteName}</div>
                  <div className="font-semibold text-sm text-slate-800 line-clamp-1">{previewTitle}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">{previewDescription}</div>
                  <div className="text-[10px] text-blue-600 font-mono truncate">{previewUrl}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
