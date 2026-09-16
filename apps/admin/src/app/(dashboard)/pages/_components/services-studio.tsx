'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
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

export interface ServicesStudioProps {
  onBack?: () => void;
}

interface CredentialItem {
  label: string;
  value: string;
  sub: string;
}

interface ComparisonPoint {
  feature: string;
  gypsym: string;
  traditional: string;
  freelance: string;
}

const defaultCredentials: CredentialItem[] = [
  { label: 'Shopify Stores Built', value: '120+', sub: 'Enterprise D2C brands' },
  { label: 'Cost Advantage', value: '40–60%', sub: 'Less than US/UK agencies' },
  { label: 'Mobile Page Speed', value: '< 0.8s', sub: 'Core Web Vitals SLA' },
  { label: 'Dedicated Specialists', value: '25+', sub: 'Liquid, CRO & Theme leads' },
];

const defaultComparisonPoints: ComparisonPoint[] = [
  {
    feature: 'Senior Engineering Talent',
    gypsym: 'Dedicated Senior Shopify & Liquid Engineers with 6+ yrs experience',
    traditional: 'Junior developers with heavy account manager layers',
    freelance: 'Unverified, variable skill levels and sudden churn risk',
  },
  {
    feature: 'Transparent Pricing',
    gypsym: 'Fixed-scope transparent milestones or predictable monthly retainers',
    traditional: 'Expensive $200–$350/hr billing with runaway scope creep',
    freelance: 'Low initial bids with hidden fees and unfinished deliverables',
  },
  {
    feature: 'Cost Efficiency',
    gypsym: '40–60% lower total cost with enterprise-grade quality',
    traditional: 'Excessive agency overhead passed on to your invoices',
    freelance: 'Requires constant client oversight and costly rewrites',
  },
  {
    feature: 'Timezone Coverage',
    gypsym: 'Dedicated overlap with US, UK, European, and Gulf timezones',
    traditional: 'Strict 9-to-5 regional hours with slow weekend response',
    freelance: 'Erratic hours and delayed async communication',
  },
  {
    feature: 'Code Architecture',
    gypsym: 'Modular OS 2.0, zero app bloat, Google Core Web Vitals 90+',
    traditional: 'Over-reliance on heavy monthly subscription apps',
    freelance: 'Quick hacks and unmaintained jQuery code',
  },
  {
    feature: 'Emergency Response SLA',
    gypsym: 'Sub-60 minute emergency response on dedicated Slack',
    traditional: '24–48 hour ticketing queues and automated bots',
    freelance: 'No formal SLA or guaranteed emergency availability',
  },
];

