'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Globe,
  ArrowLeft,
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
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import type { PageData } from '../../_components/types';

const EIGHT_SECTIONS_SPEC = [
  { id: 'hero-banner', type: 'HERO', label: '1. Hero Section', desc: 'Prominent banner with localized headline, subtext, background image & CTA' },
  { id: 'portfolio-showcase', type: 'FEATURE_GRID', label: '2. Portfolio Component', desc: 'Flagship client store deployments and conversion case studies' },
  { id: 'verified-results-metrics', type: 'METRICS_BANNER', label: '3. Verified Results', desc: '+318% volume surge, 42ms TTFB, $1.4B+ GMV metrics strip' },
  { id: 'clients-partners', type: 'LOGO_CLOUD', label: '4. Clients & Partners', desc: 'Enterprise logo cloud and performance ribbon' },
  { id: 'delivery-process', type: 'TABBED_SOLUTIONS', label: '5. Delivery Methodology', desc: '4-phase engineering lifecycle: Audit, Build, CRO & SLA' },
  { id: 'client-testimonials', type: 'TESTIMONIAL_SLIDER', label: '6. Client Love', desc: 'Executive endorsements, client ratings & reviews slider' },
  { id: 'contact-inquiry', type: 'CONTACT', label: '7. Direct Engagement', desc: 'Engineering inquiry consultation form with NDA guarantee' },
  { id: 'homepage-cta', type: 'CTA', label: '8. Enterprise Architecture', desc: 'Final conversion banner before footer' },
];

export default function CountryStudioPage() {
  const router = useRouter();
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

        // Extract Hero Section payload
        const heroSection = data.sections?.find((s) => s.componentType === 'HERO');
        if (heroSection) {
          const p = (heroSection.contentPayload as Record<string, any>) || {};
          let headlineStr = data.title || '';
          if (Array.isArray(p.headline?.segments)) {
            headlineStr = p.headline.segments.map((seg: any) => seg.value || seg.text || '').join('');
          }
          setHeroTitle(headlineStr || data.title || '');
          setHeroTitleHighlight(p.titleHighlight || '');
          setHeroDescription(p.description?.content || data.description || '');
          setHeroBgImage(p.backgroundMedia?.desktopImageUrl || `/images/countries/${slug}.jpg`);
          setHeroOverlayOpacity(p.backgroundMedia?.overlayOpacity ?? 0.38);
          setHeroCtaLabel(p.primaryCta?.label || 'Schedule an Architectural Briefing');
          setHeroCtaUrl(p.primaryCta?.url || '#contact-inquiry');
          setHeroClientStripTitle(p.clientStrip?.title || 'Trusted by enterprise leaders ..');
        }
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
    if (!page) return;
    setSaving(true);
    try {
      // 1. Update Page
      await fetchApi(`/pages/${slug}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: pageTitle,
          description: heroDescription,
          status: pageStatus,
          seoMetadata: {
            metaTitle: metaTitle || pageTitle,
            metaDescription: metaDesc || heroDescription,
            canonicalUrl: `https://gypsym.com/${slug}`,
            robotsIndex: true,
            robotsFollow: true,
          },
        }),
      });

      // 2. Update Hero Section
      const heroSection = page.sections?.find((s) => s.componentType === 'HERO');
      if (heroSection && heroSection.id) {
        const curPayload = (heroSection.contentPayload as Record<string, any>) || {};
        const updatedPayload = {
          ...curPayload,
          headline: {
            ...curPayload.headline,
            segments: [
              { value: heroTitle, type: 'text' },
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

        await fetchApi(`/sections/${heroSection.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: updatedPayload,
          }),
        });
      }

      notify.success(`Country page "/${slug}" saved successfully.`);
      await loadPageData();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const liveUrl = `http://localhost:3000/${slug}`;

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        <span className="text-xs">Loading Country Studio...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in-50 duration-200">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/pages/countries')}
            className="rounded-xl h-8 px-2.5 border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Country Pages</span>
          </Button>

          <div className="h-4 w-px bg-slate-200" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {pageTitle || slug}
              </h1>
              <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">
                /{slug}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Complete 8-section localized country landing page.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
          >
            <span>Live Page</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={loadPageData}
            disabled={saving}
            className="rounded-xl border-slate-200 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${saving ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            <span>Save All Changes</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Studio Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <TabsList className="w-full grid grid-cols-3 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
              <TabsTrigger value="hero" className="rounded-xl py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">
                1. Hero Settings
              </TabsTrigger>
              <TabsTrigger value="sections" className="rounded-xl py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">
                2. 8-Section Layout
              </TabsTrigger>
              <TabsTrigger value="seo" className="rounded-xl py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">
                3. SEO &amp; Meta
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
                    rows={3}
                    placeholder="Detailed localized value proposition and engineering capability..."
                    className="rounded-xl text-xs leading-relaxed resize-none"
                  />
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
              <div className="p-3 space-y-1.5 bg-slate-100 text-[9px] font-medium text-slate-600">
                <div className="text-center font-bold text-slate-400 text-[8px] uppercase tracking-wider py-0.5">
                  Page Sections Below Fold
                </div>
                {EIGHT_SECTIONS_SPEC.slice(1).map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-between"
                  >
                    <span className="truncate font-semibold text-slate-800">{sec.label}</span>
                    <span className="text-[8px] text-blue-600 font-mono">Order {idx + 2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
