'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Trash2, Users, ArrowUpRight } from 'lucide-react';
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

export interface AboutStudioProps {
  onBack?: () => void;
}

interface StatItem {
  label: string;
  value: string;
  sub: string;
}

interface PillarItem {
  title: string;
  desc: string;
}

const defaultStats: StatItem[] = [
  { label: 'Shopify Projects', value: '120+', sub: 'Global D2C Stores' },
  { label: 'Senior Engineers', value: '25+', sub: 'Liquid & Hydrogen Specialists' },
  { label: 'Emergency SLA', value: '< 60m', sub: 'Critical Bug Turnaround' },
  { label: 'Years in E-Commerce', value: '8+', sub: 'Deep Industry Experience' },
];

const defaultPillars: PillarItem[] = [
  {
    title: 'Engineering-Led, Not Account-Heavy',
    desc: 'You speak directly with senior engineers who understand Liquid syntax, GraphQL Storefront API, and checkout extensibility.',
  },
  {
    title: 'Zero App Bloat Philosophy',
    desc: 'We replace costly, script-heavy third-party Shopify apps with lean native OS 2.0 sections, keeping mobile Lighthouse scores 90+.',
  },
  {
    title: '40–60% Global Cost Advantage',
    desc: 'Boutique quality matching elite London and NYC agencies at a fraction of the billable hourly overhead.',
  },
  {
    title: 'Transparent Deliverables & SLA',
    desc: 'Strict milestone commitments, transparent code repository access, and guaranteed sub-60m emergency response SLAs.',
  },
];

