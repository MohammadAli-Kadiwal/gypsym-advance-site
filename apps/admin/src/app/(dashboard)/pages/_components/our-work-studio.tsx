'use client';

import * as React from 'react';
import { Briefcase, Palette, SlidersHorizontal, Layers, MessageSquare, Megaphone, ExternalLink } from 'lucide-react';
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
import Link from 'next/link';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface OurWorkStudioProps {
  onBack: () => void;
}

const defaultHeroCredentials = [
  { label: 'Shopify Plus Partner', desc: 'Official eCommerce Agency' },
  { label: '40–60% Cost Advantage', desc: 'Elite Engineering Efficiency' },
  { label: '< 0.8s Store Speed', desc: 'Core Web Vitals Optimized' },
  { label: '25+ Specialists', desc: 'Dedicated Liquid & Headless Team' },
];

export function OurWorkStudio({ onBack }: OurWorkStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);
  const [section, setSection] = React.useState<PortfolioSection | null>(null);

  // ── Load Our Work page data ──────────────────────────────────────────────
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi<PageData>('/pages/our-work');
      if (res) {
        setPageData(res);
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
            contentPayload: p,
          });
        } else {
          // Fallback defaults
          setSection({
            id: 'local-our-work',
            componentType: 'PORTFOLIO',
            isActive: true,
            contentPayload: {
              eyebrow: 'SELECTED D2C WORKS',
              title: 'Stores we are proud of.',
              titleHighlight: 'proud',
              description:
                'A curated collection of high-growth Shopify Plus storefronts, custom Liquid architectures, and high-conversion D2C experiences engineered by Gypsym.',
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
      notify.error('Could not load Our Work page from the backend.');
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
      if (!section.id.startsWith('local-')) {
        await fetchApi(`/sections/${section.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: section.contentPayload,
            isActive: section.isActive,
          }),
        });
      } else {
        const created = await fetchApi<{ id: string }>('/pages/our-work/sections', {
          method: 'POST',
          body: JSON.stringify({
            componentType: 'PORTFOLIO',
            sectionIdentifier: 'our-work-portfolio',
            contentPayload: section.contentPayload,
            isActive: true,
            displayOrder: 1,
          }),
        });
        if (created?.id) {
          setSection((prev) => prev ? { ...prev, id: created.id } : prev);
        }
      }
      notify.success('Portfolio page settings saved successfully.');
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

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in-50 duration-200">
        <div className="h-8 w-56 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const activeCredentials =
    p.heroCredentials && p.heroCredentials.length > 0
      ? p.heroCredentials
      : defaultHeroCredentials;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* ── Studio Header — shared SectionsHeader UI ── */}
      <SectionsHeader
        saving={saving}
        loading={loading}
        pageTitle="Portfolio"
        pageRoute="/portfolio"
        layoutLabel="PORTFOLIO PAGE"
        sectionCount={pageData?.sections?.filter((s) => s.isActive).length}
        status={pageData?.status || 'PUBLISHED'}
        onBack={onBack}
        onSave={handleSave}
        onRefresh={loadData}
      />

      {/* ── Section Editor Tabs ── */}
      <Tabs defaultValue="content" className="w-full space-y-4">
        <TabsList className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 h-auto gap-1 w-fit">
          <TabsTrigger
            value="content"
            className="inline-flex items-center gap-1.5 rounded-xl py-2 px-4 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Content
          </TabsTrigger>
          <TabsTrigger
            value="display"
            className="inline-flex items-center gap-1.5 rounded-xl py-2 px-4 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
          >
            <Palette className="h-3.5 w-3.5" />
            Display
          </TabsTrigger>
          <TabsTrigger
            value="effects"
            className="inline-flex items-center gap-1.5 rounded-xl py-2 px-4 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Animations
          </TabsTrigger>
          <TabsTrigger
            value="homepage-sections"
            className="inline-flex items-center gap-1.5 rounded-xl py-2 px-4 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
          >
            <Layers className="h-3.5 w-3.5" />
            Homepage Sections
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="focus-visible:outline-none space-y-5">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Page Content</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Edit the heading, eyebrow label, and description shown at the top of the Portfolio page.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Eyebrow */}
              <div className="space-y-1.5">
                <Label htmlFor="ow-eyebrow">Eyebrow Label</Label>
                <Input
                  id="ow-eyebrow"
                  value={p.eyebrow || ''}
                  onChange={(e) => update({ eyebrow: e.target.value })}
                  placeholder="SELECTED D2C WORKS"
                  className="h-9 rounded-xl border-slate-200 text-sm"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="ow-title">Page Headline</Label>
                <Input
                  id="ow-title"
                  value={p.title || ''}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Stores we are proud of."
                  className="h-9 rounded-xl border-slate-200 text-sm"
                />
              </div>

              {/* Title Highlight */}
              <div className="space-y-1.5">
                <Label htmlFor="ow-highlight">Accent Highlight Word (Instrument Serif Italic)</Label>
                <Input
                  id="ow-highlight"
                  value={p.titleHighlight || ''}
                  onChange={(e) => update({ titleHighlight: e.target.value })}
                  placeholder="proud"
                  className="h-9 rounded-xl border-slate-200 text-sm font-serif italic text-base"
                />
                <p className="text-[11px] text-slate-400">
                  Must be an exact substring of the headline above to render in elegant Instrument Serif italic accent font (matching homepage sections).
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="ow-desc">Description</Label>
                <Textarea
                  id="ow-desc"
                  value={p.description || ''}
                  onChange={(e) => update({ description: e.target.value })}
                  rows={3}
                  placeholder="A curated collection of high-growth Shopify Plus storefronts..."
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              {/* Section Active */}
              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Section Visible</p>
                  <p className="text-[11px] text-slate-400">Toggle the portfolio section on the page</p>
                </div>
                <Switch
                  checked={section?.isActive ?? true}
                  onCheckedChange={(v) => {
                    if (section) setSection({ ...section, isActive: v });
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero Strip Settings Card */}
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Hero Credentials Strip</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Low-profile Shopify agency trust credentials displayed in the hero area of the Portfolio page.
                </CardDescription>
              </div>
              <Switch
                checked={p.showHeroStrip !== false}
                onCheckedChange={(v) => update({ showHeroStrip: v })}
              />
            </CardHeader>
            {p.showHeroStrip !== false && (
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCredentials.map((cred, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Credential #{idx + 1}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`cred-label-${idx}`}>Metric / Title</Label>
                        <Input
                          id={`cred-label-${idx}`}
                          value={cred.label || ''}
                          onChange={(e) => {
                            const updated = [...activeCredentials];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            update({ heroCredentials: updated });
                          }}
                          className="h-8 rounded-lg border-slate-200 text-xs bg-white font-medium"
                          placeholder="e.g. Shopify Plus Partner"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`cred-desc-${idx}`}>Subtext / Description</Label>
                        <Input
                          id={`cred-desc-${idx}`}
                          value={cred.desc || ''}
                          onChange={(e) => {
                            const updated = [...activeCredentials];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            update({ heroCredentials: updated });
                          }}
                          className="h-8 rounded-lg border-slate-200 text-xs bg-white text-slate-600"
                          placeholder="e.g. Official eCommerce Agency"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="focus-visible:outline-none">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Display Settings</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Control how the portfolio grid is presented to visitors.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Category Filter */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Category Filter Bar</p>
                  <p className="text-[11px] text-slate-400">Show the category filter tabs above the grid</p>
                </div>
                <Switch
                  checked={(p as any).showCategoryFilter !== false}
                  onCheckedChange={(v) => update({ ...(p as any), showCategoryFilter: v } as any)}
                />
              </div>

              {/* View Button */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">View Button on Cards</p>
                  <p className="text-[11px] text-slate-400">Show a "View" button on project cards</p>
                </div>
                <Switch
                  checked={p.viewButtonEnabled !== false}
                  onCheckedChange={(v) => update({ viewButtonEnabled: v })}
                />
              </div>

              {/* View Button Label */}
              {p.viewButtonEnabled !== false && (
                <div className="space-y-1.5 pl-1">
                  <Label htmlFor="ow-btn-label">View Button Label</Label>
                  <Input
                    id="ow-btn-label"
                    value={p.viewButtonLabel || 'View'}
                    onChange={(e) => update({ viewButtonLabel: e.target.value })}
                    className="h-8 rounded-xl border-slate-200 text-sm max-w-[200px]"
                  />
                </div>
              )}

              {/* Overlay */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Card Overlay</p>
                  <p className="text-[11px] text-slate-400">Dark overlay on hover</p>
                </div>
                <Switch
                  checked={p.overlayEnabled !== false}
                  onCheckedChange={(v) => update({ overlayEnabled: v })}
                />
              </div>

              {/* Backdrop Blur */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Backdrop Blur</p>
                  <p className="text-[11px] text-slate-400">Blur effect behind the overlay text</p>
                </div>
                <Switch
                  checked={p.backdropBlurEnabled !== false}
                  onCheckedChange={(v) => update({ backdropBlurEnabled: v })}
                />
              </div>

              {/* Image Zoom */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Image Zoom on Hover</p>
                  <p className="text-[11px] text-slate-400">Scale up the image when hovering</p>
                </div>
                <Switch
                  checked={p.imageZoomEnabled !== false}
                  onCheckedChange={(v) => update({ imageZoomEnabled: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Homepage Sections Card in Display Tab */}
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Homepage Section Integrations
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Control visibility of the DIRECT ENGAGEMENT (Contact) and CTA sections on the Portfolio page.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">DIRECT ENGAGEMENT (Contact Section)</p>
                  <p className="text-[11px] text-slate-400">Enterprise briefing and contact form from homepage</p>
                </div>
                <Switch
                  checked={p.showContactSection !== false}
                  onCheckedChange={(v) => update({ showContactSection: v })}
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Call to Action (CTA Banner)</p>
                  <p className="text-[11px] text-slate-400">Conversion banner with primary buttons from homepage</p>
                </div>
                <Switch
                  checked={p.showCtaSection !== false}
                  onCheckedChange={(v) => update({ showCtaSection: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="effects" className="focus-visible:outline-none">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">3D & Motion Effects</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Premium animation and parallax settings for the portfolio grid.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* 3D Scroll */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">3D Scroll Effect</p>
                  <p className="text-[11px] text-slate-400">Cards tilt in 3D as user scrolls</p>
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
                  <p className="text-xs font-semibold text-slate-700">Mouse Parallax</p>
                  <p className="text-[11px] text-slate-400">Cards shift with mouse cursor position</p>
                </div>
                <Switch
                  checked={p.mouseParallaxEnabled !== false}
                  onCheckedChange={(v) => update({ mouseParallaxEnabled: v })}
                />
              </div>

              {/* Hover Effects */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Hover Effects</p>
                  <p className="text-[11px] text-slate-400">Enable interactive hover states on cards</p>
                </div>
                <Switch
                  checked={p.hoverEffectsEnabled !== false}
                  onCheckedChange={(v) => update({ hoverEffectsEnabled: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Sections Tab */}
        <TabsContent value="homepage-sections" className="focus-visible:outline-none space-y-5">
          <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Homepage Section Integrations (Direct Components)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Display verified Homepage sections directly at the bottom of the Portfolio page. Only enable/disable is configured here; all content, typography, and form fields are synchronized from the Home Page Studio.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* DIRECT ENGAGEMENT (Contact Section) */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      DIRECT ENGAGEMENT (Contact Inquiries)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      Home Section 11
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Direct technical consultation &amp; briefing form with enterprise inquiry routing, contact phone/email channels, and Google reCAPTCHA.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Component: &lt;ContactSection&gt; · Eyebrow: DIRECT ENGAGEMENT
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      Home Section 12
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    High-impact conversion CTA strip with glow ambient effects, strategic booking buttons, and enterprise scaling messaging.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Component: &lt;CtaSection&gt; · Identifier: homepage-cta
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
                  <span>Content and settings are managed directly in the Home Page Studio.</span>
                </div>
                <button
                  type="button"
                  onClick={() => onBack()}
                  className="font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                >
                  <span>Go to Home Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Portfolio Management Link ── */}
      <Card className="rounded-2xl border-slate-200/90 bg-gradient-to-r from-violet-50 to-blue-50 shadow-xs">
        <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Manage Portfolio Projects &amp; Categories</p>
            <p className="text-xs text-slate-500">
              Add, edit, reorder projects and manage portfolio categories from the dedicated Portfolio section.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50 text-xs font-semibold"
          >
            <Link href="/content/portfolio" className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Go to Portfolio Manager
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
