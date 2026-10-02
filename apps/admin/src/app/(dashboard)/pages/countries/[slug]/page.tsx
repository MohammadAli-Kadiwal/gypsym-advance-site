'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Globe,
  Save,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Eye,
  Monitor,
  Smartphone,
  Loader2,
  Coins,
  Clock,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { StatusToggleField } from '@/components/crud/status-toggle-field';
import { getSiteUrl } from '@/lib/site-url';
import type { PageData } from '../../_components/types';
import {
  ALL_CURRENCIES,
  getCountryMeta,
} from '../../_components/country-locales';
import { TimezoneSearchSelect } from '../../_components/timezone-search-select';

const EIGHT_SECTIONS_SPEC = [
  { id: 'hero-banner',              type: 'HERO',               label: '1. Hero Section',          desc: 'Localized headline, subtext, background image & CTA' },
  { id: 'verified-results-metrics', type: 'VERIFIED_RESULTS',   label: '2. Verified Results',       desc: '+318% volume surge, 42ms TTFB, $1.4B+ GMV' },
  { id: 'portfolio-showcase',       type: 'PORTFOLIO',          label: '3. Portfolio',              desc: 'High-conversion flagship case studies' },
  { id: 'delivery-process',         type: 'DELIVERY_PROCESS',   label: '4. Delivery Methodology',   desc: '4-phase architecture, build, CRO & SLA' },
  { id: 'client-testimonials',      type: 'CLIENT_TESTIMONIALS',label: '5. Client Love',            desc: 'Executive endorsements & client ratings' },
  { id: 'clients-partners',         type: 'CLIENTS_PARTNERS',   label: '6. Clients & Partners',     desc: 'Global enterprise logo cloud & metrics ribbon' },
  { id: 'contact-inquiry',          type: 'CONTACT',            label: '7. Direct Engagement',      desc: 'High-intent consultation form with NDA' },
  { id: 'homepage-cta',             type: 'CTA',                label: '8. Enterprise Architecture',desc: 'Final conversion banner before footer' },
];

