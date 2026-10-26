'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Layers,
  MessageSquare,
  Megaphone,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import type { PortfolioSection, PortfolioPayload, PageData } from './types';
import { SectionsHeader } from './sections-header';
import { ImageUploadField } from '@/components/ui/image-upload-field';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

export interface PortfolioStudioProps {
  onBack?: () => void;
}

const defaultHeroCredentials = [
  { value: 'Official Agency', label: 'Shopify Plus Partner', sub: 'Enterprise D2C Specialists' },
  { value: '40–60%', label: 'Cost Advantage', sub: 'Less than US/UK agencies' },
  { value: '< 0.8s', label: 'Mobile Store Speed', sub: 'Core Web Vitals optimized' },
  { value: '25+', label: 'Dedicated Specialists', sub: 'Liquid, CRO & Theme leads' },
];

export function PortfolioStudio({ onBack }: PortfolioStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);
  const [section, setSection] = React.useState<PortfolioSection | null>(null);

  // SEO State
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [ogImageUrl, setOgImageUrl] = React.useState('');
  const [noIndex, setNoIndex] = React.useState(false);

  // ── Load Our Work page data ──────────────────────────────────────────────
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi<PageData>('/pages/portfolio');
      if (res) {
        setPageData(res);

        // SEO
        const seo = res.seoMetadata;
        setMetaTitle(seo?.metaTitle || '');
        setMetaDescription(
          seo?.metaDescription ||
            res.description ||
            'Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built by Gypsym Technology.'
        );
        setCanonicalUrl(seo?.canonicalUrl || '');
        setOgImageUrl(seo?.ogImageUrl || '');
        setNoIndex(Boolean(seo?.noIndex));

        const raw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'our-work-portfolio' ||
            s.sectionIdentifier === 'portfolio-showcase' ||
            s.componentType === 'PORTFOLIO' ||
            s.componentType === 'OUR_WORK' ||
            s.componentType === 'FEATURE_GRID',
        );
        if (raw) {
          const p = (raw.contentPayload as PortfolioPayload) || {};
          setSection({
            id: raw.id,
            componentType: raw.componentType,
            isActive: raw.isActive,
            contentPayload: {
              ...p,
              heroBackgroundImage:
                p.heroBackgroundImage ||
                p.backgroundImageUrl ||
                p.backgroundImage ||
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2200&auto=format&fit=crop',
              heroEyebrow: p.heroEyebrow || 'Shopify Plus Agency · D2C Portfolio',
              heroTitlePrefix: p.heroTitlePrefix || 'High-Converting Shopify Plus Stores &',
              heroTitleHighlight: p.heroTitleHighlight || 'Digital',
              heroTitleSuffix: p.heroTitleSuffix || 'Commerce',
              heroDescription:
                p.heroDescription ||
                'Explore a showcase of bespoke Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built for scaling brands.',
              heroCredentials:
                Array.isArray(p.heroCredentials) && p.heroCredentials.length > 0
                  ? p.heroCredentials.map((c: any) => ({
                      value: c.value || c.label || '',
                      label: c.label || '',
                      sub: c.sub || c.desc || '',
                    }))
                  : defaultHeroCredentials,
            },
          });
        } else {
          // Fallback defaults
          setSection({
            id: 'local-portfolio',
            componentType: 'FEATURE_GRID',
            isActive: true,
            contentPayload: {
              eyebrow: 'SELECTED D2C WORKS',
              title: 'Stores we are proud of.',
              titleHighlight: 'proud',
              description:
                'A curated collection of high-growth Shopify Plus storefronts, custom Liquid architectures, and high-conversion D2C experiences engineered by Gypsym.',
              heroEyebrow: 'Shopify Plus Agency · D2C Portfolio',
              heroTitlePrefix: 'High-Converting Shopify Plus Stores &',
              heroTitleHighlight: 'Digital',
              heroTitleSuffix: 'Commerce',
              heroDescription:
                'Explore a showcase of bespoke Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built for scaling brands.',
              heroBackgroundImage:
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2200&auto=format&fit=crop',
              showHeroStrip: true,
              heroCredentials: defaultHeroCredentials,
              hoverEffectsEnabled: true,
              viewButtonEnabled: true,
              viewButtonLabel: 'View',
              overlayEnabled: true,
              backdropBlurEnabled: true,
              imageZoomEnabled: true,
              threeDScrollEnabled: true,
              threeDIntensity: 'premium',
              mouseParallaxEnabled: true,
              showContactSection: true,
              showCtaSection: true,
            },
          });
        }
      }
    } catch {
      notify.error('Could not load Portfolio page from the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!section) return;
    setSaving(true);
    try {
      // 1. Update Page SEO
      const pagePromise = fetchApi('/pages/portfolio', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Portfolio',
          description: metaDescription,
          seoMetadata: {
            metaTitle,
            metaDescription,
            canonicalUrl: canonicalUrl || null,
            ogTitle: metaTitle,
            ogDescription: metaDescription,
            ogImageUrl: ogImageUrl || null,
            noIndex,
          },
        }),
      });

      // 2. Save Section Payload
      const sectionPromise = !section.id.startsWith('local-')
        ? fetchApi(`/sections/${section.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: section.contentPayload,
              isActive: section.isActive,
            }),
          })
        : fetchApi<{ id: string }>('/pages/portfolio/sections', {
            method: 'POST',
            body: JSON.stringify({
              componentType: 'FEATURE_GRID',
              sectionIdentifier: 'portfolio-showcase',
              contentPayload: section.contentPayload,
              isActive: section.isActive,
              displayOrder: 1,
            }),
          }).then((created) => {
            if (created?.id) {
              setSection((prev) => (prev ? { ...prev, id: created.id } : prev));
            }
          });

      await Promise.all([pagePromise, sectionPromise]);
      notify.success('Portfolio page & hero settings saved successfully.');
    } catch {
      notify.error('Unable to save Portfolio page settings.');
    } finally {
      setSaving(false);
    }
  };

  const p: PortfolioPayload = section?.contentPayload || {};

  const update = (partial: Partial<PortfolioPayload>) => {
    if (!section) return;
    setSection({ ...section, contentPayload: { ...p, ...partial } });
  };

  const activeCredentials =
    Array.isArray(p.heroCredentials) && p.heroCredentials.length > 0
      ? p.heroCredentials
      : defaultHeroCredentials;

  const handleStatusChange = async (newStatus: 'PUBLISHED' | 'DRAFT') => {
    try {
      await fetchApi('/pages/portfolio', {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setPageData((prev) => (prev ? { ...prev, status: newStatus } : null));
      notify.success(`Portfolio page status updated to ${newStatus === 'PUBLISHED' ? 'Public' : 'Draft'}.`);
    } catch {
      notify.error('Failed to update page status.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in-50 duration-200">
        <div className="h-8 w-56 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in-50 duration-200">
      {/* ── Studio Header — shared SectionsHeader UI ── */}
      <SectionsHeader
        saving={saving}
        loading={loading}
        pageTitle="Portfolio"
        pageRoute="/portfolio"
        layoutLabel="PORTFOLIO ARCHITECTURE"
        sectionCount={pageData?.sections?.filter((s) => s.isActive).length}
        status={pageData?.status || 'PUBLISHED'}
        onStatusChange={handleStatusChange}
        onBack={onBack || (() => window.history.back())}
        onSave={handleSave}
        onRefresh={loadData}
      />

      {/* ── Section Editor Tabs ── */}
      <Tabs defaultValue="hero" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto flex flex-wrap gap-1.5 border border-slate-200/80">
          <TabsTrigger
            value="hero"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            1. Hero &amp; Metrics
          </TabsTrigger>
          <TabsTrigger
            value="grid"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Showcase &amp; Grid
          </TabsTrigger>
          <TabsTrigger
            value="display"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            3. Display &amp; Animations
          </TabsTrigger>
          <TabsTrigger
            value="homepage-sections"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            4. Direct Consultation &amp; CTA
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            5. SEO &amp; OpenGraph
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: HERO & METRICS ── */}
        <TabsContent value="hero" className="focus-visible:outline-none space-y-6">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Portfolio Hero Banner</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Configure the headline, editorial artwork background image, and proof credentials strip.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Hero Eyebrow */}
              <div className="space-y-1.5">
                <Label htmlFor="hero-eyebrow">Eyebrow Label</Label>
                <Input
                  id="hero-eyebrow"
                  value={p.heroEyebrow || ''}
                  onChange={(e) => update({ heroEyebrow: e.target.value })}
                  placeholder="Shopify Plus Agency · D2C Portfolio"
                  className="h-10 text-xs rounded-xl border-slate-200"
                />
              </div>

              {/* Title Prefix & Highlight & Suffix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hero-prefix">Title Prefix</Label>
                  <Input
                    id="hero-prefix"
                    value={p.heroTitlePrefix || ''}
                    onChange={(e) => update({ heroTitlePrefix: e.target.value })}
                    placeholder="High-Converting Shopify Plus Stores &"
                    className="h-10 text-xs rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hero-highlight">Title Highlight (Italic Accent)</Label>
                  <Input
                    id="hero-highlight"
                    value={p.heroTitleHighlight || ''}
                    onChange={(e) => update({ heroTitleHighlight: e.target.value })}
                    placeholder="Digital"
                    className="h-10 text-xs rounded-xl border-slate-200 font-serif italic"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hero-suffix">Title Suffix</Label>
                  <Input
                    id="hero-suffix"
                    value={p.heroTitleSuffix || ''}
                    onChange={(e) => update({ heroTitleSuffix: e.target.value })}
                    placeholder="Commerce"
                    className="h-10 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>

              {/* Hero Description */}
              <div className="space-y-1.5">
                <Label htmlFor="hero-desc">Hero Description</Label>
                <Textarea
                  id="hero-desc"
                  value={p.heroDescription || ''}
                  onChange={(e) => update({ heroDescription: e.target.value })}
                  rows={3}
                  placeholder="Explore a showcase of bespoke Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built for scaling brands."
                  className="text-xs rounded-xl border-slate-200"
                />
              </div>

              {/* Hero Background Artwork / Image Upload */}
              <div className="pt-2">
                <ImageUploadField
                  label="Portfolio Page Hero Background Image / Artwork"
                  description="Upload a high-resolution editorial photograph or artwork for the hero background banner."
                  value={p.heroBackgroundImage || p.backgroundImageUrl || p.backgroundImage || ''}
                  onChange={(val) =>
                    update({
                      heroBackgroundImage: val,
                      backgroundImageUrl: val,
                      backgroundImage: val,
                    })
                  }
                  placeholder="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2200&auto=format&fit=crop"
                />
              </div>

              {/* Hero Credentials Strip Card */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Hero Credentials Strip</h4>
                    <p className="text-[11px] text-slate-500">
                      High-impact agency proof metrics displayed at the base of the hero.
                    </p>
                  </div>
                  <Switch
                    checked={p.showHeroStrip !== false}
                    onCheckedChange={(v) => update({ showHeroStrip: v })}
                  />
                </div>

                {p.showHeroStrip !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {activeCredentials.map((cred: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Metric #{idx + 1}
                        </span>
                        <div className="space-y-1">
                          <Label>Value / Metric</Label>
                          <Input
                            value={cred.value || ''}
                            onChange={(e) => {
                              const updated = [...activeCredentials];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              update({ heroCredentials: updated });
                            }}
                            className="h-8 rounded-lg border-slate-200 text-xs bg-white font-bold"
                            placeholder="e.g. Official Agency"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Label / Title</Label>
                          <Input
                            value={cred.label || ''}
                            onChange={(e) => {
                              const updated = [...activeCredentials];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              update({ heroCredentials: updated });
                            }}
                            className="h-8 rounded-lg border-slate-200 text-xs bg-white"
                            placeholder="e.g. Shopify Plus Partner"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Subtext</Label>
                          <Input
                            value={cred.sub || cred.desc || ''}
                            onChange={(e) => {
                              const updated = [...activeCredentials];
                              updated[idx] = { ...updated[idx], sub: e.target.value, desc: e.target.value };
                              update({ heroCredentials: updated });
                            }}
                            className="h-8 rounded-lg border-slate-200 text-xs bg-white text-slate-600"
                            placeholder="e.g. Enterprise D2C Specialists"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: SHOWCASE & GRID ── */}
        <TabsContent value="grid" className="focus-visible:outline-none space-y-6">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Showcase Grid Header &amp; Filters</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Headline, description, and filter controls for the interactive portfolio grid.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch
                  checked={section?.isActive ?? true}
                  onCheckedChange={(v) => {
                    if (section) setSection({ ...section, isActive: v });
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Eyebrow */}
              <div className="space-y-1.5">
                <Label htmlFor="ow-eyebrow">Grid Eyebrow Label</Label>
                <Input
                  id="ow-eyebrow"
                  value={p.eyebrow || ''}
                  onChange={(e) => update({ eyebrow: e.target.value })}
                  placeholder="SELECTED D2C WORKS"
                  className="h-10 text-xs rounded-xl border-slate-200"
                />
              </div>

              {/* Title & Highlight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ow-title">Grid Headline</Label>
                  <Input
                    id="ow-title"
                    value={p.title || ''}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="Stores we are proud of."
                    className="h-10 text-xs rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ow-highlight">Accent Highlight Word (Italic)</Label>
                  <Input
                    id="ow-highlight"
                    value={p.titleHighlight || ''}
                    onChange={(e) => update({ titleHighlight: e.target.value })}
                    placeholder="proud"
                    className="h-10 text-xs rounded-xl border-slate-200 font-serif italic"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="ow-desc">Grid Description</Label>
                <Textarea
                  id="ow-desc"
                  value={p.description || ''}
                  onChange={(e) => update({ description: e.target.value })}
                  rows={3}
                  placeholder="A curated collection of high-growth Shopify Plus storefronts, custom Liquid architectures, and high-conversion D2C experiences engineered by Gypsym."
                  className="text-xs rounded-xl border-slate-200"
                />
              </div>

              {/* Category Filter Bar */}
              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Category Filter Bar</p>
                  <p className="text-[11px] text-slate-500">Show dynamic category filter tabs above the portfolio grid</p>
                </div>
                <Switch
                  checked={(p as any).showCategoryFilter !== false}
                  onCheckedChange={(v) => update({ ...(p as any), showCategoryFilter: v } as any)}
                />
              </div>

              {/* View Button */}
              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">View Button on Cards</p>
                  <p className="text-[11px] text-slate-500">Show a hover CTA button on project cards</p>
                </div>
                <Switch
                  checked={p.viewButtonEnabled !== false}
                  onCheckedChange={(v) => update({ viewButtonEnabled: v })}
                />
              </div>

              {p.viewButtonEnabled !== false && (
                <div className="space-y-1.5 pl-1">
                  <Label htmlFor="ow-btn-label">View Button Label</Label>
                  <Input
                    id="ow-btn-label"
                    value={p.viewButtonLabel || 'View'}
                    onChange={(e) => update({ viewButtonLabel: e.target.value })}
                    className="h-9 rounded-xl border-slate-200 text-xs max-w-[200px]"
                  />
                </div>
              )}

              {/* Project Manager Quick Jump */}
              <div className="p-4 bg-violet-50/60 border border-violet-200/60 rounded-xl text-xs text-violet-900 flex items-center justify-between mt-2">
                <div>
                  <span className="font-bold">Manage Individual Case Studies &amp; Projects</span>
                  <p className="text-[11px] text-violet-700 mt-0.5">
                    Individual portfolio projects, screenshots, live store URLs, and tags are managed in Content → Portfolio.
                  </p>
                </div>
                <Link href="/content/portfolio">
                  <Button size="sm" variant="outline" className="text-xs bg-white border-violet-300">
                    Go to Portfolio Items
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: DISPLAY & ANIMATIONS ── */}
        <TabsContent value="display" className="focus-visible:outline-none space-y-6">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">3D Tilt &amp; Motion Settings</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Configure card hover physics, depth effects, and scroll gestures.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Card Overlay */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Card Dark Overlay</p>
                  <p className="text-[11px] text-slate-500">Dark aesthetic overlay upon card hover</p>
                </div>
                <Switch
                  checked={p.overlayEnabled !== false}
                  onCheckedChange={(v) => update({ overlayEnabled: v })}
                />
              </div>

              {/* Backdrop Blur */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Backdrop Blur</p>
                  <p className="text-[11px] text-slate-500">Blur effect behind card details</p>
                </div>
                <Switch
                  checked={p.backdropBlurEnabled !== false}
                  onCheckedChange={(v) => update({ backdropBlurEnabled: v })}
                />
              </div>

              {/* Image Zoom */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Image Zoom on Hover</p>
                  <p className="text-[11px] text-slate-500">Smooth scale animation on project preview images</p>
                </div>
                <Switch
                  checked={p.imageZoomEnabled !== false}
                  onCheckedChange={(v) => update({ imageZoomEnabled: v })}
                />
              </div>

              {/* 3D Scroll */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">3D Scroll Tilt</p>
                  <p className="text-[11px] text-slate-500">Cards tilt in 3D perspective as the visitor scrolls</p>
                </div>
                <Switch
                  checked={p.threeDScrollEnabled !== false}
                  onCheckedChange={(v) => update({ threeDScrollEnabled: v })}
                />
              </div>

              {/* 3D Intensity */}
              {p.threeDScrollEnabled !== false && (
                <div className="space-y-1.5 pl-1 border-t border-slate-100 pt-3">
                  <Label>3D Intensity</Label>
                  <div className="flex gap-2">
                    {(['subtle', 'premium'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => update({ threeDIntensity: lvl })}
                        className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          (p.threeDIntensity || 'premium') === lvl
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mouse Parallax */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Mouse Parallax</p>
                  <p className="text-[11px] text-slate-500">Interactive card tilt responding to pointer movement</p>
                </div>
                <Switch
                  checked={p.mouseParallaxEnabled !== false}
                  onCheckedChange={(v) => update({ mouseParallaxEnabled: v })}
                />
              </div>

              {/* Hover Effects */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Interactive Hover States</p>
                  <p className="text-[11px] text-slate-500">Enable micro-animations on cards</p>
                </div>
                <Switch
                  checked={p.hoverEffectsEnabled !== false}
                  onCheckedChange={(v) => update({ hoverEffectsEnabled: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: HOMEPAGE SECTIONS ── */}
        <TabsContent value="homepage-sections" className="focus-visible:outline-none space-y-6">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Homepage Section Integrations
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Display verified Homepage sections directly at the bottom of the Portfolio page.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* DIRECT ENGAGEMENT (Contact Section) */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      DIRECT ENGAGEMENT (Contact Inquiries)
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Direct technical consultation &amp; briefing form with enterprise inquiry routing, phone/email channels, and reCAPTCHA.
                  </p>
                </div>
                <Switch
                  checked={p.showContactSection !== false}
                  onCheckedChange={(v) => update({ showContactSection: v })}
                />
              </div>

              {/* CTA Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Call To Action (CTA Banner)
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    High-impact conversion CTA strip with glow ambient effects and strategic booking buttons.
                  </p>
                </div>
                <Switch
                  checked={p.showCtaSection !== false}
                  onCheckedChange={(v) => update({ showCtaSection: v })}
                />
              </div>

              {/* Quick Jump Info Note */}
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Section content and buttons are managed directly in the Home Page Studio.</span>
                </div>
                <button
                  type="button"
                  onClick={() => (onBack ? onBack() : window.history.back())}
                  className="font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                >
                  <span>Go to Home Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: SEO & OPENGRAPH ── */}
        <TabsContent value="seo" className="focus-visible:outline-none space-y-6">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Portfolio SEO &amp; OpenGraph Metadata</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Search engine title tags, meta descriptions, and social media share previews.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="meta-title">Page Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Portfolio & Shopify Case Studies | Gypsym Technology"
                  className="h-10 text-xs rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meta-desc">Page Meta Description</Label>
                <Textarea
                  id="meta-desc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built by Gypsym Technology."
                  className="text-xs rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="canonical-url">Canonical URL</Label>
                <Input
                  id="canonical-url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://gypsym.com/portfolio"
                  className="h-10 text-xs font-mono rounded-xl border-slate-200"
                />
              </div>

              <div className="pt-2">
                <ImageUploadField
                  label="Social OpenGraph (OG) Image"
                  description="Upload directly or specify a URL (1200x630 recommended for LinkedIn, X, and WhatsApp previews)."
                  value={ogImageUrl}
                  onChange={setOgImageUrl}
                  placeholder="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2200&auto=format&fit=crop"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800">Prevent Search Indexing (noindex)</span>
                  <p className="text-[11px] text-slate-500">Keep this off for production search visibility.</p>
                </div>
                <Switch checked={noIndex} onCheckedChange={setNoIndex} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
