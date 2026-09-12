'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';

import { PagesTable } from './_components/pages-table';
import { SectionsHeader } from './_components/sections-header';
import { HeroSettings } from './_components/hero-settings';
import { MetricsSettings } from './_components/metrics-settings';
import { RevenueExperimentSettings } from './_components/revenue-experiment-settings';
import { WhatWeChangeSettings } from './_components/what-we-change-settings';
import { DeliveryProcessSettings } from './_components/delivery-process-settings';
import { ClientTestimonialsSettings } from './_components/client-testimonials-settings';
import { SectionPreview, ActiveTab } from './_components/section-preview';
import type {
  HeroSection,
  MetricsSection,
  RevenueExperimentSection,
  WhatWeChangeSection,
  DeliveryProcessSection,
  ClientTestimonialsSection,
  PageData,
  HeroPayload,
  MetricsPayload,
  RevenueExperimentPayload,
  WhatWeChangePayload,
  DeliveryProcessPayload,
  ClientTestimonialsPayload,
} from './_components/types';

// ─── Helpers ────────────────────────────────────────────────────────────────────
function extractHeroHeadline(payload: HeroPayload): string {
  if (Array.isArray(payload.headline?.segments)) {
    return payload.headline.segments.map((s) => s.text || s.value || '').join(' ');
  }
  return '';
}

function extractMetricsHeadline(payload: MetricsPayload): string {
  if (Array.isArray(payload.headline?.segments)) {
    return payload.headline.segments.map((s) => s.value || s.text || '').join('');
  }
  return '';
}

