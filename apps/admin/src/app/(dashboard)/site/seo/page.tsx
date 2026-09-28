'use client';

import * as React from 'react';
import {
  Search,
  Globe,
  Share2,
  FileCode2,
  Check,
  Save,
  Loader2,
  ExternalLink,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Plus,
  X,
  Edit3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { notify } from '@/lib/notifications';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';

interface GlobalSeoSettings {
  metaTitleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  canonicalBaseUrl: string;
  ogDefaultImage: string;
  twitterCard: string;
  twitterHandle: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleVerification: string;
  bingVerification: string;
  yandexVerification: string;
  baiduVerification: string;
}

interface PageSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  noIndex?: boolean;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  twitterCard?: string;
}

interface PageItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: string;
  seoMetadata?: PageSeoMetadata | null;
}

const DEFAULT_GLOBAL_SEO: GlobalSeoSettings = {
  metaTitleTemplate: '%s | Gypsym Technology',
  defaultTitle: 'Gypsym Technology | Engineering the Global Enterprise',
  defaultDescription:
    'Gypsym Technology partners with Fortune 100 leaders to architect zero-downtime cloud cores, sovereign AI ecosystems, and high-frequency distributed ledgers.',
  defaultKeywords: [
    'enterprise cloud architecture',
    'distributed systems',
    'sovereign AI',
    'zero trust cybersecurity',
    'core banking modernization',
  ],
  canonicalBaseUrl: 'https://gypsym.com',
  ogDefaultImage: 'https://gypsym.com/og-default.png',
  twitterCard: 'summary_large_image',
  twitterHandle: '@gypsymtech',
  robotsIndex: true,
  robotsFollow: true,
  googleVerification: '',
  bingVerification: '',
  yandexVerification: '',
  baiduVerification: '',
};