export function ServicesStudio({ onBack }: ServicesStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);

  // ── Hero Section State ──
  const [heroId, setHeroId] = React.useState<string | null>(null);
  const [heroActive, setHeroActive] = React.useState(true);
  const [heroEyebrow, setHeroEyebrow] = React.useState('Specialized Shopify & D2C Capabilities');
  const [heroTitlePrefix, setHeroTitlePrefix] = React.useState('Engineering High-Growth Shopify Stores That');
  const [heroTitleHighlight, setHeroTitleHighlight] = React.useState('Convert');
  const [heroDescription, setHeroDescription] = React.useState(
    'From bespoke Shopify Plus builds to sub-second speed optimization and ongoing 24/7 engineering retainers — we help ambitious brands outpace competition at 40–60% less cost than traditional US/UK agencies.'
  );
  const [heroBackgroundImage, setHeroBackgroundImage] = React.useState('/assets/editorial/agency-hero-editorial.png');
  const [showHeroStrip, setShowHeroStrip] = React.useState(true);
  const [credentials, setCredentials] = React.useState<CredentialItem[]>(defaultCredentials);
  const [heroPrimaryLabel, setHeroPrimaryLabel] = React.useState('Schedule Strategy Call');
  const [heroPrimaryUrl, setHeroPrimaryUrl] = React.useState('/book');
  const [heroSecondaryLabel, setHeroSecondaryLabel] = React.useState('Inquire About a Project');
  const [heroSecondaryUrl, setHeroSecondaryUrl] = React.useState('/contact');

  // ── Capabilities / Services Grid State ──
  const [gridId, setGridId] = React.useState<string | null>(null);
  const [gridActive, setGridActive] = React.useState(true);
  const [gridEyebrow, setGridEyebrow] = React.useState('FULL-SPECTRUM CAPABILITIES');
  const [gridTitle, setGridTitle] = React.useState('Everything Your Brand Needs to Scale on Shopify');
  const [gridTitleHighlight, setGridTitleHighlight] = React.useState('Shopify');
  const [gridDescription, setGridDescription] = React.useState(
    'End-to-end Shopify engineering, bespoke theme architecture, high-conversion CRO experiments, and seamless ERP migrations.'
  );

  // ── Gypsym Advantage / Comparison Matrix State ──
  const [advantageId, setAdvantageId] = React.useState<string | null>(null);
  const [advantageActive, setAdvantageActive] = React.useState(true);
  const [advantageEyebrow, setAdvantageEyebrow] = React.useState('WHY CLIENTS CHOOSE US OVER TRADITIONAL AGENCIES');
  const [advantageTitle, setAdvantageTitle] = React.useState('The Gypsym Advantage');
  const [advantageDescription, setAdvantageDescription] = React.useState(
    'How we consistently deliver superior code quality, sub-second store speed, and faster delivery cycles at lower cost.'
  );
  const [comparisonPoints, setComparisonPoints] = React.useState<ComparisonPoint[]>(defaultComparisonPoints);

  // ── CTA Section State ──
  const [ctaId, setCtaId] = React.useState<string | null>(null);
  const [ctaActive, setCtaActive] = React.useState(true);
  const [ctaEyebrow, setCtaEyebrow] = React.useState('GET IN TOUCH');
  const [ctaTitle, setCtaTitle] = React.useState('Ready to Accelerate Your Shopify Revenue?');
  const [ctaTitleHighlight, setCtaTitleHighlight] = React.useState('Revenue');
  const [ctaDescription, setCtaDescription] = React.useState(
    'Schedule a 30-minute discovery consultation with our senior e-commerce architects to discuss your storefront goals, technical scope, and migration roadmap.'
  );
  const [ctaButtonLabel, setCtaButtonLabel] = React.useState('Schedule Strategy Call');
  const [ctaButtonUrl, setCtaButtonUrl] = React.useState('/book');

  // ── SEO State ──
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [ogImageUrl, setOgImageUrl] = React.useState('');
  const [noIndex, setNoIndex] = React.useState(false);

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

  const updateComparison = (idx: number, field: keyof ComparisonPoint, val: string) => {
    setComparisonPoints((prev) => {
      const copy = [...prev];
      const curr = copy[idx];
      if (curr) {
        copy[idx] = { ...curr, [field]: val };
      }
      return copy;
    });
  };

  // ── Load Data ──
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchApi<PageData>('/pages/services');
      if (page) {
        setPageData(page);

        // SEO
        const seo = page.seoMetadata;
        setMetaTitle(seo?.metaTitle || page.title || 'Our Services | Shopify Plus & E-commerce Agency');
        setMetaDescription(
          seo?.metaDescription ||
            page.description ||
            'Explore our core Shopify Plus development, migration, and optimization services.'
        );
        setCanonicalUrl(seo?.canonicalUrl || '');
        setOgImageUrl(seo?.ogImageUrl || '/assets/editorial/agency-hero-editorial.png');
        setNoIndex(Boolean(seo?.noIndex));

        // Hero Section
        const rawHero = page.sections?.find(
          (s) => s.sectionIdentifier === 'services-hero' || s.componentType === 'SERVICES' || s.sectionIdentifier === 'services'
        );
        if (rawHero) {
          setHeroId(rawHero.id);
          setHeroActive(rawHero.isActive);
          const p = (rawHero.contentPayload as any) || {};
          if (p.eyebrow) setHeroEyebrow(p.eyebrow);
          if (p.titlePrefix) setHeroTitlePrefix(p.titlePrefix);
          if (p.titleHighlight) setHeroTitleHighlight(p.titleHighlight);
          if (p.description) setHeroDescription(p.description);
          if (p.heroBackgroundImage) setHeroBackgroundImage(p.heroBackgroundImage);
          if (p.showHeroStrip !== undefined) setShowHeroStrip(p.showHeroStrip);
          if (Array.isArray(p.credentials) && p.credentials.length > 0) setCredentials(p.credentials);
          if (p.primaryCta?.label) setHeroPrimaryLabel(p.primaryCta.label);
          if (p.primaryCta?.url) setHeroPrimaryUrl(p.primaryCta.url);
          if (p.secondaryCta?.label) setHeroSecondaryLabel(p.secondaryCta.label);
          if (p.secondaryCta?.url) setHeroSecondaryUrl(p.secondaryCta.url);
        }

        // Grid Section
        const rawGrid = page.sections?.find(
          (s) => s.sectionIdentifier === 'services-grid' || s.sectionIdentifier === 'services-capabilities' || s.componentType === 'CAPABILITIES'
        );
        if (rawGrid) {
          setGridId(rawGrid.id);
          setGridActive(rawGrid.isActive);
          const p = (rawGrid.contentPayload as any) || {};
          if (p.eyebrow) setGridEyebrow(p.eyebrow);
          if (p.title) setGridTitle(p.title);
          if (p.titleHighlight) setGridTitleHighlight(p.titleHighlight);
          if (p.description) setGridDescription(p.description);
        }

        // Advantage Section
        const rawAdv = page.sections?.find(
          (s) => s.sectionIdentifier === 'services-advantage' || s.sectionIdentifier === 'gypsym-advantage' || s.componentType === 'FEATURE_GRID'
        );
        if (rawAdv) {
          setAdvantageId(rawAdv.id);
          setAdvantageActive(rawAdv.isActive);
          const p = (rawAdv.contentPayload as any) || {};
          if (p.eyebrow) setAdvantageEyebrow(p.eyebrow);
          if (p.title) setAdvantageTitle(p.title);
          if (p.description) setAdvantageDescription(p.description);
          if (Array.isArray(p.comparisonPoints) && p.comparisonPoints.length > 0) {
            setComparisonPoints(p.comparisonPoints);
          }
        }

        // CTA Section
        const rawCta = page.sections?.find(
          (s) => s.sectionIdentifier === 'services-cta' || s.componentType === 'CTA'
        );
        if (rawCta) {
          setCtaId(rawCta.id);
          setCtaActive(rawCta.isActive);
          const p = (rawCta.contentPayload as any) || {};
          if (p.eyebrow) setCtaEyebrow(p.eyebrow);
          if (p.title) setCtaTitle(p.title);
          if (p.titleHighlight) setCtaTitleHighlight(p.titleHighlight);
          if (p.description) setCtaDescription(p.description);
          if (p.primaryButton?.label) setCtaButtonLabel(p.primaryButton.label);
          if (p.primaryButton?.url) setCtaButtonUrl(p.primaryButton.url);
        }
      }
    } catch {
      notify.error('Could not load Services page from database.');
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
      // 1. Update Page SEO
      await fetchApi('/pages/services', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Services',
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

      // 2. Save / Create Hero Section
      const heroPayload = {
        eyebrow: heroEyebrow,
        titlePrefix: heroTitlePrefix,
        titleHighlight: heroTitleHighlight,
        description: heroDescription,
        heroBackgroundImage,
        showHeroStrip,
        credentials,
        primaryCta: { label: heroPrimaryLabel, url: heroPrimaryUrl },
        secondaryCta: { label: heroSecondaryLabel, url: heroSecondaryUrl },
      };

      if (heroId && !heroId.startsWith('local-')) {
        await fetchApi(`/sections/${heroId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: heroPayload,
            isActive: heroActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/services/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'services-hero',
            componentType: 'SERVICES',
            displayOrder: 1,
            contentPayload: heroPayload,
            isActive: heroActive,
          }),
        });
        if (created?.id) setHeroId(created.id);
      }

      // 3. Save / Create Capabilities Grid Section
      const gridPayload = {
        eyebrow: gridEyebrow,
        title: gridTitle,
        titleHighlight: gridTitleHighlight,
        description: gridDescription,
      };

      if (gridId && !gridId.startsWith('local-')) {
        await fetchApi(`/sections/${gridId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: gridPayload,
            isActive: gridActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/services/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'services-grid',
            componentType: 'CAPABILITIES',
            displayOrder: 2,
            contentPayload: gridPayload,
            isActive: gridActive,
          }),
        });
        if (created?.id) setGridId(created.id);
      }

      // 4. Save / Create Advantage Section
      const advantagePayload = {
        eyebrow: advantageEyebrow,
        title: advantageTitle,
        description: advantageDescription,
        comparisonPoints,
      };

      if (advantageId && !advantageId.startsWith('local-')) {
        await fetchApi(`/sections/${advantageId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: advantagePayload,
            isActive: advantageActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/services/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'services-advantage',
            componentType: 'FEATURE_GRID',
            displayOrder: 3,
            contentPayload: advantagePayload,
            isActive: advantageActive,
          }),
        });
        if (created?.id) setAdvantageId(created.id);
      }

      // 5. Save / Create CTA Section
      const ctaPayload = {
        eyebrow: ctaEyebrow,
        title: ctaTitle,
        titleHighlight: ctaTitleHighlight,
        description: ctaDescription,
        primaryButton: { label: ctaButtonLabel, url: ctaButtonUrl },
      };

      if (ctaId && !ctaId.startsWith('local-')) {
        await fetchApi(`/sections/${ctaId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: ctaPayload,
            isActive: ctaActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/services/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'services-cta',
            componentType: 'CTA',
            displayOrder: 4,
            contentPayload: ctaPayload,
            isActive: ctaActive,
          }),
        });
        if (created?.id) setCtaId(created.id);
      }

      notify.success('All Services Page sections saved successfully.');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save Services page sections.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <SectionsHeader
        pageTitle="Services"
        pageRoute="/services"
        layoutLabel="SERVICES ARCHITECTURE"
        sectionCount={4}
        status={pageData?.status || 'PUBLISHED'}
        saving={saving}
        loading={loading}
        onBack={onBack || (() => {})}
        onSave={handleSave}
        onRefresh={loadData}
      />

      <Tabs defaultValue="hero" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto flex flex-wrap gap-1.5 border border-slate-200/80">
          <TabsTrigger
            value="hero"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            1. Hero & Metrics
          </TabsTrigger>
          <TabsTrigger
            value="grid"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Capabilities & Grid
          </TabsTrigger>
          <TabsTrigger
            value="advantage"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            3. Gypsym Advantage
          </TabsTrigger>
          <TabsTrigger
            value="cta"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            4. Conversion CTA
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            5. SEO & OpenGraph
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: HERO BANNER ── */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Hero Section Settings</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Configure headline, background image, credentials strip, and CTA buttons.
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
                  placeholder="Specialized Shopify & D2C Capabilities"
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Title Prefix</Label>
                  <Input
                    value={heroTitlePrefix}
                    onChange={(e) => setHeroTitlePrefix(e.target.value)}
                    placeholder="Engineering High-Growth Shopify Stores That"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Title Highlight (Italicized Accent)</Label>
                  <Input
                    value={heroTitleHighlight}
                    onChange={(e) => setHeroTitleHighlight(e.target.value)}
                    placeholder="Convert"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
              </div>

              <div>
                <Label>Hero Description</Label>
                <Textarea
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="pt-2">
                <ImageUploadField
                  label="Hero Background Image / Artwork"
                  description="Upload an editorial photograph or asset for the hero background."
                  value={heroBackgroundImage}
                  onChange={setHeroBackgroundImage}
                  placeholder="/assets/editorial/agency-hero-editorial.png"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <Label>Primary CTA Button Label</Label>
                  <Input
                    value={heroPrimaryLabel}
                    onChange={(e) => setHeroPrimaryLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Primary CTA URL</Label>
                  <Input
                    value={heroPrimaryUrl}
                    onChange={(e) => setHeroPrimaryUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Secondary CTA Button Label</Label>
                  <Input
                    value={heroSecondaryLabel}
                    onChange={(e) => setHeroSecondaryLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Secondary CTA URL</Label>
                  <Input
                    value={heroSecondaryUrl}
                    onChange={(e) => setHeroSecondaryUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Bottom Credentials Strip</h4>
                    <p className="text-[11px] text-slate-500">4 high-impact proof metrics shown at the bottom of the hero</p>
                  </div>
                  <Switch checked={showHeroStrip} onCheckedChange={setShowHeroStrip} />
                </div>

                {showHeroStrip && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {credentials.map((cred, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                        <Label>Metric {idx + 1} Value</Label>
                        <Input
                          value={cred.value}
                          onChange={(e) => updateCredential(idx, 'value', e.target.value)}
                          className="h-8 text-xs font-bold"
                        />
                        <Label>Label</Label>
                        <Input
                          value={cred.label}
                          onChange={(e) => updateCredential(idx, 'label', e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Label>Subtext</Label>
                        <Input
                          value={cred.sub}
                          onChange={(e) => updateCredential(idx, 'sub', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: CAPABILITIES & GRID ── */}
        <TabsContent value="grid" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Capabilities & Services Grid Header</CardTitle>
                <CardDescription className="text-xs">
                  Header text for the interactive services showcase grid.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Active</span>
                <Switch checked={gridActive} onCheckedChange={setGridActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Eyebrow</Label>
                <Input
                  value={gridEyebrow}
                  onChange={(e) => setGridEyebrow(e.target.value)}
                  placeholder="FULL-SPECTRUM CAPABILITIES"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={gridTitle}
                    onChange={(e) => setGridTitle(e.target.value)}
                    placeholder="Everything Your Brand Needs to Scale on Shopify"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Title Highlight (Italic Accent)</Label>
                  <Input
                    value={gridTitleHighlight}
                    onChange={(e) => setGridTitleHighlight(e.target.value)}
                    placeholder="Shopify"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Section Description</Label>
                <Textarea
                  value={gridDescription}
                  onChange={(e) => setGridDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <div>
                  <span className="font-bold">Individual Service Cards</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Individual service offerings and pricing tiers are managed in Content → Services directory.
                  </p>
                </div>
                <Link href="/content/services">
                  <Button size="sm" variant="outline" className="text-xs bg-white border-blue-300">
                    Manage Services Items
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: GYPSYM ADVANTAGE ── */}
        <TabsContent value="advantage" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">The Gypsym Advantage / Comparison Matrix</CardTitle>
                <CardDescription className="text-xs">
                  Detailed feature-by-feature matrix comparing Gypsym against traditional agencies and freelance developers.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Active</span>
                <Switch checked={advantageActive} onCheckedChange={setAdvantageActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={advantageEyebrow}
                    onChange={(e) => setAdvantageEyebrow(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={advantageTitle}
                    onChange={(e) => setAdvantageTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={advantageDescription}
                  onChange={(e) => setAdvantageDescription(e.target.value)}
                  rows={2}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Comparison Points ({comparisonPoints.length})</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setComparisonPoints([
                        ...comparisonPoints,
                        {
                          feature: 'New Feature Area',
                          gypsym: 'Elite Gypsym Advantage',
                          traditional: 'Traditional Agency limitation',
                          freelance: 'Freelancer risk',
                        },
                      ])
                    }
                    className="h-8 text-xs font-semibold"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="space-y-3">
                  {comparisonPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Point #{idx + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setComparisonPoints(comparisonPoints.filter((_, i) => i !== idx))}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <Label>Feature / Capability</Label>
                          <Input
                            value={pt.feature}
                            onChange={(e) => updateComparison(idx, 'feature', e.target.value)}
                            className="h-8 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <Label className="text-emerald-700">Gypsym Advantage</Label>
                          <Input
                            value={pt.gypsym}
                            onChange={(e) => updateComparison(idx, 'gypsym', e.target.value)}
                            className="h-8 text-xs border-emerald-200 bg-emerald-50/30"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-600">Traditional Agency</Label>
                          <Input
                            value={pt.traditional}
                            onChange={(e) => updateComparison(idx, 'traditional', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-600">Freelance</Label>
                          <Input
                            value={pt.freelance}
                            onChange={(e) => updateComparison(idx, 'freelance', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: CTA SECTION ── */}
        <TabsContent value="cta" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Call to Action (CTA) Section</CardTitle>
                <CardDescription className="text-xs">
                  High-conversion bottom banner driving discovery bookings and consultations.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Active</span>
                <Switch checked={ctaActive} onCheckedChange={setCtaActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={ctaEyebrow}
                    onChange={(e) => setCtaEyebrow(e.target.value)}
                    placeholder="GET IN TOUCH"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Headline Highlight</Label>
                  <Input
                    value={ctaTitleHighlight}
                    onChange={(e) => setCtaTitleHighlight(e.target.value)}
                    placeholder="Revenue"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Headline</Label>
                <Input
                  value={ctaTitle}
                  onChange={(e) => setCtaTitle(e.target.value)}
                  placeholder="Ready to Accelerate Your Shopify Revenue?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={ctaDescription}
                  onChange={(e) => setCtaDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <Label>Button Label</Label>
                  <Input
                    value={ctaButtonLabel}
                    onChange={(e) => setCtaButtonLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Button URL</Label>
                  <Input
                    value={ctaButtonUrl}
                    onChange={(e) => setCtaButtonUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: SEO & METADATA ── */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Services Page SEO & Metadata</CardTitle>
              <CardDescription className="text-xs">
                Search engine optimization tags, canonical links, and OpenGraph social preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Our Services | Shopify Plus & E-commerce Agency | Gypsym"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://gypsym.com/services"
                    className="h-10 text-xs font-mono rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Social OpenGraph (OG) Image"
                    description="Upload directly or specify a URL (1200x630 recommended for LinkedIn, X, and WhatsApp previews)."
                    value={ogImageUrl}
                    onChange={setOgImageUrl}
                    placeholder="/assets/editorial/agency-hero-editorial.png"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
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