export function AboutStudio({ onBack }: AboutStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);

  // ── Hero State ──
  const [heroId, setHeroId] = React.useState<string | null>(null);
  const [heroActive, setHeroActive] = React.useState(true);
  const [heroEyebrow, setHeroEyebrow] = React.useState('ABOUT GYPSYM TECHNOLOGY');
  const [heroHeadline, setHeroHeadline] = React.useState('Architects of High-Growth Shopify Storefronts');
  const [heroHighlight, setHeroHighlight] = React.useState('High-Growth');
  const [heroSubheadline, setHeroSubheadline] = React.useState(
    'Founded to solve the hardest problems in e-commerce engineering, headless performance, and custom Shopify architecture for ambitious global brands.'
  );
  const [heroBackgroundImage, setHeroBackgroundImage] = React.useState('/assets/editorial/agency-hero-editorial.png');
  const [showHeroStrip, setShowHeroStrip] = React.useState(true);
  const [stats, setStats] = React.useState<StatItem[]>(defaultStats);

  // ── Mission & Story State ──
  const [storyId, setStoryId] = React.useState<string | null>(null);
  const [storyActive, setStoryActive] = React.useState(true);
  const [storyEyebrow, setStoryEyebrow] = React.useState('OUR ETHOS & ARCHITECTURAL PHILOSOPHY');
  const [storyTitle, setStoryTitle] = React.useState('Built Different: Code Quality Without Compromise');
  const [storyDescription, setStoryDescription] = React.useState(
    'Most agencies hand off projects to junior devs while charging astronomical fees. We operate with a dedicated squad of senior developers, providing high-touch engineering that moves your conversion needle.'
  );
  const [pillars, setPillars] = React.useState<PillarItem[]>(defaultPillars);

  // ── Team Section State ──
  const [teamId, setTeamId] = React.useState<string | null>(null);
  const [teamActive, setTeamActive] = React.useState(true);
  const [teamEyebrow, setTeamEyebrow] = React.useState('DIRECT ACCESS');
  const [teamTitle, setTeamTitle] = React.useState('Direct Access to Senior Technical Minds');
  const [teamTitleHighlight, setTeamTitleHighlight] = React.useState('Technical Minds');
  const [teamDescription, setTeamDescription] = React.useState(
    'No account executives filtering your requirements. Direct collaboration with experienced specialists.'
  );

  // ── CTA State ──
  const [ctaId, setCtaId] = React.useState<string | null>(null);
  const [ctaActive, setCtaActive] = React.useState(true);
  const [ctaEyebrow, setCtaEyebrow] = React.useState('COLLABORATE');
  const [ctaTitle, setCtaTitle] = React.useState('Ready to Build Your Flagship Storefront?');
  const [ctaDescription, setCtaDescription] = React.useState(
    'Connect with our principal architects to explore your architectural roadmap and project timeline.'
  );
  const [ctaButtonLabel, setCtaButtonLabel] = React.useState('Schedule Architecture Call');
  const [ctaButtonUrl, setCtaButtonUrl] = React.useState('/book');

  // ── SEO State ──
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [ogImageUrl, setOgImageUrl] = React.useState('');
  const [noIndex, setNoIndex] = React.useState(false);

  const updateStat = (idx: number, field: keyof StatItem, val: string) => {
    setStats((prev) => {
      const copy = [...prev];
      const curr = copy[idx];
      if (curr) {
        copy[idx] = { ...curr, [field]: val };
      }
      return copy;
    });
  };

  const updatePillar = (idx: number, field: keyof PillarItem, val: string) => {
    setPillars((prev) => {
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
      const page = await fetchApi<PageData>('/pages/about');
      if (page) {
        setPageData(page);

        // SEO
        const seo = page.seoMetadata;
        setMetaTitle(seo?.metaTitle || page.title || 'About Gypsym | Elite Shopify Plus Engineering');
        setMetaDescription(
          seo?.metaDescription ||
            page.description ||
            'Learn about Gypsym Technology, our engineering-first philosophy, senior specialists, and client-proven track record.'
        );
        setCanonicalUrl(seo?.canonicalUrl || '');
        setOgImageUrl(seo?.ogImageUrl || '/assets/editorial/agency-hero-editorial.png');
        setNoIndex(Boolean(seo?.noIndex));

        // Hero Section
        const rawHero = page.sections?.find(
          (s) => s.sectionIdentifier === 'about-hero' || s.componentType === 'HERO'
        );
        if (rawHero) {
          setHeroId(rawHero.id);
          setHeroActive(rawHero.isActive);
          const p = (rawHero.contentPayload as any) || {};
          if (p.eyebrow) setHeroEyebrow(p.eyebrow);
          if (p.headline) setHeroHeadline(p.headline);
          if (p.titleHighlight) setHeroHighlight(p.titleHighlight);
          if (p.subheadline) setHeroSubheadline(p.subheadline);
          if (p.backgroundImage) setHeroBackgroundImage(p.backgroundImage);
          if (p.showHeroStrip !== undefined) setShowHeroStrip(p.showHeroStrip);
          if (Array.isArray(p.stats) && p.stats.length > 0) setStats(p.stats);
        }

        // Story Section
        const rawStory = page.sections?.find(
          (s) => s.sectionIdentifier === 'about-story' || s.componentType === 'FEATURE_GRID'
        );
        if (rawStory) {
          setStoryId(rawStory.id);
          setStoryActive(rawStory.isActive);
          const p = (rawStory.contentPayload as any) || {};
          if (p.eyebrow) setStoryEyebrow(p.eyebrow);
          if (p.title) setStoryTitle(p.title);
          if (p.description) setStoryDescription(p.description);
          if (Array.isArray(p.pillars) && p.pillars.length > 0) setPillars(p.pillars);
        }

        // Team Section
        const rawTeam = page.sections?.find(
          (s) => s.sectionIdentifier === 'about-team'
        );
        if (rawTeam) {
          setTeamId(rawTeam.id);
          setTeamActive(rawTeam.isActive);
          const p = (rawTeam.contentPayload as any) || {};
          if (p.eyebrow) setTeamEyebrow(p.eyebrow);
          if (p.title) setTeamTitle(p.title);
          if (p.titleHighlight) setTeamTitleHighlight(p.titleHighlight);
          if (p.description) setTeamDescription(p.description);
        }

        // CTA Section
        const rawCta = page.sections?.find(
          (s) => s.sectionIdentifier === 'about-cta' || s.componentType === 'CTA'
        );
        if (rawCta) {
          setCtaId(rawCta.id);
          setCtaActive(rawCta.isActive);
          const p = (rawCta.contentPayload as any) || {};
          if (p.eyebrow) setCtaEyebrow(p.eyebrow);
          if (p.title) setCtaTitle(p.title);
          if (p.description) setCtaDescription(p.description);
          if (p.buttonLabel) setCtaButtonLabel(p.buttonLabel);
          if (p.buttonUrl) setCtaButtonUrl(p.buttonUrl);
        }
      }
    } catch {
      notify.error('Could not load About page from database.');
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
      await fetchApi('/pages/about', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'About',
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

      // 2. Save Hero Section
      const heroPayload = {
        eyebrow: heroEyebrow,
        headline: heroHeadline,
        titleHighlight: heroHighlight,
        subheadline: heroSubheadline,
        backgroundImage: heroBackgroundImage,
        showHeroStrip,
        stats,
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
        const created = await fetchApi<any>('/pages/about/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'about-hero',
            componentType: 'HERO',
            displayOrder: 1,
            contentPayload: heroPayload,
            isActive: heroActive,
          }),
        });
        if (created?.id) setHeroId(created.id);
      }

      // 3. Save Story Section
      const storyPayload = {
        eyebrow: storyEyebrow,
        title: storyTitle,
        description: storyDescription,
        pillars,
      };

      if (storyId && !storyId.startsWith('local-')) {
        await fetchApi(`/sections/${storyId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: storyPayload,
            isActive: storyActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/about/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'about-story',
            componentType: 'FEATURE_GRID',
            displayOrder: 2,
            contentPayload: storyPayload,
            isActive: storyActive,
          }),
        });
        if (created?.id) setStoryId(created.id);
      }

      // 4. Save Team Section metadata
      const teamPayload = {
        eyebrow: teamEyebrow,
        title: teamTitle,
        titleHighlight: teamTitleHighlight,
        description: teamDescription,
      };

      if (teamId && !teamId.startsWith('local-')) {
        await fetchApi(`/sections/${teamId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: teamPayload,
            isActive: teamActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/about/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'about-team',
            componentType: 'TEAM',
            displayOrder: 3,
            contentPayload: teamPayload,
            isActive: teamActive,
          }),
        });
        if (created?.id) setTeamId(created.id);
      }

      // 5. Save CTA Section
      const ctaPayload = {
        eyebrow: ctaEyebrow,
        title: ctaTitle,
        description: ctaDescription,
        buttonLabel: ctaButtonLabel,
        buttonUrl: ctaButtonUrl,
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
        const created = await fetchApi<any>('/pages/about/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'about-cta',
            componentType: 'CTA',
            displayOrder: 4,
            contentPayload: ctaPayload,
            isActive: ctaActive,
          }),
        });
        if (created?.id) setCtaId(created.id);
      }

      notify.success('All About Page sections saved successfully.');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save About page sections.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: 'PUBLISHED' | 'DRAFT') => {
    try {
      await fetchApi('/pages/about', {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setPageData((prev) => (prev ? { ...prev, status: newStatus } : null));
      notify.success(`About page status updated to ${newStatus === 'PUBLISHED' ? 'Public' : 'Draft'}.`);
    } catch {
      notify.error('Failed to update page status.');
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      <SectionsHeader
        pageTitle="About"
        pageRoute="/about"
        layoutLabel="AGENCY PROFILE"
        sectionCount={4}
        status={pageData?.status || 'PUBLISHED'}
        onStatusChange={handleStatusChange}
        saving={saving}
        loading={loading}
        onBack={onBack || (() => {})}
        onSave={handleSave}
        onRefresh={loadData}
      />

      {/* Team Profiles Announcement Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-100 bg-blue-50/70 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">Team Profiles Moved to Separate Menu</h4>
            <p className="text-[11px] text-blue-800/80 mt-0.5">
              Team members and leadership fellows are now managed in their own dedicated workspace with direct photo upload and social links.
            </p>
          </div>
        </div>
        <Link href="/content/team">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-blue-200 text-blue-700 bg-white hover:bg-blue-50 h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
          >
            Manage Team
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
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
            value="story"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Mission & Pillars
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            3. Team Section
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

        {/* ── TAB 1: HERO ── */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Hero Section</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Header headline, ethos summary, background artwork, and credentials.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={heroActive} onCheckedChange={setHeroActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={heroEyebrow}
                    onChange={(e) => setHeroEyebrow(e.target.value)}
                    placeholder="ABOUT GYPSYM TECHNOLOGY"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Headline Highlight Word</Label>
                  <Input
                    value={heroHighlight}
                    onChange={(e) => setHeroHighlight(e.target.value)}
                    placeholder="High-Growth"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
              </div>

              <div>
                <Label>Hero Headline</Label>
                <Input
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="Architects of High-Growth Shopify Storefronts"
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div>
                <Label>Subheadline / Mission Narrative</Label>
                <Textarea
                  value={heroSubheadline}
                  onChange={(e) => setHeroSubheadline(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="pt-2">
                <ImageUploadField
                  label="Hero Background Artwork / Graphic"
                  description="Upload an editorial photograph or visual asset for the hero background."
                  value={heroBackgroundImage}
                  onChange={setHeroBackgroundImage}
                  placeholder="/assets/editorial/agency-hero-editorial.png"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Stats & Key Figures Strip</h4>
                    <p className="text-[11px] text-slate-500">Highlighted agency metric achievements</p>
                  </div>
                  <Switch checked={showHeroStrip} onCheckedChange={setShowHeroStrip} />
                </div>

                {showHeroStrip && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((st, idx) => (
                      <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2.5">
                        <div>
                          <Label>Stat {idx + 1} Value</Label>
                          <Input
                            value={st.value}
                            onChange={(e) => updateStat(idx, 'value', e.target.value)}
                            className="h-9 text-xs font-bold rounded-lg border-slate-200"
                          />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={st.label}
                            onChange={(e) => updateStat(idx, 'label', e.target.value)}
                            className="h-9 text-xs rounded-lg border-slate-200"
                          />
                        </div>
                        <div>
                          <Label>Subtext</Label>
                          <Input
                            value={st.sub}
                            onChange={(e) => updateStat(idx, 'sub', e.target.value)}
                            className="h-9 text-xs rounded-lg border-slate-200"
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

        {/* ── TAB 2: STORY & PILLARS ── */}
        <TabsContent value="story" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Mission, Ethos & Core Pillars</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  What sets Gypsym apart from bloated traditional agency models.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={storyActive} onCheckedChange={setStoryActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={storyEyebrow}
                    onChange={(e) => setStoryEyebrow(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
              </div>

              <div>
                <Label>Story & Mission Overview</Label>
                <Textarea
                  value={storyDescription}
                  onChange={(e) => setStoryDescription(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Core Pillars ({pillars.length})</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPillars([...pillars, { title: 'New Core Pillar', desc: 'Detailed explanation of this pillar.' }])
                    }
                    className="h-8 text-xs font-semibold rounded-xl border-slate-200"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Pillar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pillars.map((pil, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Pillar #{idx + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPillars(pillars.filter((_, i) => i !== idx))}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={pil.title}
                        onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                        className="h-9 text-xs font-semibold rounded-lg border-slate-200"
                        placeholder="Pillar Title"
                      />
                      <Textarea
                        value={pil.desc}
                        onChange={(e) => updatePillar(idx, 'desc', e.target.value)}
                        rows={2}
                        className="text-xs rounded-lg border-slate-200"
                        placeholder="Pillar Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: TEAM SECTION ── */}
        <TabsContent value="team" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Team Section Heading</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Eyebrow, title, and description shown above the team member cards on the About page.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={teamActive} onCheckedChange={setTeamActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={teamEyebrow}
                    onChange={(e) => setTeamEyebrow(e.target.value)}
                    placeholder="DIRECT ACCESS"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Title Highlight Word</Label>
                  <Input
                    value={teamTitleHighlight}
                    onChange={(e) => setTeamTitleHighlight(e.target.value)}
                    placeholder="Technical Minds"
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
              </div>

              <div>
                <Label>Section Title</Label>
                <Input
                  value={teamTitle}
                  onChange={(e) => setTeamTitle(e.target.value)}
                  placeholder="Direct Access to Senior Technical Minds"
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  rows={3}
                  placeholder="No account executives filtering your requirements..."
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">Team Member Profiles</p>
                  <p className="text-[11px] text-blue-700/80 mt-0.5">
                    Individual team member cards (photo, name, role, bio, social links) are managed separately in the
                    Team Profiles workspace.
                  </p>
                  <Link href="/content/team" className="text-[11px] text-blue-600 font-semibold hover:underline mt-1 inline-block">
                    → Go to Team Profiles
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: CTA ── */}
        <TabsContent value="cta" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Call to Action (CTA)</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Invitation to collaborate and schedule direct consultation.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={ctaActive} onCheckedChange={setCtaActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={ctaEyebrow}
                    onChange={(e) => setCtaEyebrow(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={ctaTitle}
                    onChange={(e) => setCtaTitle(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={ctaDescription}
                  onChange={(e) => setCtaDescription(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                <div>
                  <Label>Button Label</Label>
                  <Input
                    value={ctaButtonLabel}
                    onChange={(e) => setCtaButtonLabel(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <Label>Button URL</Label>
                  <Input
                    value={ctaButtonUrl}
                    onChange={(e) => setCtaButtonUrl(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-200/90"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: SEO ── */}
        <TabsContent value="seo" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">About Page SEO & Metadata</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Search indexing, canonical tags, and OpenGraph social preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="About Gypsym | Elite Shopify Plus Engineering"
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://gypsym.com/about"
                    className="h-10 text-xs font-mono rounded-xl border-slate-200/90"
                  />
                </div>

                <div>
                  <ImageUploadField
                    label="Social OpenGraph (OG) Image"
                    description="Upload directly or specify a URL. Recommended 1200x630px for optimal social previews."
                    value={ogImageUrl}
                    onChange={setOgImageUrl}
                    placeholder="/assets/editorial/agency-hero-editorial.png"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 pt-3">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Robots No-Index</span>
                  <span className="text-[11px] text-slate-400 block">
                    Instruct search engines to NOT index this page
                  </span>
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
