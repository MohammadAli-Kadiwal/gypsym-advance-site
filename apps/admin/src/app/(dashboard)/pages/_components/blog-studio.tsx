'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowUpRight,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import { SectionsHeader } from './sections-header';
import type { PageData } from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${className}`} {...props} />
);

export interface BlogStudioProps {
  onBack?: () => void;
}

interface CredentialItem {
  label: string;
  value: string;
  sub: string;
}

const defaultCredentials: CredentialItem[] = [
  { label: 'Technical Depth', value: '40+ Articles', sub: 'Peer-reviewed architecture' },
  { label: 'Engineering Domains', value: '6 Categories', sub: 'From Commerce to Sovereign AI' },
  { label: 'Edge Latency', value: '< 50ms', sub: 'Sub-second global TTFB' },
  { label: 'Technical Signal', value: '100% Free', sub: 'Zero paywalls or sales gates' },
];

export function BlogStudio({ onBack }: BlogStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);

  // ── Hero Section State ──
  const [heroId, setHeroId] = React.useState<string | null>(null);
  const [heroActive, setHeroActive] = React.useState(true);
  const [heroEyebrow, setHeroEyebrow] = React.useState('Systems Architecture · Technical Editorial');
  const [heroTitlePrefix, setHeroTitlePrefix] = React.useState('Engineering Insights &');
  const [heroTitleHighlight, setHeroTitleHighlight] = React.useState('Architecture');
  const [heroTitleSuffix, setHeroTitleSuffix] = React.useState('Blueprints');
  const [heroDescription, setHeroDescription] = React.useState(
    'A curated repository of deep-dive architectural blueprints, headless commerce benchmarks, and sovereign AI telemetry engineered by Gypsym systems architects.'
  );
  const [heroBackgroundImage, setHeroBackgroundImage] = React.useState(
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=2000&auto=format&fit=crop&q=80'
  );
  const [showHeroStrip, setShowHeroStrip] = React.useState(true);
  const [credentials, setCredentials] = React.useState<CredentialItem[]>(defaultCredentials);

  // ── Contact Section State ──
  const [contactId, setContactId] = React.useState<string | null>(null);
  const [contactActive, setContactActive] = React.useState(true);
  const [contactEyebrow, setContactEyebrow] = React.useState('DIRECT ENGAGEMENT');
  const [contactTitle, setContactTitle] = React.useState('Initiate an Executive Technical Consultation');
  const [contactHighlight, setContactHighlight] = React.useState('Technical');
  const [contactDescription, setContactDescription] = React.useState(
    'Schedule a technical architecture review with our Senior Technical Fellows and Principal Engineers.'
  );

  // ── CTA Section State ──
  const [ctaId, setCtaId] = React.useState<string | null>(null);
  const [ctaActive, setCtaActive] = React.useState(true);
  const [ctaEyebrow, setCtaEyebrow] = React.useState('ENTERPRISE ENGINEERING');
  const [ctaTitle, setCtaTitle] = React.useState('Ready to Architect Resilient Systems at Scale?');
  const [ctaHighlight, setCtaHighlight] = React.useState('Resilient');
  const [ctaDescription, setCtaDescription] = React.useState(
    'Partner with our systems engineers and cloud architects to build zero-downtime, distributed digital infrastructure engineered for uncompromising performance.'
  );
  const [ctaButtonLabel, setCtaButtonLabel] = React.useState('Schedule Architecture Review');
  const [ctaButtonUrl, setCtaButtonUrl] = React.useState('/contact');

  const updateCredential = (idx: number, field: keyof CredentialItem, val: string) => {
    setCredentials((prev) => {
      const copy = [...prev];
      const curr = copy[idx];
      if (curr) {
        copy[idx] = { ...curr, [field]: val };
      }
      return copy;
    });
  };

  const addCredential = () => {
    setCredentials((prev) => [
      ...prev,
      { label: 'New Metric', value: '99.9%', sub: 'SLA standard' },
    ]);
  };

  const removeCredential = (idx: number) => {
    setCredentials((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Load Data ──
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchApi<PageData>('/pages/blog');
      if (page) {
        setPageData(page);

        // Hero Section
        const rawHero = page.sections?.find(
          (s) => s.sectionIdentifier === 'blog-hero' || s.componentType === 'HERO'
        );
        if (rawHero) {
          setHeroId(rawHero.id);
          setHeroActive(rawHero.isActive);
          const p = (rawHero.contentPayload as any) || {};
          if (p.eyebrow) setHeroEyebrow(p.eyebrow);
          if (p.titlePrefix || p.title) setHeroTitlePrefix(p.titlePrefix || p.title);
          if (p.titleHighlight) setHeroTitleHighlight(p.titleHighlight);
          if (p.titleSuffix) setHeroTitleSuffix(p.titleSuffix);
          if (p.description) setHeroDescription(p.description);
          if (p.backgroundImage || p.heroBackgroundImage || p.backgroundImageUrl) {
            setHeroBackgroundImage(p.backgroundImage || p.heroBackgroundImage || p.backgroundImageUrl);
          }
          if (p.showHeroStrip !== undefined) setShowHeroStrip(p.showHeroStrip);
          if (Array.isArray(p.credentials) && p.credentials.length > 0) setCredentials(p.credentials);
        }

        // Contact Section
        const rawContact = page.sections?.find(
          (s) => s.sectionIdentifier === 'blog-contact' || s.componentType === 'CONTACT'
        );
        if (rawContact) {
          setContactId(rawContact.id);
          setContactActive(rawContact.isActive);
          const p = (rawContact.contentPayload as any) || {};
          if (p.eyebrow) setContactEyebrow(p.eyebrow);
          if (p.title) setContactTitle(p.title);
          if (p.titleHighlight) setContactHighlight(p.titleHighlight);
          if (p.description) setContactDescription(p.description);
        }

        // CTA Section
        const rawCta = page.sections?.find(
          (s) => s.sectionIdentifier === 'blog-cta' || s.componentType === 'CTA'
        );
        if (rawCta) {
          setCtaId(rawCta.id);
          setCtaActive(rawCta.isActive);
          const p = (rawCta.contentPayload as any) || {};
          if (p.eyebrow) setCtaEyebrow(p.eyebrow);
          if (p.title) setCtaTitle(p.title);
          if (p.titleHighlight) setCtaHighlight(p.titleHighlight);
          if (p.description) setCtaDescription(p.description);
          if (p.primaryButton?.label) setCtaButtonLabel(p.primaryButton.label);
          if (p.primaryButton?.url) setCtaButtonUrl(p.primaryButton.url);
        }
      }
    } catch {
      notify.error('Could not load Publications page from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Save Handler ──
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update Page Info
      const pagePromise = fetchApi('/pages/blog', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Publications & Insights',
        }),
      });

      // 2. Save Hero Section
      const heroPayload = {
        eyebrow: heroEyebrow,
        title: heroTitlePrefix,
        titlePrefix: heroTitlePrefix,
        titleHighlight: heroTitleHighlight,
        titleSuffix: heroTitleSuffix,
        description: heroDescription,
        backgroundImage: heroBackgroundImage,
        heroBackgroundImage,
        showHeroStrip,
        credentials,
      };

      const heroPromise = (heroId && !heroId.startsWith('local-'))
        ? fetchApi(`/sections/${heroId}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: heroPayload,
              isActive: heroActive,
            }),
          })
        : fetchApi<any>('/pages/blog/sections', {
            method: 'POST',
            body: JSON.stringify({
              sectionIdentifier: 'blog-hero',
              componentType: 'HERO',
              displayOrder: 1,
              contentPayload: heroPayload,
              isActive: heroActive,
            }),
          }).then((res) => {
            if (res?.id) setHeroId(res.id);
          });

      // 3. Save Contact Section
      const contactPayload = {
        eyebrow: contactEyebrow,
        title: contactTitle,
        titleHighlight: contactHighlight,
        description: contactDescription,
      };

      const contactPromise = (contactId && !contactId.startsWith('local-'))
        ? fetchApi(`/sections/${contactId}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: contactPayload,
              isActive: contactActive,
            }),
          })
        : fetchApi<any>('/pages/blog/sections', {
            method: 'POST',
            body: JSON.stringify({
              sectionIdentifier: 'blog-contact',
              componentType: 'CONTACT',
              displayOrder: 2,
              contentPayload: contactPayload,
              isActive: contactActive,
            }),
          }).then((res) => {
            if (res?.id) setContactId(res.id);
          });

      // 4. Save CTA Section
      const ctaPayload = {
        eyebrow: ctaEyebrow,
        title: ctaTitle,
        titleHighlight: ctaHighlight,
        description: ctaDescription,
        primaryButton: {
          label: ctaButtonLabel,
          url: ctaButtonUrl,
          variant: 'primary',
        },
      };

      const ctaPromise = (ctaId && !ctaId.startsWith('local-'))
        ? fetchApi(`/sections/${ctaId}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: ctaPayload,
              isActive: ctaActive,
            }),
          })
        : fetchApi<any>('/pages/blog/sections', {
            method: 'POST',
            body: JSON.stringify({
              sectionIdentifier: 'blog-cta',
              componentType: 'CTA',
              displayOrder: 3,
              contentPayload: ctaPayload,
              isActive: ctaActive,
            }),
          }).then((res) => {
            if (res?.id) setCtaId(res.id);
          });

      await Promise.all([pagePromise, heroPromise, contactPromise, ctaPromise]);

      notify.success('All Publications & Insights Page settings saved successfully.');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save Publications page settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: 'PUBLISHED' | 'DRAFT') => {
    try {
      await fetchApi('/pages/blog', {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setPageData((prev) => (prev ? { ...prev, status: newStatus } : null));
      notify.success(`Publications page status updated to ${newStatus === 'PUBLISHED' ? 'Public' : 'Draft'}.`);
    } catch {
      notify.error('Failed to update page status.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <SectionsHeader
        pageTitle="Publications & Insights"
        pageRoute="/blog"
        layoutLabel="EDITORIAL ARCHITECTURE"
        sectionCount={3}
        status={pageData?.status || 'PUBLISHED'}
        onStatusChange={handleStatusChange}
        saving={saving}
        loading={loading}
        onBack={onBack || (() => {})}
        onSave={handleSave}
        onRefresh={loadData}
      />

      {/* Quick Jump / Editorial CMS Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Manage Articles, Writers & Topics</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              To write new posts, edit markdown content, or organize categories, visit the Editorial CMS.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/blog" target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
            >
              Open Live Page
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/editorial/blog">
            <Button
              size="sm"
              className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
            >
              Articles Manager
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="hero" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto flex flex-wrap gap-1.5 border border-slate-200/80">
          <TabsTrigger
            value="hero"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            1. Hero & Metrics
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Direct Consultation Section
          </TabsTrigger>
          <TabsTrigger
            value="cta"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            3. Conversion CTA
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: HERO ── */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Hero Section Settings</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Top editorial banner headline, highlight accent, background photograph, and metrics strip.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={heroActive} onCheckedChange={setHeroActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label>Eyebrow Text</Label>
                <Input
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  placeholder="Systems Architecture · Technical Editorial"
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Headline Prefix</Label>
                  <Input
                    value={heroTitlePrefix}
                    onChange={(e) => setHeroTitlePrefix(e.target.value)}
                    placeholder="Engineering Insights &"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Title Highlight (Italic Serif)</Label>
                  <Input
                    value={heroTitleHighlight}
                    onChange={(e) => setHeroTitleHighlight(e.target.value)}
                    placeholder="Architecture"
                    className="h-10 text-xs font-serif italic rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Headline Suffix</Label>
                  <Input
                    value={heroTitleSuffix}
                    onChange={(e) => setHeroTitleSuffix(e.target.value)}
                    placeholder="Blueprints"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
              </div>

              <div>
                <Label>Hero Description / Abstract</Label>
                <Textarea
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>

              {/* Hero Background Image Upload */}
              <div className="pt-2">
                <ImageUploadField
                  label="Hero Background Artwork / Photograph"
                  description="Upload a high-resolution architectural photograph or server topology visual."
                  value={heroBackgroundImage}
                  onChange={setHeroBackgroundImage}
                  placeholder="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=2000&auto=format&fit=crop&q=80"
                />
              </div>

              {/* Metrics Strip */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Stats & Telemetry Chips</h4>
                    <p className="text-[11px] text-slate-500">Horizontal key figures displayed right below the CTA buttons</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCredential}
                      className="rounded-xl text-xs gap-1 h-7 border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Chip
                    </Button>
                    <Switch checked={showHeroStrip} onCheckedChange={setShowHeroStrip} />
                  </div>
                </div>

                {showHeroStrip && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {credentials.map((cred, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2 relative group">
                        <button
                          type="button"
                          onClick={() => removeCredential(idx)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <Label className="text-[11px]">Chip {idx + 1} Label</Label>
                          <Input
                            value={cred.label}
                            onChange={(e) => updateCredential(idx, 'label', e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px]">Stat Value</Label>
                          <Input
                            value={cred.value}
                            onChange={(e) => updateCredential(idx, 'value', e.target.value)}
                            className="h-8 text-xs font-bold bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px]">Subtext</Label>
                          <Input
                            value={cred.sub}
                            onChange={(e) => updateCredential(idx, 'sub', e.target.value)}
                            className="h-8 text-xs text-slate-500 bg-white"
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

        {/* ── TAB 2: CONTACT SECTION ── */}
        <TabsContent value="contact" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Direct Consultation Section</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Interactive contact and inquiry form rendered at the bottom of the publications hub.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={contactActive} onCheckedChange={setContactActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Eyebrow</Label>
                <Input
                  value={contactEyebrow}
                  onChange={(e) => setContactEyebrow(e.target.value)}
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Title Highlight Word</Label>
                  <Input
                    value={contactHighlight}
                    onChange={(e) => setContactHighlight(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90 font-serif italic"
                  />
                </div>
              </div>
              <div>
                <Label>Section Description</Label>
                <Textarea
                  value={contactDescription}
                  onChange={(e) => setContactDescription(e.target.value)}
                  rows={2}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: CTA SECTION ── */}
        <TabsContent value="cta" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Conversion CTA Banner</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Full-width conversion banner placed right before the website footer.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={ctaActive} onCheckedChange={setCtaActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Eyebrow</Label>
                <Input
                  value={ctaEyebrow}
                  onChange={(e) => setCtaEyebrow(e.target.value)}
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={ctaTitle}
                    onChange={(e) => setCtaTitle(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Headline Highlight Word</Label>
                  <Input
                    value={ctaHighlight}
                    onChange={(e) => setCtaHighlight(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90 font-serif italic"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={ctaDescription}
                  onChange={(e) => setCtaDescription(e.target.value)}
                  rows={2}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Button Label</Label>
                  <Input
                    value={ctaButtonLabel}
                    onChange={(e) => setCtaButtonLabel(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Button Target URL</Label>
                  <Input
                    value={ctaButtonUrl}
                    onChange={(e) => setCtaButtonUrl(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90 font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