export default function SeoManagementPage() {
  const [activeTab, setActiveTab] = React.useState('global');
  const [loading, setLoading] = React.useState(true);
  const [savingGlobal, setSavingGlobal] = React.useState(false);
  const [globalSaved, setGlobalSaved] = React.useState(false);

  // Global settings state
  const [globalSeo, setGlobalSeo] = React.useState<GlobalSeoSettings>(DEFAULT_GLOBAL_SEO);
  const [keywordInput, setKeywordInput] = React.useState('');

  // Pages state
  const [pages, setPages] = React.useState<PageItem[]>([]);
  const [searchPage, setSearchPage] = React.useState('');
  const [editingPage, setEditingPage] = React.useState<PageItem | null>(null);
  const [savingPage, setSavingPage] = React.useState(false);
  const [pageSeoDraft, setPageSeoDraft] = React.useState<PageSeoMetadata>({});

  // Preview display toggle
  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const [previewTab, setPreviewTab] = React.useState<'google' | 'social'>('google');

  // Load Initial SEO data
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [seoRes, pagesRes] = await Promise.all([
        fetchApi<any>('/settings/seo').catch(() => null),
        fetchApi<any>('/pages').catch(() => null),
      ]);

      if (seoRes) {
        const val = seoRes.data || seoRes;
        setGlobalSeo({
          ...DEFAULT_GLOBAL_SEO,
          ...(typeof val === 'object' && val !== null ? val : {}),
          defaultKeywords: Array.isArray(val?.defaultKeywords)
            ? val.defaultKeywords
            : DEFAULT_GLOBAL_SEO.defaultKeywords,
        });
      }

      if (pagesRes) {
        const pageList: PageItem[] = Array.isArray(pagesRes)
          ? pagesRes
          : Array.isArray(pagesRes.data)
          ? pagesRes.data
          : [];
        setPages(pageList);
      }
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Failed to load SEO configuration.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Save Global SEO
  const handleSaveGlobal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingGlobal(true);
    try {
      await fetchApi('/settings/seo', {
        method: 'PUT',
        body: JSON.stringify(globalSeo),
      });

      setGlobalSaved(true);
      notify.success('Global SEO settings and search directives saved successfully.');
      setTimeout(() => setGlobalSaved(false), 2500);
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Failed to save global SEO configuration.'));
    } finally {
      setSavingGlobal(false);
    }
  };

  // Keywords management
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;

    // Support comma-separated tags
    const splitted = trimmed
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const updated = Array.from(new Set([...globalSeo.defaultKeywords, ...splitted]));
    setGlobalSeo({ ...globalSeo, defaultKeywords: updated });
    setKeywordInput('');
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    setGlobalSeo({
      ...globalSeo,
      defaultKeywords: globalSeo.defaultKeywords.filter((_, i) => i !== indexToRemove),
    });
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // Page SEO edit modal
  const handleOpenEditPage = (page: PageItem) => {
    setEditingPage(page);
    setPageSeoDraft({
      metaTitle: page.seoMetadata?.metaTitle || page.title,
      metaDescription: page.seoMetadata?.metaDescription || page.description || '',
      canonicalUrl: page.seoMetadata?.canonicalUrl || '',
      ogTitle: page.seoMetadata?.ogTitle || page.title,
      ogDescription: page.seoMetadata?.ogDescription || page.description || '',
      ogImageUrl: page.seoMetadata?.ogImageUrl || '',
      noIndex: page.seoMetadata?.noIndex || false,
      twitterCard: page.seoMetadata?.twitterCard || 'summary_large_image',
    });
  };

  const handleSavePageSeo = async () => {
    if (!editingPage) return;
    setSavingPage(true);
    try {
      const payload = {
        seoMetadata: {
          metaTitle: pageSeoDraft.metaTitle?.trim() || editingPage.title,
          metaDescription: pageSeoDraft.metaDescription?.trim() || '',
          canonicalUrl: pageSeoDraft.canonicalUrl?.trim() || null,
          ogTitle: pageSeoDraft.ogTitle?.trim() || pageSeoDraft.metaTitle || editingPage.title,
          ogDescription: pageSeoDraft.ogDescription?.trim() || pageSeoDraft.metaDescription || '',
          ogImageUrl: pageSeoDraft.ogImageUrl?.trim() || null,
          noIndex: Boolean(pageSeoDraft.noIndex),
          robotsIndex: !pageSeoDraft.noIndex,
          robotsFollow: !pageSeoDraft.noIndex,
          twitterCard: pageSeoDraft.twitterCard || 'summary_large_image',
        },
      };

      await fetchApi(`/pages/${editingPage.slug}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      notify.success(`SEO metadata updated for "/${editingPage.slug}".`);

      // Update local state
      setPages((prev) =>
        prev.map((p) =>
          p.id === editingPage.id
            ? {
                ...p,
                seoMetadata: {
                  ...p.seoMetadata,
                  ...payload.seoMetadata,
                },
              }
            : p
        )
      );

      setEditingPage(null);
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Failed to update page SEO metadata.'));
    } finally {
      setSavingPage(false);
    }
  };

  // Filtered pages
  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchPage.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchPage.toLowerCase()) ||
      (p.seoMetadata?.metaTitle && p.seoMetadata.metaTitle.toLowerCase().includes(searchPage.toLowerCase()))
  );

  // ── SEO Score Engine ──────────────────────────────────────────────────────
  interface SeoScoreResult {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    color: string;
    bg: string;
    border: string;
    titleScore: number;   // 0-100
    descScore: number;    // 0-100
    ogScore: number;      // 0-100
    titleIssues: string[];
    descIssues: string[];
    ogIssues: string[];
  }

  const computeSeoScore = (seo: PageSeoMetadata | null | undefined, pageTitle: string): SeoScoreResult => {
    const title = seo?.metaTitle || '';
    const desc = seo?.metaDescription || '';
    const ogImage = seo?.ogImageUrl || '';
    const ogTitle = seo?.ogTitle || '';
    const tLen = title.length;
    const dLen = desc.length;
    const titleIssues: string[] = [];
    const descIssues: string[] = [];
    const ogIssues: string[] = [];

    // Title scoring (0-100)
    let titleScore = 0;
    if (tLen === 0) {
      titleIssues.push('Missing — no meta title set');
    } else {
      if (tLen >= 30 && tLen <= 60) titleScore += 60;
      else if (tLen >= 20 && tLen < 30) { titleScore += 30; titleIssues.push(`Too short (${tLen} chars, min 30)`); }
      else if (tLen > 60 && tLen <= 70) { titleScore += 40; titleIssues.push(`Slightly long (${tLen} chars, max 60)`); }
      else if (tLen > 70) { titleScore += 10; titleIssues.push(`Too long — will be cut by Google (${tLen} chars)`); }
      else { titleIssues.push(`Very short (${tLen} chars)`); }
      // Brand name present
      if (title.toLowerCase().includes('gypsym') || title.includes('|')) titleScore += 20;
      else titleIssues.push('No brand name or separator detected');
      // Unique / not same as page title
      if (title !== pageTitle) titleScore += 20;
    }

    // Description scoring (0-100)
    let descScore = 0;
    if (dLen === 0) {
      descIssues.push('Missing — no meta description set');
    } else {
      if (dLen >= 120 && dLen <= 160) descScore += 60;
      else if (dLen >= 80 && dLen < 120) { descScore += 35; descIssues.push(`Short (${dLen} chars, ideal 120–160)`); }
      else if (dLen > 160 && dLen <= 200) { descScore += 40; descIssues.push(`Long (${dLen} chars, max 160)`); }
      else if (dLen > 200) { descScore += 15; descIssues.push(`Too long — Google will truncate (${dLen} chars)`); }
      else { descIssues.push(`Very short (${dLen} chars)`); }
      // Contains actionable language
      const actionWords = ['explore', 'discover', 'build', 'scale', 'get', 'learn', 'shop', 'find', 'start'];
      if (actionWords.some(w => desc.toLowerCase().includes(w))) descScore += 20;
      else descIssues.push('No call-to-action language detected');
      // Not duplicate of title
      if (!desc.toLowerCase().startsWith(title.toLowerCase().slice(0, 20))) descScore += 20;
    }

    // OG scoring (0-100)
    let ogScore = 0;
    if (ogImage) ogScore += 50; else ogIssues.push('No OG social image');
    if (ogTitle) ogScore += 30; else ogIssues.push('No OG title override');
    if (seo?.twitterCard === 'summary_large_image') ogScore += 20;

    // Weighted total: title 40%, desc 40%, og 20%
    const score = Math.round(titleScore * 0.4 + descScore * 0.4 + ogScore * 0.2);

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let color: string;
    let bg: string;
    let border: string;
    if (score >= 85)      { grade = 'A'; color = 'text-emerald-700'; bg = 'bg-emerald-50'; border = 'border-emerald-300'; }
    else if (score >= 70) { grade = 'B'; color = 'text-blue-700';    bg = 'bg-blue-50';    border = 'border-blue-300'; }
    else if (score >= 50) { grade = 'C'; color = 'text-amber-700';   bg = 'bg-amber-50';   border = 'border-amber-300'; }
    else if (score >= 30) { grade = 'D'; color = 'text-orange-700';  bg = 'bg-orange-50';  border = 'border-orange-300'; }
    else                  { grade = 'F'; color = 'text-rose-700';    bg = 'bg-rose-50';    border = 'border-rose-300'; }

    return { score, grade, color, bg, border, titleScore, descScore, ogScore, titleIssues, descIssues, ogIssues };
  };

  // Mini progress bar component
  const ScoreBar = ({ value, max = 100, color }: { value: number; max?: number; color: string }) => {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  // Character count indicators
  const titleLength = globalSeo.defaultTitle.length;
  const descLength = globalSeo.defaultDescription.length;

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-xs font-medium text-slate-500">Loading enterprise SEO engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Search className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">SEO & Metadata Management</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Fine-tune title tags, search snippets, OpenGraph social cards, canonical references, and page indexation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs gap-1.5"
            disabled={savingGlobal}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reload
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveGlobal()}
            disabled={savingGlobal}
            className="text-xs gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {savingGlobal ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : globalSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" /> Saved!
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Global SEO
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/90 p-1 border border-slate-200/80 rounded-xl h-auto">
          <TabsTrigger
            value="global"
            className="text-xs py-2 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-blue-600 font-medium"
          >
            <Globe className="h-3.5 w-3.5 mr-2" /> Global Defaults & SERP
          </TabsTrigger>
          <TabsTrigger
            value="pages"
            className="text-xs py-2 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-blue-600 font-medium"
          >
            <FileCode2 className="h-3.5 w-3.5 mr-2" /> Page-by-Page SEO ({pages.length})
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="text-xs py-2 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-blue-600 font-medium"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Sitemaps & Technical Health
          </TabsTrigger>
        </TabsList>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 1: GLOBAL DEFAULTS & SERP                               */}
        {/* ──────────────────────────────────────────────────────────── */}
        <TabsContent value="global" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Global Inputs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Primary Search Snippets */}
              <Card className="p-5 space-y-5 border-slate-200 shadow-2xs">
                <CardHeader className="p-0 border-b border-border/40 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Primary Search Engine Snippet
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        These default values are displayed on Google, Bing, and DuckDuckGo when pages do not have individual overrides.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono bg-blue-50/60 text-blue-700 border-blue-200">
                      Core Meta
                    </Badge>
                  </div>
                </CardHeader>

                <div className="space-y-4">
                  {/* Title Template */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">
                        Page Title Template
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Pattern: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">%s</code>
                      </span>
                    </div>
                    <Input
                      value={globalSeo.metaTitleTemplate}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, metaTitleTemplate: e.target.value })}
                      placeholder="%s | Gypsym Technology"
                      className="text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      The token <code className="bg-slate-100 text-slate-700 px-1 rounded">%s</code> will be automatically replaced with each sub-page&apos;s title (e.g. &quot;About | Gypsym Technology&quot;).
                    </p>
                  </div>

                  {/* Default / Homepage Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">
                        Default Homepage Meta Title
                      </label>
                      <span
                        className={`text-[11px] font-mono font-medium ${
                          titleLength > 60
                            ? 'text-amber-600'
                            : titleLength >= 40
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {titleLength} / 60 chars {titleLength > 60 && '(long)'}
                      </span>
                    </div>
                    <Input
                      value={globalSeo.defaultTitle}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, defaultTitle: e.target.value })}
                      placeholder="Gypsym Technology | Engineering the Global Enterprise"
                      className="text-xs"
                    />
                    <p className="text-[11px] text-slate-400">
                      Recommended between 45 and 60 characters to avoid truncation in Google SERP cards.
                    </p>
                  </div>

                  {/* Default Meta Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">
                        Default Homepage Meta Description
                      </label>
                      <span
                        className={`text-[11px] font-mono font-medium ${
                          descLength > 160
                            ? 'text-amber-600'
                            : descLength >= 120
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {descLength} / 160 chars {descLength > 160 && '(long)'}
                      </span>
                    </div>
                    <Textarea
                      rows={3}
                      value={globalSeo.defaultDescription}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, defaultDescription: e.target.value })}
                      placeholder="High-frequency architecture, resilient cloud engineering, and sovereign enterprise technology."
                      className="text-xs leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400">
                      Recommended between 120 and 160 characters. Provide compelling value propositions with strategic focus terms.
                    </p>
                  </div>

                  {/* Canonical Base URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      Canonical Base Domain / URL
                    </label>
                    <Input
                      value={globalSeo.canonicalBaseUrl}
                      onChange={(e) => setGlobalSeo({ ...globalSeo, canonicalBaseUrl: e.target.value })}
                      placeholder="https://gypsym.com"
                      className="text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      The primary public domain used for self-referential canonical tags and sitemap XML indexation.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Focus Keywords */}
              <Card className="p-5 space-y-4 border-slate-200 shadow-2xs">
                <CardHeader className="p-0 border-b border-border/40 pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" /> Focus Keywords & Phrases
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Strategic thematic keywords emitted in meta tags, Schema.org entities, and site taxonomy.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      placeholder="Type keyword and press Enter or comma (e.g. enterprise cloud)"
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddKeyword}
                      className="text-xs gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>

                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    {globalSeo.defaultKeywords.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No keywords added yet.</span>
                    ) : (
                      globalSeo.defaultKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs shadow-2xs font-medium group hover:border-blue-300"
                        >
                          <span>{kw}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(i)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </Card>

              {/* Social Share & OpenGraph */}
              <Card className="p-5 space-y-4 border-slate-200 shadow-2xs">
                <CardHeader className="p-0 border-b border-border/40 pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-blue-600" /> OpenGraph & Social Cards
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Default social banner image and metadata for links shared on LinkedIn, X (Twitter), Slack, and iMessage.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <ImageUploadField
                    label="Default OpenGraph Share Image"
                    description="Recommended resolution: 1200 x 630 px (1.91:1 ratio). PNG, WebP, or JPG up to 50MB."
                    value={globalSeo.ogDefaultImage}
                    onChange={(url) => setGlobalSeo({ ...globalSeo, ogDefaultImage: url })}
                    maxSizeMb={50}
                    placeholder="https://gypsym.com/og-default.png"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">Twitter / X Card Format</label>
                      <select
                        value={globalSeo.twitterCard}
                        onChange={(e) => setGlobalSeo({ ...globalSeo, twitterCard: e.target.value })}
                        className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                      >
                        <option value="summary_large_image">Large Image Card (Recommended)</option>
                        <option value="summary">Small Thumbnail Card</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">Publisher Twitter Handle</label>
                      <Input
                        value={globalSeo.twitterHandle}
                        onChange={(e) => setGlobalSeo({ ...globalSeo, twitterHandle: e.target.value })}
                        placeholder="@gypsymtech"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Crawler Directives & Webmaster Verification */}
              <Card className="p-5 space-y-4 border-slate-200 shadow-2xs">
                <CardHeader className="p-0 border-b border-border/40 pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" /> Crawlers & Webmaster Verification
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Directives for Googlebot, Bingbot, and domain ownership verification codes.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  {/* Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">Allow Indexing</div>
                        <div className="text-[11px] text-slate-400">Search engines may index this site</div>
                      </div>
                      <Switch
                        checked={globalSeo.robotsIndex}
                        onCheckedChange={(checked) => setGlobalSeo({ ...globalSeo, robotsIndex: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">Follow Links</div>
                        <div className="text-[11px] text-slate-400">Allow crawlers to follow outbound links</div>
                      </div>
                      <Switch
                        checked={globalSeo.robotsFollow}
                        onCheckedChange={(checked) => setGlobalSeo({ ...globalSeo, robotsFollow: checked })}
                      />
                    </div>
                  </div>

                  {/* Verification Tokens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Google Search Console Token
                      </label>
                      <Input
                        value={globalSeo.googleVerification}
                        onChange={(e) => setGlobalSeo({ ...globalSeo, googleVerification: e.target.value })}
                        placeholder="google-site-verification token"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Bing Webmaster Verification
                      </label>
                      <Input
                        value={globalSeo.bingVerification}
                        onChange={(e) => setGlobalSeo({ ...globalSeo, bingVerification: e.target.value })}
                        placeholder="msvalidate.01 token"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Live Interactive Previews */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-20 space-y-6">
                <Card className="border-slate-200 shadow-md overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-bold tracking-tight">Live SERP & Social Preview</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('google')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          previewTab === 'google'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Google
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('social')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          previewTab === 'social'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Social Card
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    {previewTab === 'google' ? (
                      <div className="space-y-3">
                        {/* Device switcher */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            Google Search Result
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewDevice('desktop')}
                              className={`p-1.5 rounded-md text-xs transition-colors ${
                                previewDevice === 'desktop'
                                  ? 'bg-slate-100 text-blue-600'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title="Desktop View"
                            >
                              <Monitor className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewDevice('mobile')}
                              className={`p-1.5 rounded-md text-xs transition-colors ${
                                previewDevice === 'mobile'
                                  ? 'bg-slate-100 text-blue-600'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title="Mobile View"
                            >
                              <Smartphone className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Snippet Card */}
                        <div
                          className={`rounded-xl border border-slate-200/90 bg-white p-4 font-sans space-y-1.5 shadow-2xs ${
                            previewDevice === 'mobile' ? 'max-w-[340px] mx-auto' : 'w-full'
                          }`}
                        >
                          {/* Breadcrumb / URL */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              G
                            </div>
                            <div className="truncate flex flex-col leading-none">
                              <span className="text-[11px] font-medium text-slate-800 truncate">
                                Gypsym Technology
                              </span>
                              <span className="text-[10px] text-slate-500 truncate font-mono">
                                {globalSeo.canonicalBaseUrl.replace(/^https?:\/\//, '')}
                              </span>
                            </div>
                          </div>

                          {/* Blue Title Link */}
                          <h3 className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer leading-snug line-clamp-2">
                            {globalSeo.defaultTitle || 'Gypsym Technology | Engineering the Global Enterprise'}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                            {globalSeo.defaultDescription ||
                              'Gypsym Technology partners with Fortune 100 leaders to architect zero-downtime cloud cores, sovereign AI ecosystems, and high-frequency distributed ledgers.'}
                          </p>

                          {/* Directives Indicator */}
                          <div className="pt-2 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                globalSeo.robotsIndex
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {globalSeo.robotsIndex ? <CheckCircle2 className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                              {globalSeo.robotsIndex ? 'index, follow' : 'noindex, nofollow'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Social Share Card Preview */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            LinkedIn & X Share Preview
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">1200 x 630</span>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                          {/* Image Box */}
                          <div className="relative aspect-[1.91/1] w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200">
                            {globalSeo.ogDefaultImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={globalSeo.ogDefaultImage}
                                alt="Social preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center p-4 text-slate-400 space-y-1">
                                <Share2 className="h-8 w-8 text-slate-300" />
                                <span className="text-[11px]">No OpenGraph image specified</span>
                              </div>
                            )}
                          </div>

                          {/* Content Box */}
                          <div className="p-3.5 space-y-1 bg-slate-50/50">
                            <div className="text-[10px] uppercase font-mono font-medium text-slate-400">
                              {globalSeo.canonicalBaseUrl.replace(/^https?:\/\//, '')}
                            </div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">
                              {globalSeo.defaultTitle}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {globalSeo.defaultDescription}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Diagnostics */}
                <Card className="p-4 border-slate-200 shadow-2xs space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> SEO Optimization Status
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li className="flex items-center justify-between">
                      <span>Title length ({titleLength}/60):</span>
                      <span className={titleLength <= 60 && titleLength >= 30 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {titleLength <= 60 && titleLength >= 30 ? 'Optimal' : 'Needs attention'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Description ({descLength}/160):</span>
                      <span className={descLength <= 160 && descLength >= 100 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {descLength <= 160 && descLength >= 100 ? 'Optimal' : 'Review length'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Canonical Domain:</span>
                      <span className="font-mono text-slate-800 font-medium truncate max-w-[140px]">
                        {globalSeo.canonicalBaseUrl || 'Not set'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Social Share Asset:</span>
                      <span className={globalSeo.ogDefaultImage ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {globalSeo.ogDefaultImage ? 'Configured' : 'Missing'}
                      </span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 2: PAGE-BY-PAGE SEO STUDIO                              */}
        {/* ──────────────────────────────────────────────────────────── */}
        <TabsContent value="pages" className="space-y-4">
          <Card className="border-slate-200 shadow-2xs">
            <CardHeader className="p-5 border-b border-border/40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Page-Specific Search Metadata
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Tailor unique titles, descriptions, social previews, and indexation flags for every page on your site.
                  </CardDescription>
                </div>

                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search pages by title or slug..."
                    value={searchPage}
                    onChange={(e) => setSearchPage(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            {/* ── Overall SEO Health Summary Bar ── */}
            {pages.length > 0 && (() => {
              const scores = pages.map(p => computeSeoScore(p.seoMetadata, p.title));
              const avgScore = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
              const gradeA = scores.filter(s => s.grade === 'A').length;
              const gradeB = scores.filter(s => s.grade === 'B').length;
              const gradeC = scores.filter(s => s.grade === 'C').length;
              const gradeBad = scores.filter(s => s.grade === 'D' || s.grade === 'F').length;
              const avgColor =
                avgScore >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                avgScore >= 70 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                avgScore >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                 'text-rose-700 bg-rose-50 border-rose-200';
              const barW = avgScore;
              const barC =
                avgScore >= 85 ? 'bg-emerald-500' :
                avgScore >= 70 ? 'bg-blue-500' :
                avgScore >= 50 ? 'bg-amber-500' :
                                 'bg-rose-500';
              return (
                <div className="mx-5 mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Average score ring */}
                    <div className={`shrink-0 flex flex-col items-center justify-center h-16 w-16 rounded-2xl border-2 ${avgColor}`}>
                      <span className="text-xl font-black leading-none">{avgScore}</span>
                      <span className="text-[10px] font-semibold leading-none mt-0.5">AVG</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Overall Site SEO Health</span>
                        <span className="text-[10px] text-slate-500">{pages.length} pages analyzed</span>
                      </div>
                      {/* Overall progress bar */}
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barC}`} style={{ width: `${barW}%` }} />
                      </div>
                      {/* Grade breakdown */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          A {gradeA}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                          B {gradeB}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          C {gradeC}
                        </span>
                        {gradeBad > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                            D/F {gradeBad} — needs attention
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="divide-y divide-slate-100">
              {filteredPages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No pages found matching &quot;{searchPage}&quot;.
                </div>
              ) : (
                filteredPages.map((page) => {
                  const seo = page.seoMetadata;
                  const scoreResult = computeSeoScore(seo, page.title);
                  const { score, grade, color, bg, border, titleScore, descScore, ogScore, titleIssues, descIssues, ogIssues } = scoreResult;
                  const isNoIndex = seo?.noIndex || seo?.robotsIndex === false;
                  const allIssues = [...titleIssues, ...descIssues, ...ogIssues];
                  const titleLen = (seo?.metaTitle || '').length;
                  const descLen = (seo?.metaDescription || '').length;



                  return (
                    <div
                      key={page.id || page.slug}
                      className="p-4 sm:p-5 flex flex-col gap-4 hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none"
                    >
                      {/* Top row: title, slug, badges, action buttons */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{page.title}</span>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              /{page.slug === 'home' ? '' : page.slug}
                            </span>
                            {isNoIndex ? (
                              <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">noindex</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">index</Badge>
                            )}
                          </div>

                          {/* Google Snippet Preview */}
                          <div className="text-xs text-blue-600 font-medium truncate">
                            {seo?.metaTitle || `${page.title} | Gypsym Technology`}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {seo?.metaDescription || page.description || globalSeo.defaultDescription || 'No description set.'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* SEO Grade Badge */}
                          <div className={`h-9 w-9 rounded-xl border-2 ${border} ${bg} flex flex-col items-center justify-center shrink-0`}>
                            <span className={`text-sm font-black leading-none ${color}`}>{grade}</span>
                            <span className={`text-[9px] font-bold leading-none ${color} mt-0.5`}>{score}</span>
                          </div>

                          <a
                            href={`${globalSeo.canonicalBaseUrl || 'http://localhost:3000'}/${page.slug === 'home' ? '' : page.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Live Page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditPage(page)}
                            className="text-xs gap-1.5 font-medium border-slate-300"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-600" /> Edit SEO
                          </Button>
                        </div>
                      </div>

                      {/* Score Bars */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Title Score */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Title</span>
                            <span className={`text-[10px] font-bold font-mono ${
                              titleScore >= 80 ? 'text-emerald-600' : titleScore >= 55 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {titleScore}/100
                            </span>
                          </div>
                          <ScoreBar
                            value={titleScore}
                            color={titleScore >= 80 ? 'bg-emerald-500' : titleScore >= 55 ? 'bg-amber-500' : 'bg-rose-500'}
                          />
                          <div className="text-[10px] text-slate-400 font-mono">
                            {titleLen > 0 ? `${titleLen} chars` : 'Not set'}
                            {titleLen > 0 && (
                              <span className={`ml-1 ${titleLen >= 30 && titleLen <= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {titleLen >= 30 && titleLen <= 60 ? '✓' : titleLen < 30 ? '(too short)' : '(too long)'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description Score */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Description</span>
                            <span className={`text-[10px] font-bold font-mono ${
                              descScore >= 80 ? 'text-emerald-600' : descScore >= 55 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {descScore}/100
                            </span>
                          </div>
                          <ScoreBar
                            value={descScore}
                            color={descScore >= 80 ? 'bg-emerald-500' : descScore >= 55 ? 'bg-amber-500' : 'bg-rose-500'}
                          />
                          <div className="text-[10px] text-slate-400 font-mono">
                            {descLen > 0 ? `${descLen} chars` : 'Not set'}
                            {descLen > 0 && (
                              <span className={`ml-1 ${descLen >= 120 && descLen <= 160 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {descLen >= 120 && descLen <= 160 ? '✓' : descLen < 120 ? '(short)' : '(too long)'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* OG / Social Score */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Social</span>
                            <span className={`text-[10px] font-bold font-mono ${
                              ogScore >= 80 ? 'text-emerald-600' : ogScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {ogScore}/100
                            </span>
                          </div>
                          <ScoreBar
                            value={ogScore}
                            color={ogScore >= 80 ? 'bg-emerald-500' : ogScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}
                          />
                          <div className="text-[10px] text-slate-400">
                            {seo?.ogImageUrl ? '✓ OG image' : '✗ No OG image'}
                          </div>
                        </div>
                      </div>

                      {/* Issues list — only shown when there are problems */}
                      {allIssues.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {allIssues.map((issue, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium"
                            >
                              <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                              {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 3: SITEMAP & TECHNICAL HEALTH                           */}
        {/* ──────────────────────────────────────────────────────────── */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sitemap Card */}
            <Card className="p-5 border-slate-200 shadow-2xs space-y-4">
              <CardHeader className="p-0 border-b border-border/40 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-blue-600" /> XML Sitemap Generator
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Live
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Dynamically compiled XML sitemap submitted to Google Search Console and Bing Webmaster.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                  <span>/sitemap.xml</span>
                  <a
                    href="http://localhost:3000/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-sans text-xs"
                  >
                    View XML <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Included Core Routes:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                    <li>Homepage (priority: 1.0, daily)</li>
                    <li>Services & Solutions (priority: 0.9, weekly)</li>
                    <li>Portfolio Case Studies (priority: 0.85, weekly)</li>
                    <li>Corporate Legal & Trust Pages (privacy, terms, certifications, cookies)</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Robots.txt Card */}
            <Card className="p-5 border-slate-200 shadow-2xs space-y-4">
              <CardHeader className="p-0 border-b border-border/40 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" /> Robots.txt & AI Directives
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Active
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Crawler protection governing web crawlers, AI scraping bots, and private API routes.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                  <span>/robots.txt</span>
                  <a
                    href="http://localhost:3000/robots.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-sans text-xs"
                  >
                    View TXT <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono leading-relaxed overflow-x-auto">
{`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: GPTBot, Google-Extended, anthropic-ai
Allow: /
Disallow: /api/, /admin/

Sitemap: https://gypsym.com/sitemap.xml`}
                </pre>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* EDIT PAGE SEO DIALOG                                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Dialog open={Boolean(editingPage)} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" />
              Edit SEO for &quot;{editingPage?.title}&quot;
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure search engine snippets, canonical tags, and OpenGraph social banner for{' '}
              <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">
                /{editingPage?.slug === 'home' ? '' : editingPage?.slug}
              </code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">Meta Title</label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(pageSeoDraft.metaTitle || '').length} / 60 chars
                </span>
              </div>
              <Input
                value={pageSeoDraft.metaTitle || ''}
                onChange={(e) => setPageSeoDraft({ ...pageSeoDraft, metaTitle: e.target.value })}
                placeholder={editingPage?.title || 'Enter page title'}
                className="text-xs"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">Meta Description</label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(pageSeoDraft.metaDescription || '').length} / 160 chars
                </span>
              </div>
              <Textarea
                rows={3}
                value={pageSeoDraft.metaDescription || ''}
                onChange={(e) => setPageSeoDraft({ ...pageSeoDraft, metaDescription: e.target.value })}
                placeholder="Brief summary of this specific page's purpose and offerings."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Canonical URL Override */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Canonical URL Override (Optional)
              </label>
              <Input
                value={pageSeoDraft.canonicalUrl || ''}
                onChange={(e) => setPageSeoDraft({ ...pageSeoDraft, canonicalUrl: e.target.value })}
                placeholder="Leave blank to use default page URL"
                className="text-xs font-mono"
              />
            </div>

            {/* Social Share Image for this page */}
            <div className="space-y-1.5">
              <ImageUploadField
                label="Page-Specific Social Share Image (Optional)"
                description="Custom OpenGraph image for when this specific page is shared. Defaults to global image if empty."
                value={pageSeoDraft.ogImageUrl || ''}
                onChange={(url) => setPageSeoDraft({ ...pageSeoDraft, ogImageUrl: url })}
                maxSizeMb={50}
                placeholder="https://gypsym.com/assets/og-page.png"
              />
            </div>

            {/* Indexing Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">Search Engine Indexing</div>
                <div className="text-[11px] text-slate-500">
                  {pageSeoDraft.noIndex
                    ? 'Hidden from Google & Bing (noindex)'
                    : 'Search engines will index this page'}
                </div>
              </div>
              <Switch
                checked={!pageSeoDraft.noIndex}
                onCheckedChange={(indexed) =>
                  setPageSeoDraft({ ...pageSeoDraft, noIndex: !indexed })
                }
              />
            </div>

            {/* Mini SERP Preview */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Google Search Snippet Preview
              </div>
              <div className="text-sm font-medium text-[#1a0dab] line-clamp-1">
                {pageSeoDraft.metaTitle || editingPage?.title || 'Gypsym Technology'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {globalSeo.canonicalBaseUrl || 'https://gypsym.com'}/
                {editingPage?.slug === 'home' ? '' : editingPage?.slug}
              </div>
              <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {pageSeoDraft.metaDescription ||
                  editingPage?.description ||
                  globalSeo.defaultDescription}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingPage(null)}
              disabled={savingPage}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSavePageSeo}
              disabled={savingPage}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {savingPage ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Page SEO
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