// ─── Page Component ──────────────────────────────────────────────────────────────
export default function PagesManagementPage() {
  // Hydration safety mount guard
  const [mounted, setMounted] = React.useState(false);

  // View state: list of pages or 4-section studio
  const [viewMode, setViewMode] = React.useState<'list' | 'sections'>('list');

  // Active section tab
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('hero');

  // Backend state
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);

  const [heroSection, setHeroSection] = React.useState<HeroSection | null>(null);
  const [metricsSection, setMetricsSection] = React.useState<MetricsSection | null>(null);
  const [croSection, setCroSection] = React.useState<RevenueExperimentSection | null>(null);
  const [whatWeChangeSection, setWhatWeChangeSection] = React.useState<WhatWeChangeSection | null>(null);
  const [deliveryProcessSection, setDeliveryProcessSection] = React.useState<DeliveryProcessSection | null>(null);
  const [clientTestimonialsSection, setClientTestimonialsSection] = React.useState<ClientTestimonialsSection | null>(null);

  // ── Fetch page & sections from backend API ─────────────────────────────────
  const loadBackendData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi<PageData>('/pages/home');
      if (res) {
        setPageData(res);

        const heroRaw = res.sections?.find(
          (s) => s.componentType === 'HERO' || s.sectionIdentifier === 'hero-banner'
        );
        const metricsRaw = res.sections?.find(
          (s) =>
            s.componentType === 'METRICS_BANNER' ||
            s.sectionIdentifier === 'verified-results-metrics'
        );
        const croRaw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'cro-revenue-experiment' ||
            s.componentType === 'CTA_STRIP'
        );
        const whatWeChangeRaw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'what-we-actually-change' ||
            s.componentType === 'FEATURE_GRID'
        );
        const deliveryProcessRaw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'delivery-process' ||
            s.componentType === 'TABBED_SOLUTIONS'
        );
        const clientTestimonialsRaw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'client-testimonials' ||
            s.componentType === 'TESTIMONIAL_SLIDER'
        );

        if (heroRaw) {
          setHeroSection({
            id: heroRaw.id,
            componentType: heroRaw.componentType,
            isActive: heroRaw.isActive,
            contentPayload: heroRaw.contentPayload as HeroPayload,
          });
        }

        if (metricsRaw) {
          setMetricsSection({
            id: metricsRaw.id,
            componentType: metricsRaw.componentType,
            isActive: metricsRaw.isActive,
            contentPayload: metricsRaw.contentPayload as MetricsPayload,
          });
        }

        if (croRaw) {
          setCroSection({
            id: croRaw.id,
            componentType: croRaw.componentType,
            isActive: croRaw.isActive,
            contentPayload: croRaw.contentPayload as RevenueExperimentPayload,
          });
        }

        if (whatWeChangeRaw) {
          setWhatWeChangeSection({
            id: whatWeChangeRaw.id,
            componentType: whatWeChangeRaw.componentType,
            isActive: whatWeChangeRaw.isActive,
            contentPayload: whatWeChangeRaw.contentPayload as WhatWeChangePayload,
          });
        }

        if (deliveryProcessRaw) {
          setDeliveryProcessSection({
            id: deliveryProcessRaw.id,
            componentType: deliveryProcessRaw.componentType,
            isActive: deliveryProcessRaw.isActive,
            contentPayload: deliveryProcessRaw.contentPayload as DeliveryProcessPayload,
          });
        }

        if (clientTestimonialsRaw) {
          setClientTestimonialsSection({
            id: clientTestimonialsRaw.id,
            componentType: clientTestimonialsRaw.componentType,
            isActive: clientTestimonialsRaw.isActive,
            contentPayload: clientTestimonialsRaw.contentPayload as ClientTestimonialsPayload,
          });
        }
      }
    } catch {
      notify.error('Could not load page data from backend. Check server connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    loadBackendData();
  }, [loadBackendData]);

  // ── Derived helpers ────────────────────────────────────────────────────────
  const heroPayload: HeroPayload = heroSection?.contentPayload ?? {};
  const metricsPayload: MetricsPayload = metricsSection?.contentPayload ?? {};
  const croPayload: RevenueExperimentPayload = croSection?.contentPayload ?? {};
  const whatWeChangePayload: WhatWeChangePayload = whatWeChangeSection?.contentPayload ?? {};
  const deliveryProcessPayload: DeliveryProcessPayload = deliveryProcessSection?.contentPayload ?? {};
  const clientTestimonialsPayload: ClientTestimonialsPayload = clientTestimonialsSection?.contentPayload ?? {};

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'hero') {
        const headline = extractHeroHeadline(heroPayload);
        if (!headline.trim()) {
          notify.error('Validation: Hero headline cannot be empty.');
          setSaving(false);
          return;
        }
        if (heroSection && !heroSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${heroSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: heroSection.contentPayload,
              isActive: heroSection.isActive,
            }),
          });
        }
        notify.success('Hero Section settings saved and synchronized.');
      } else if (activeTab === 'verifiedResults') {
        const headline = extractMetricsHeadline(metricsPayload);
        if (!headline.trim()) {
          notify.error('Validation: Verified Results headline cannot be empty.');
          setSaving(false);
          return;
        }
        if (metricsSection && !metricsSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${metricsSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: metricsSection.contentPayload,
              isActive: metricsSection.isActive,
            }),
          });
        }
        notify.success('Verified Results settings saved and synchronized.');
      } else if (activeTab === 'croExperiment') {
        if (!croPayload.headline?.trim()) {
          notify.error('Validation: CRO experiment headline cannot be empty.');
          setSaving(false);
          return;
        }
        if (croSection && !croSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${croSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: croSection.contentPayload,
              isActive: croSection.isActive,
            }),
          });
        }
        notify.success('CRO Revenue Experiment settings saved and synchronized.');
      } else if (activeTab === 'whatWeChange') {
        if (!whatWeChangePayload.title?.trim()) {
          notify.error('Validation: Section title cannot be empty.');
          setSaving(false);
          return;
        }
        if (whatWeChangeSection && !whatWeChangeSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${whatWeChangeSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: whatWeChangeSection.contentPayload,
              isActive: whatWeChangeSection.isActive,
            }),
          });
        }
        notify.success('What We Actually Change settings saved and synchronized.');
      } else if (activeTab === 'deliveryProcess') {
        if (!deliveryProcessPayload.title?.trim()) {
          notify.error('Validation: Delivery process title cannot be empty.');
          setSaving(false);
          return;
        }
        if (deliveryProcessSection && !deliveryProcessSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${deliveryProcessSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: deliveryProcessSection.contentPayload,
              isActive: deliveryProcessSection.isActive,
            }),
          });
        }
        notify.success('Delivery process updated successfully.');
      } else if (activeTab === 'clientTestimonials') {
        if (!clientTestimonialsPayload.title?.trim()) {
          notify.error('Validation: Section title cannot be empty.');
          setSaving(false);
          return;
        }
        if (clientTestimonialsSection && !clientTestimonialsSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${clientTestimonialsSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: clientTestimonialsSection.contentPayload,
              isActive: clientTestimonialsSection.isActive,
            }),
          });
        }
        notify.success('Client Testimonials updated successfully.');
      }
    } catch {
      notify.error('Unable to update the section settings.');
    } finally {
      setSaving(false);
    }
  };

  // ── SSR hydration guard ────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto py-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-2 space-y-6">
      {/* ── LIST VIEW ────────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <PagesTable
          pageData={pageData}
          loading={loading}
          onConfigure={() => setViewMode('sections')}
        />
      )}

      {/* ── SECTIONS STUDIO ──────────────────────────────────────────────── */}
      {viewMode === 'sections' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <SectionsHeader
            saving={saving}
            onBack={() => setViewMode('list')}
            onSave={handleSave}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: 4-Section Tabs (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as ActiveTab)}
                className="w-full space-y-4"
              >
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-6 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 h-auto gap-1">
                  <TabsTrigger
                    value="hero"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    1. Hero
                  </TabsTrigger>
                  <TabsTrigger
                    value="verifiedResults"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    2. Results
                  </TabsTrigger>
                  <TabsTrigger
                    value="croExperiment"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    3. CRO Test
                  </TabsTrigger>
                  <TabsTrigger
                    value="whatWeChange"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    4. Change
                  </TabsTrigger>
                  <TabsTrigger
                    value="deliveryProcess"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    5. Process
                  </TabsTrigger>
                  <TabsTrigger
                    value="clientTestimonials"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    6. Reviews
                  </TabsTrigger>
                </TabsList>

                {/* 1. Hero Tab */}
                <TabsContent value="hero" className="focus-visible:outline-none">
                  {heroSection ? (
                    <HeroSettings
                      section={heroSection}
                      onChange={setHeroSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Hero section…' : 'Hero section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 2. Verified Results Tab */}
                <TabsContent value="verifiedResults" className="focus-visible:outline-none">
                  {metricsSection ? (
                    <MetricsSettings
                      section={metricsSection}
                      onChange={setMetricsSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Verified Results section…' : 'Metrics section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 3. CRO Experiment Tab */}
                <TabsContent value="croExperiment" className="focus-visible:outline-none">
                  {croSection ? (
                    <RevenueExperimentSettings
                      section={croSection}
                      onChange={setCroSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading CRO Experiment section…' : 'CRO Experiment section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 4. What We Change Tab */}
                <TabsContent value="whatWeChange" className="focus-visible:outline-none">
                  {whatWeChangeSection ? (
                    <WhatWeChangeSettings
                      section={whatWeChangeSection}
                      onChange={setWhatWeChangeSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading What We Change section…' : 'What We Change section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 5. Delivery Process Tab */}
                <TabsContent value="deliveryProcess" className="focus-visible:outline-none">
                  {deliveryProcessSection ? (
                    <DeliveryProcessSettings
                      section={deliveryProcessSection}
                      onChange={setDeliveryProcessSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Delivery Process section…' : 'Delivery Process section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 6. Client Testimonials Tab */}
                <TabsContent value="clientTestimonials" className="focus-visible:outline-none">
                  {clientTestimonialsSection ? (
                    <ClientTestimonialsSettings
                      section={clientTestimonialsSection}
                      onChange={setClientTestimonialsSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Client Testimonials section…' : 'Client Testimonials section not found in backend.'}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* RIGHT: Live Preview (5 Cols) */}
            <div className="lg:col-span-5 sticky top-20">
              <SectionPreview
                activeTab={activeTab}
                heroPayload={heroPayload}
                metricsPayload={metricsPayload}
                croPayload={croPayload}
                whatWeChangePayload={whatWeChangePayload}
                deliveryProcessPayload={deliveryProcessPayload}
                clientTestimonialsPayload={clientTestimonialsPayload}
                heroHeadlineText={extractHeroHeadline(heroPayload)}
                metricsHeadlineText={extractMetricsHeadline(metricsPayload)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
