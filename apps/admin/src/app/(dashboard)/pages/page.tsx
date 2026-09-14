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
import { PortfolioSettings } from './_components/portfolio-settings';
import { DeliveryProcessSettings } from './_components/delivery-process-settings';
import { ClientTestimonialsSettings } from './_components/client-testimonials-settings';
import { ClientsSettings } from './_components/clients-settings';
import { PartnersSettings } from './_components/partners-settings';
import { CtaSettings } from './_components/cta-settings';
import { ContactSettings } from './_components/contact-settings';
import { SectionPreview, ActiveTab } from './_components/section-preview';
import type {
  HeroSection,
  MetricsSection,
  RevenueExperimentSection,
  WhatWeChangeSection,
  PortfolioSection,
  DeliveryProcessSection,
  ClientTestimonialsSection,
  ClientsSection,
  PartnersSection,
  CtaSection,
  ContactSection,
  PageData,
  HeroPayload,
  MetricsPayload,
  RevenueExperimentPayload,
  WhatWeChangePayload,
  PortfolioPayload,
  DeliveryProcessPayload,
  ClientTestimonialsPayload,
  ClientsPayload,
  PartnersPayload,
  CtaPayload,
  ContactPayload,
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
  const [portfolioSection, setPortfolioSection] = React.useState<PortfolioSection | null>(null);
  const [deliveryProcessSection, setDeliveryProcessSection] = React.useState<DeliveryProcessSection | null>(null);
  const [clientTestimonialsSection, setClientTestimonialsSection] = React.useState<ClientTestimonialsSection | null>(null);
  const [clientsSection, setClientsSection] = React.useState<ClientsSection | null>(null);
  const [partnersSection, setPartnersSection] = React.useState<PartnersSection | null>(null);
  const [ctaSection, setCtaSection] = React.useState<CtaSection | null>(null);
  const [contactSection, setContactSection] = React.useState<ContactSection | null>(null);

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
        const portfolioRaw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'portfolio-showcase' ||
            s.sectionIdentifier === 'our-work' ||
            s.sectionIdentifier === 'portfolio'
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
        const clientsRaw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'clients-trusted-by' ||
            s.sectionIdentifier === 'trusted-by' ||
            (s.componentType === 'LOGO_CLOUD' && s.sectionIdentifier !== 'homepage-partners')
        );
        const partnersRaw = res.sections?.find(
          (s) =>
            s.sectionIdentifier === 'homepage-partners' ||
            s.sectionIdentifier === 'our-partners' ||
            s.sectionIdentifier === 'partners' ||
            s.componentType === 'PARTNERS'
        );
        const ctaRaw = res.sections?.find(
          (s) =>
            s.componentType === 'CTA' ||
            s.sectionIdentifier === 'homepage-cta' ||
            s.sectionIdentifier === 'cta-banner'
        );
        const contactRaw = res.sections?.find(
          (s) =>
            s.componentType === 'CONTACT' ||
            s.sectionIdentifier === 'contact-inquiry' ||
            s.sectionIdentifier === 'contact'
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

        if (portfolioRaw) {
          setPortfolioSection({
            id: portfolioRaw.id,
            componentType: portfolioRaw.componentType,
            isActive: portfolioRaw.isActive,
            contentPayload: portfolioRaw.contentPayload as PortfolioPayload,
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

        if (clientsRaw) {
          setClientsSection({
            id: clientsRaw.id,
            componentType: clientsRaw.componentType,
            isActive: clientsRaw.isActive,
            contentPayload: clientsRaw.contentPayload as ClientsPayload,
          });
        }

        if (partnersRaw) {
          setPartnersSection({
            id: partnersRaw.id,
            componentType: partnersRaw.componentType,
            isActive: partnersRaw.isActive,
            contentPayload: partnersRaw.contentPayload as PartnersPayload,
          });
        }

        if (ctaRaw) {
          setCtaSection({
            id: ctaRaw.id,
            componentType: ctaRaw.componentType,
            isActive: ctaRaw.isActive,
            contentPayload: ctaRaw.contentPayload as CtaPayload,
          });
        } else {
          setCtaSection({
            id: 'local-cta',
            componentType: 'CTA',
            isActive: true,
            contentPayload: {
              eyebrow: 'ENTERPRISE ARCHITECTURE',
              title: 'Ready to Accelerate Your Digital Transformation?',
              titleHighlight: 'Transformation',
              description:
                'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure engineered for uncompromising scale.',
              primaryButton: {
                label: 'Schedule an Architectural Briefing',
                url: '#contact-inquiry',
                variant: 'glow',
                target: '_self',
              },
              secondaryButton: {
                enabled: true,
                label: 'Explore Technology Radar',
                url: '/technologies',
                variant: 'outline',
                target: '_self',
              },
              appearance: {
                backgroundType: 'gradient',
                overlayOpacity: 40,
                enableGlow: true,
              },
              layout: {
                alignment: 'center',
                containerWidth: 'contained',
                borderRadius: '2xl',
              },
            },
          });
        }

        if (contactRaw) {
          setContactSection({
            id: contactRaw.id,
            componentType: contactRaw.componentType,
            isActive: contactRaw.isActive,
            contentPayload: contactRaw.contentPayload as ContactPayload,
          });
        } else {
          setContactSection({
            id: 'local-contact',
            componentType: 'CONTACT',
            isActive: true,
            contentPayload: {
              eyebrow: 'DIRECT ENGAGEMENT',
              title: 'Initiate an Architectural Consultation',
              titleHighlight: 'Consultation',
              description:
                'Engage directly with our technical leadership. We evaluate system architecture, scale bottlenecks, and enterprise implementation scopes under strict non-disclosure terms.',
              contactInfo: {
                useGlobalDefaults: true,
              },
              supportCard: {
                enabled: false,
                title: 'Rapid Architecture Assessment',
                description:
                  'Qualifying enterprise projects receive a 45-minute technical roadmap briefing with our CTO office.',
                ctaLabel: 'Book Priority Session',
                ctaUrl: '#inquiry-form',
              },
              form: {
                formTitle: 'Direct Engineering Inquiry',
                formSubtitle: 'Connect with a principal architect within 24 business hours.',
                submitButtonText: 'Submit Inquiry',
                privacyNote: 'Protected by enterprise NDA standards. No solicitation.',
                successTitle: 'Inquiry Transmitted',
                successMessage:
                  'Thank you. Our engineering desk has received your briefing and will review specifications shortly.',
                fields: [
                  {
                    id: 'f-name',
                    name: 'fullName',
                    label: 'Full Name',
                    type: 'text',
                    placeholder: 'Dr. Evelyn Reed',
                    required: true,
                    width: 'full',
                  },
                  {
                    id: 'f-email',
                    name: 'email',
                    label: 'Work Email',
                    type: 'email',
                    placeholder: 'evelyn@enterprise.com',
                    required: true,
                    width: 'full',
                  },
                  {
                    id: 'f-company',
                    name: 'companyName',
                    label: 'Company Name',
                    type: 'text',
                    placeholder: 'Apex Cloud Systems',
                    required: false,
                    width: 'half',
                  },
                  {
                    id: 'f-phone',
                    name: 'phone',
                    label: 'Phone Number',
                    type: 'tel',
                    placeholder: '+1 (555) 019-2834',
                    required: false,
                    width: 'half',
                  },
                  {
                    id: 'f-service',
                    name: 'serviceInterest',
                    label: 'Area of Interest',
                    type: 'select',
                    placeholder: 'Select solution area...',
                    required: false,
                    options: [
                      'Cloud Architecture & Migration',
                      'AI & Data Engineering',
                      'Enterprise Application Modernization',
                      'Cybersecurity & Compliance',
                      'General Partnership Inquiry',
                    ],
                    width: 'full',
                  },
                  {
                    id: 'f-message',
                    name: 'message',
                    label: 'Project Details & Scope',
                    type: 'textarea',
                    placeholder:
                      'Briefly describe your systems architecture, requirements, and target timeline...',
                    required: true,
                    width: 'full',
                  },
                ],
              },
            },
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
  const portfolioPayload: PortfolioPayload = portfolioSection?.contentPayload ?? {};
  const deliveryProcessPayload: DeliveryProcessPayload = deliveryProcessSection?.contentPayload ?? {};
  const clientsPayload: ClientsPayload = clientsSection?.contentPayload ?? {};
  const clientTestimonialsPayload: ClientTestimonialsPayload = clientTestimonialsSection?.contentPayload ?? {};
  const partnersPayload: PartnersPayload = partnersSection?.contentPayload ?? {};
  const ctaPayload: CtaPayload = ctaSection?.contentPayload ?? {};
  const contactPayload: ContactPayload = contactSection?.contentPayload ?? {};

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
      } else if (activeTab === 'portfolio') {
        if (!portfolioPayload.title?.trim()) {
          notify.error('Validation: Portfolio section title cannot be empty.');
          setSaving(false);
          return;
        }
        if (portfolioSection && !portfolioSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${portfolioSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: portfolioSection.contentPayload,
              isActive: portfolioSection.isActive,
            }),
          });
        }
        notify.success('Portfolio display settings updated successfully.');
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
      } else if (activeTab === 'clients') {
        if (!clientsPayload.title?.trim()) {
          notify.error('Validation: Section title cannot be empty.');
          setSaving(false);
          return;
        }
        if (clientsSection && !clientsSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${clientsSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: clientsSection.contentPayload,
              isActive: clientsSection.isActive,
            }),
          });
        }
        notify.success('✓ Client section updated successfully.');
      } else if (activeTab === 'partners') {
        if (!partnersPayload.title?.trim()) {
          notify.error('Validation: Section title cannot be empty.');
          setSaving(false);
          return;
        }
        if (partnersSection && !partnersSection.id.startsWith('local-')) {
          await fetchApi(`/sections/${partnersSection.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              contentPayload: partnersSection.contentPayload,
              isActive: partnersSection.isActive,
            }),
          });
        }
        notify.success('✓ Partners section updated successfully.');
      } else if (activeTab === 'cta') {
        if (!ctaPayload.title?.trim()) {
          notify.error('Validation: CTA headline cannot be empty.');
          setSaving(false);
          return;
        }
        if (ctaSection) {
          if (!ctaSection.id.startsWith('local-')) {
            await fetchApi(`/sections/${ctaSection.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                contentPayload: ctaSection.contentPayload,
                isActive: ctaSection.isActive,
              }),
            });
          } else {
            const created = await fetchApi<{ id: string }>('/pages/home/sections', {
              method: 'POST',
              body: JSON.stringify({
                componentType: 'CTA',
                sectionIdentifier: 'homepage-cta',
                contentPayload: ctaSection.contentPayload,
                isActive: ctaSection.isActive,
                displayOrder: 10,
              }),
            });
            if (created?.id) {
              setCtaSection({ ...ctaSection, id: created.id });
            }
          }
        }
        notify.success('✓ Call to Action section updated successfully.');
      } else if (activeTab === 'contact') {
        if (!contactPayload.title?.trim()) {
          notify.error('Validation: Contact headline cannot be empty.');
          setSaving(false);
          return;
        }
        if (contactSection) {
          if (!contactSection.id.startsWith('local-')) {
            await fetchApi(`/sections/${contactSection.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                contentPayload: contactSection.contentPayload,
                isActive: contactSection.isActive,
              }),
            });
          } else {
            const created = await fetchApi<{ id: string }>('/pages/home/sections', {
              method: 'POST',
              body: JSON.stringify({
                componentType: 'CONTACT',
                sectionIdentifier: 'contact-inquiry',
                contentPayload: contactSection.contentPayload,
                isActive: contactSection.isActive,
                displayOrder: 11,
              }),
            });
            if (created?.id) {
              setContactSection({ ...contactSection, id: created.id });
            }
          }
        }
        notify.success('✓ Contact & Inquiry section updated successfully.');
      }
    } catch {
      if (activeTab === 'portfolio') {
        notify.error('Unable to update portfolio display settings.');
      } else if (activeTab === 'clients') {
        notify.error('Unable to update the client section.');
      } else if (activeTab === 'partners') {
        notify.error('Unable to update the partners section.');
      } else if (activeTab === 'cta') {
        notify.error('Unable to update the CTA section.');
      } else if (activeTab === 'contact') {
        notify.error('Unable to update the Contact section.');
      } else {
        notify.error('Unable to update the section settings.');
      }
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
                <TabsList className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 h-auto gap-1">
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
                    value="portfolio"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    5. Work
                  </TabsTrigger>
                  <TabsTrigger
                    value="deliveryProcess"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    6. Process
                  </TabsTrigger>
                  <TabsTrigger
                    value="clients"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    7. Clients
                  </TabsTrigger>
                  <TabsTrigger
                    value="clientTestimonials"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    8. Reviews
                  </TabsTrigger>
                  <TabsTrigger
                    value="partners"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    9. Partners
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    10. Contact
                  </TabsTrigger>
                  <TabsTrigger
                    value="cta"
                    className="rounded-xl py-2 px-1 text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all text-center"
                  >
                    11. CTA
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

                {/* 5. Portfolio Tab */}
                <TabsContent value="portfolio" className="focus-visible:outline-none">
                  {portfolioSection ? (
                    <PortfolioSettings
                      section={portfolioSection}
                      onChange={setPortfolioSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Portfolio section…' : 'Portfolio section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 6. Delivery Process Tab */}
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

                {/* 7. Clients Tab */}
                <TabsContent value="clients" className="focus-visible:outline-none">
                  {clientsSection ? (
                    <ClientsSettings
                      section={clientsSection}
                      onChange={setClientsSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Clients section…' : 'Clients section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 8. Client Testimonials Tab */}
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

                {/* 9. Partners Tab */}
                <TabsContent value="partners" className="focus-visible:outline-none">
                  {partnersSection ? (
                    <PartnersSettings
                      section={partnersSection}
                      onChange={setPartnersSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Partners section…' : 'Partners section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 10. CTA Tab */}
                <TabsContent value="cta" className="focus-visible:outline-none">
                  {ctaSection ? (
                    <CtaSettings
                      section={ctaSection}
                      onChange={setCtaSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading CTA section…' : 'CTA section not found in backend.'}
                    </div>
                  )}
                </TabsContent>

                {/* 11. Contact Tab */}
                <TabsContent value="contact" className="focus-visible:outline-none">
                  {contactSection ? (
                    <ContactSettings
                      section={contactSection}
                      onChange={setContactSection}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      {loading ? 'Loading Contact section…' : 'Contact section not found in backend.'}
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
                portfolioPayload={portfolioPayload}
                deliveryProcessPayload={deliveryProcessPayload}
                clientTestimonialsPayload={clientTestimonialsPayload}
                clientsPayload={clientsPayload}
                partnersPayload={partnersPayload}
                ctaPayload={ctaPayload}
                contactPayload={contactPayload}
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