export default function CountryStudioPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [page, setPage] = React.useState<PageData | null>(null);
  const [activeTab, setActiveTab] = React.useState('hero');
  const [previewViewport, setPreviewViewport] = React.useState<'desktop' | 'mobile'>('desktop');

  // Hero Section Form Fields
  const [heroTitle, setHeroTitle] = React.useState('');
  const [heroTitleHighlight, setHeroTitleHighlight] = React.useState('');
  const [heroDescription, setHeroDescription] = React.useState('');
  const [heroContent, setHeroContent] = React.useState('');
  const [heroCurrency, setHeroCurrency] = React.useState('USD');
  const [heroTimezone, setHeroTimezone] = React.useState('America/New_York');
  const [heroBgImage, setHeroBgImage] = React.useState('');
  const [heroOverlayOpacity, setHeroOverlayOpacity] = React.useState(0.38);
  const [heroCtaLabel, setHeroCtaLabel] = React.useState('');
  const [heroCtaUrl, setHeroCtaUrl] = React.useState('#contact-inquiry');
  const [heroClientStripTitle, setHeroClientStripTitle] = React.useState('');

  // Page Level SEO
  const [pageTitle, setPageTitle] = React.useState('');
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDesc, setMetaDesc] = React.useState('');
  const [pageStatus, setPageStatus] = React.useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  const loadPageData = React.useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await fetchApi<PageData>(`/pages/${slug}`);
      if (data) {
        setPage(data);
        setPageTitle(data.title || slug);
        setPageStatus((data.status as any) || 'PUBLISHED');

        const seo = data.seoMetadata;
        setMetaTitle(seo?.metaTitle || data.title || '');
        setMetaDesc(seo?.metaDescription || data.description || '');

        // Extract Hero Section payload (ignore home-inherited sections)
        const heroSection = data.sections?.find(
          (s) => s.componentType === 'HERO' && !s.id.startsWith('home-inherited-')
        );
        const p = (heroSection?.contentPayload as Record<string, any>) || {};
        const meta = getCountryMeta(data.slug || slug, data.title, p);

        let headlineStr = '';
        if (Array.isArray(p.headline?.segments) && p.headline.segments.length > 0) {
          headlineStr = p.headline.segments.map((seg: any) => seg.value || seg.text || '').join('');
        }
        setHeroTitle(headlineStr || data.title || `${meta.name} E-Commerce Architecture`);
        setHeroTitleHighlight(p.titleHighlight || '');
        setHeroDescription(
          p.description?.content ||
            data.description ||
            `Enterprise Shopify Plus development & headless digital solutions tailored for high-growth merchants in ${meta.name}.`
        );
        setHeroContent(p.content || p.country?.content || (data as any).content || '');
        setHeroCurrency(p.country?.currency || meta.currency || 'USD');
        setHeroTimezone(p.country?.timezone || meta.timezone || 'America/New_York');
        setHeroBgImage(p.backgroundMedia?.desktopImageUrl || `/images/countries/${data.slug || slug}.jpg`);
        setHeroOverlayOpacity(p.backgroundMedia?.overlayOpacity ?? 0.38);
        setHeroCtaLabel(p.primaryCta?.label || 'Schedule an Architectural Briefing');
        setHeroCtaUrl(p.primaryCta?.url || '#contact-inquiry');
        setHeroClientStripTitle(p.clientStrip?.title || 'Trusted by enterprise leaders');
      }
    } catch {
      notify.error(`Failed to load page data for /${slug}`);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const targetSlug = page?.slug || slug;

      // 1. Update Page & SEO Metadata
      const updatedPage = await fetchApi<PageData>(`/pages/${targetSlug}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: pageTitle || slug,
          description: heroDescription,
          status: pageStatus,
          seoMetadata: {
            metaTitle: metaTitle || pageTitle || slug,
            metaDescription: metaDesc || heroDescription,
            canonicalUrl: `https://gypsym.com/${targetSlug}`,
            robotsIndex: true,
            robotsFollow: true,
          },
        }),
      });

      // 2. Update or Create Hero Section
      const existingHero = (updatedPage?.sections || page?.sections)?.find(
        (s) => s.componentType === 'HERO' && !s.id.startsWith('home-inherited-')
      );
      const curPayload = (existingHero?.contentPayload as Record<string, any>) || {};
      const updatedPayload = {
        ...curPayload,
        content: heroContent.trim() || undefined,
        country: {
          ...curPayload.country,
          content: heroContent.trim() || undefined,
          currency: heroCurrency,
          timezone: heroTimezone,
        },
        headline: {
          ...curPayload.headline,
          segments: [
            { value: heroTitle || pageTitle || targetSlug, type: 'text' },
          ],
        },
        titleHighlight: heroTitleHighlight,
        description: {
          ...curPayload.description,
          content: heroDescription,
          enabled: true,
        },
        primaryCta: {
          ...curPayload.primaryCta,
          label: heroCtaLabel,
          url: heroCtaUrl,
          enabled: true,
        },
        backgroundMedia: {
          ...curPayload.backgroundMedia,
          desktopImageUrl: heroBgImage,
          mobileImageUrl: heroBgImage,
          overlayOpacity: heroOverlayOpacity,
          overlayColor: '#000000',
        },
        clientStrip: {
          ...curPayload.clientStrip,
          title: heroClientStripTitle,
          enabled: true,
        },
      };

      if (existingHero && existingHero.id) {
        await fetchApi(`/sections/${existingHero.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: updatedPayload,
          }),
        });
      } else {
        await fetchApi(`/pages/${targetSlug}/sections`, {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'hero-banner',
            componentType: 'HERO',
            displayOrder: 1,
            isActive: true,
            contentPayload: updatedPayload,
          }),
        });
      }

      notify.success(`Country page "/${targetSlug}" saved successfully.`);
      await loadPageData();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const liveUrl = `${getSiteUrl()}/${slug}`;

  if (loading) {
    return (
      <AdminContentContainer variant="wide">
        <div className="w-full py-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs">Loading Country Studio...</span>
        </div>
      </AdminContentContainer>
    );
  }

  return (
    <AdminContentContainer variant="wide">
      {/* Unified Admin Page Header */}
      <AdminPageHeader
        backHref="/pages/countries"
        backLabel="Country Pages"
        title={pageTitle || slug}
        status={
          <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20">
            /{slug}
          </Badge>
        }
        description="Complete 8-section localized country landing page."
        actions={
          <div className="flex items-center gap-2">
            <StatusToggleField
              value={pageStatus}
              onChange={(s) => setPageStatus(s as any)}
              variant="compact"
            />

            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
            >
              <span>Live Page</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={loadPageData}
              disabled={saving}
              className="cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${saving ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5 shadow-xs cursor-pointer"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save All Changes</span>
            </Button>
          </div>
        }
      />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Studio Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <TabsList className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 h-auto gap-1.5 w-fit flex flex-wrap shadow-2xs">
              <TabsTrigger
                value="hero"
                className="inline-flex items-center gap-2 rounded-xl py-2 px-4 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Hero Settings</span>
              </TabsTrigger>
              <TabsTrigger
                value="sections"
                className="inline-flex items-center gap-2 rounded-xl py-2 px-4 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>2. 8-Section Layout</span>
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="inline-flex items-center gap-2 rounded-xl py-2 px-4 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>3. SEO &amp; Meta</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Hero Settings */}
            <TabsContent value="hero" className="space-y-4">
              <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Hero Headline &amp; Messaging</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure the top editorial headline, highlight words, and localized description.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Hero Main Title / Headline</label>
                  <Input
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Enterprise Shopify Plus Engineering for the United States"
                    className="rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Title Highlight Segment</label>
                  <Input
                    value={heroTitleHighlight}
                    onChange={(e) => setHeroTitleHighlight(e.target.value)}
                    placeholder="e.g. United States"
                    className="rounded-xl text-xs"
                  />
                  <span className="text-[10px] text-slate-400">
                    Matches words in headline to render with elegant serif italic typography.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Hero Subtitle / Description</label>
                  <Textarea
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    rows={2}
                    placeholder="Detailed localized value proposition and engineering capability..."
                    className="rounded-xl text-xs leading-relaxed resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span>Page Content / Market Narrative (Rich Text)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Supports markdown, headings, lists, quotes &amp; preview
                    </span>
                  </div>
                  <RichTextEditor
                    value={heroContent}
                    onChange={setHeroContent}
                    placeholder="Full narrative content, regional focus, market background, case studies, or strategic commerce positioning..."
                    minHeight="260px"
                  />
                </div>

                {/* Localization: Currency & Timezone */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      <span>Market Currency ({ALL_CURRENCIES.length} Available)</span>
                    </label>
                    <select
                      value={heroCurrency}
                      onChange={(e) => setHeroCurrency(e.target.value)}
                      className="w-full h-9 rounded-xl border border-input bg-white px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {ALL_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-sky-500" />
                      <span>Business Timezone (Type &amp; Search)</span>
                    </label>
                    <TimezoneSearchSelect
                      value={heroTimezone}
                      onChange={setHeroTimezone}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Primary CTA Button Label</label>
                    <Input
                      value={heroCtaLabel}
                      onChange={(e) => setHeroCtaLabel(e.target.value)}
                      placeholder="Schedule an Architectural Briefing"
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Primary CTA Target URL</label>
                    <Input
                      value={heroCtaUrl}
                      onChange={(e) => setHeroCtaUrl(e.target.value)}
                      placeholder="#contact-inquiry"
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-700">Client Marquee Strip Title</label>
                  <Input
                    value={heroClientStripTitle}
                    onChange={(e) => setHeroClientStripTitle(e.target.value)}
                    placeholder="The agency behind .."
                    className="rounded-xl text-xs"
                  />
                </div>
              </Card>

              {/* Background Image Card */}
              <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Hero Background Image</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload an architectural photograph or provide a CDN image URL.
                  </p>
                </div>

                <ImageUploadField
                  value={heroBgImage}
                  onChange={setHeroBgImage}
                  label="Select or Upload Background"
                  description="High resolution 1920x1080 modern architectural photo recommended."
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Image URL Path</label>
                  <Input
                    value={heroBgImage}
                    onChange={(e) => setHeroBgImage(e.target.value)}
                    placeholder="/images/countries/united-states.jpg"
                    className="rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Dark Overlay Opacity</span>
                    <span className="font-mono text-blue-600">{Math.round(heroOverlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={heroOverlayOpacity}
                    onChange={(e) => setHeroOverlayOpacity(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>10% (Bright)</span>
                    <span>38% (Recommended)</span>
                    <span>80% (Dark)</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 2: 8-Section Layout */}
            <TabsContent value="sections" className="space-y-4">
              <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Guaranteed 8-Section Architecture</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sections are loaded and rendered in exact user-defined sequence.
                  </p>
                </div>

                <div className="space-y-2">
                  {EIGHT_SECTIONS_SPEC.map((spec, index) => {
                    return (
                      <div
                        key={spec.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                              <span>{spec.label.replace(/^\d+\.\s*/, '')}</span>
                              <Badge variant="outline" className="text-[9px] font-mono bg-white border-slate-200 text-slate-600">
                                {spec.type}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {spec.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* TAB 3: SEO */}
            <TabsContent value="seo" className="space-y-4">
              <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Search Engine Optimization (SEO)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize SERP titles, descriptions, and canonical parameters.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Meta Title Tag</label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Shopify Plus Agency | Country"
                    className="rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Meta Description Tag</label>
                  <Textarea
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    rows={3}
                    placeholder="High-converting search snippet under 160 characters..."
                    className="rounded-xl text-xs leading-relaxed resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Canonical URL</label>
                  <Input
                    value={`https://gypsym.com/${slug}`}
                    readOnly
                    className="rounded-xl text-xs font-mono bg-slate-50 text-slate-500"
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Live Mobile / Desktop Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 sticky top-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              Live Visual Preview
            </span>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setPreviewViewport('desktop')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  previewViewport === 'desktop'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setPreviewViewport('mobile')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  previewViewport === 'mobile'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Device Frame */}
          <div
            className={`mx-auto bg-slate-900 rounded-[28px] p-2.5 shadow-xl border-4 border-slate-800 transition-all ${
              previewViewport === 'mobile' ? 'max-w-[320px]' : 'w-full'
            }`}
          >
            {/* Screen Content Preview */}
            <div className="rounded-[20px] overflow-hidden bg-[#f4f3ef] text-slate-900 relative">
              {/* Hero Banner Preview */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-950 flex flex-col justify-between p-4 text-center">
                {heroBgImage && (
                  <img
                    src={heroBgImage}
                    alt="Hero Preview"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    onError={(e) => {
                      (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200';
                    }}
                  />
                )}
                <div
                  className="absolute inset-0 bg-black pointer-events-none"
                  style={{ opacity: heroOverlayOpacity }}
                />

                <div className="relative z-10 space-y-2 my-auto">
                  <h2 className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-md">
                    {heroTitle || 'Enterprise Shopify Plus Engineering'}
                  </h2>
                  <p className="text-white/80 text-[10px] max-w-xs mx-auto line-clamp-2 leading-relaxed drop-shadow">
                    {heroDescription}
                  </p>
                  <div className="pt-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-white text-slate-950 text-[10px] font-bold shadow-md">
                      {heroCtaLabel || 'Schedule Briefing'}
                    </span>
                  </div>
                </div>

                {/* Client Strip Preview */}
                <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-white/70">
                  <span className="truncate max-w-[180px]">{heroClientStripTitle}</span>
                  <span className="font-mono text-emerald-400">● 99.99% Uptime</span>
                </div>
              </div>

              {/* 8-Section Flow Diagram in Device */}
              <div className="p-3 space-y-1.5 bg-muted text-[9px] font-medium text-muted-foreground">
                <div className="text-center font-bold text-muted-foreground text-[8px] uppercase tracking-wider py-0.5">
                  Page Sections Below Fold
                </div>
                {EIGHT_SECTIONS_SPEC.slice(1).map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-1.5 bg-card rounded-lg border border-border shadow-2xs flex items-center justify-between"
                  >
                    <span className="truncate font-semibold text-foreground">{sec.label}</span>
                    <span className="text-[8px] text-primary font-mono">Order {idx + 2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminContentContainer>
  );
}
