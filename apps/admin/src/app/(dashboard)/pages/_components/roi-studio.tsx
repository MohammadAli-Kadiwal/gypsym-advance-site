'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Calculator,
  ArrowUpRight,
  DollarSign,
  BarChart3,
  Globe,
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

export interface RoiStudioProps {
  onBack?: () => void;
}

interface CredentialItem {
  label: string;
  value: string;
  sub: string;
}

interface EmpiricalMetric {
  source: string;
  stat: string;
  desc: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const defaultCredentials: CredentialItem[] = [
  { label: 'CVR Improvement', value: '+24%', sub: 'Avg. per headless migration' },
  { label: 'Edge TTFB', value: '42ms', sub: 'Gypsym Next.js 15 P95' },
  { label: 'Annual Incremental Revenue', value: '$1.4M', sub: 'Per $100M GMV / 100ms' },
  { label: 'Currencies Supported', value: '6', sub: 'USD, EUR, GBP, INR, AED, AUD' },
];

const defaultMetrics: EmpiricalMetric[] = [
  {
    source: 'Deloitte Digital (2024)',
    stat: '+8.4% Retail CVR',
    desc: 'Average conversion rate increase across 37 flagship e-commerce brands for every 100ms mobile speed reduction.',
  },
  {
    source: 'Google Core Web Vitals',
    stat: '-44% Bounce Rate',
    desc: 'Sub-second Largest Contentful Paint (LCP) and 40ms TTFB slash checkout drop-off by nearly half.',
  },
  {
    source: 'Amazon Research',
    stat: '+$1.4M / 100ms',
    desc: 'Calculated impact per $100M GMV. Latency directly suppresses organic and paid ad return on ad spend (ROAS).',
  },
];

const defaultFaqs: FaqItem[] = [
  {
    q: 'Can we keep our existing Shopify Plus admin, products, and checkout?',
    a: 'Yes, 100%. Gypsym decouples only the customer-facing frontend. Your inventory, catalog, fulfillment, ERP integrations, discounts, and native Shopify 1-Page Checkout remain identical.',
  },
  {
    q: 'How does Gypsym achieve 42ms global server response (TTFB)?',
    a: 'We leverage Next.js 15 App Router, React Server Components (RSC), and edge caching across 310+ global Cloudflare/Vercel PoPs. HTML payloads are streamed from the nearest edge node rather than executing heavy Liquid server render cycles.',
  },
  {
    q: 'What is the implementation timeline for a headless migration?',
    a: 'Typical enterprise migrations complete in 8 to 12 weeks with zero customer downtime. We run parallel staging environments and execute DNS cutover with 99.99% Edge SLA protection.',
  },
  {
    q: 'Will all of our third-party Shopify apps continue to work?',
    a: 'Yes. We integrate critical marketing apps (Klaviyo, Yotpo, Gorgias, Recharge, Algolia, Triple Whale) via direct REST/GraphQL API connectors, eliminating client-side script bloat and third-party tag blocking.',
  },
  {
    q: 'Is INR supported in the calculator?',
    a: 'Yes! The ROI calculator now supports INR (₹ Indian Rupee) alongside USD, EUR, GBP, AED, and AUD. Revenue projections are shown in Crore (Cr) and Lakh (L) notation for large Indian market figures.',
  },
  {
    q: 'How accurate are the ROI projections?',
    a: 'The model is based on Deloitte Digital 2024 and Google Core Web Vitals research. Projections are conservative estimates capped between 14% and 36% CVR lift, using your actual GMV, CVR, AOV, and TTFB inputs.',
  },
];

export function RoiStudio({ onBack }: RoiStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);

  // ── Hero State ──
  const [heroId, setHeroId] = React.useState<string | null>(null);
  const [heroActive, setHeroActive] = React.useState(true);
  const [heroEyebrow, setHeroEyebrow] = React.useState('Interactive Financial Model · 2026 Edition');
  const [heroTitlePrefix, setHeroTitlePrefix] = React.useState('Calculate Your');
  const [heroHighlight, setHeroHighlight] = React.useState('Revenue Lift');
  const [heroDescription, setHeroDescription] = React.useState(
    "Drag the sliders to simulate how decoupling from slow Shopify Liquid monoliths to Gypsym's 42ms Next.js Edge accelerates your annual bottom line. Supports USD, EUR, GBP, INR, AED & AUD."
  );
  const [heroCredentials, setHeroCredentials] = React.useState<CredentialItem[]>(defaultCredentials);

  // ── Simulator / Calculator Settings State ──
  const [calcId, setCalcId] = React.useState<string | null>(null);
  const [calcActive, setCalcActive] = React.useState(true);
  const [calcEyebrow, setCalcEyebrow] = React.useState('Interactive CRO Simulator');
  const [calcTitle, setCalcTitle] = React.useState("Model Your Store's");
  const [calcHighlight, setCalcHighlight] = React.useState('Latency Dividend');
  const [calcSubtitle, setCalcSubtitle] = React.useState(
    'Configure your current metrics below to calculate empirical conversion expansion and annual top-line incremental gains.'
  );
  const [defaultGmv, setDefaultGmv] = React.useState(12000000);
  const [defaultCvr, setDefaultCvr] = React.useState(1.8);
  const [defaultAov, setDefaultAov] = React.useState(125);
  const [defaultTtfb, setDefaultTtfb] = React.useState(2.4);

  // ── Telemetry & Metrics State ──
  const [metricsId, setMetricsId] = React.useState<string | null>(null);
  const [metricsActive, setMetricsActive] = React.useState(true);
  const [metricsEyebrow, setMetricsEyebrow] = React.useState('Empirical Speed Telemetry');
  const [metricsTitle, setMetricsTitle] = React.useState('Backed by Global');
  const [metricsHighlight, setMetricsHighlight] = React.useState('E-Commerce Data');
  const [metricsDescription, setMetricsDescription] = React.useState(
    'Speed is not just an engineering metric — it is the highest-leverage conversion lever in enterprise digital commerce.'
  );
  const [metricsList, setMetricsList] = React.useState<EmpiricalMetric[]>(defaultMetrics);

  // ── FAQs State ──
  const [faqId, setFaqId] = React.useState<string | null>(null);
  const [faqActive, setFaqActive] = React.useState(true);
  const [faqEyebrow, setFaqEyebrow] = React.useState('Technical FAQ');
  const [faqTitle, setFaqTitle] = React.useState('Frequently Asked');
  const [faqHighlight, setFaqHighlight] = React.useState('Questions');
  const [faqDescription, setFaqDescription] = React.useState(
    'Everything you need to know about headless migration, speed ROI, and the Gypsym architecture.'
  );
  const [faqs, setFaqs] = React.useState<FaqItem[]>(defaultFaqs);

  // ── CTA State ──
  const [ctaId, setCtaId] = React.useState<string | null>(null);
  const [ctaActive, setCtaActive] = React.useState(true);
  const [ctaEyebrow, setCtaEyebrow] = React.useState('Enterprise Architectural Audit');
  const [ctaTitle, setCtaTitle] = React.useState("Ready to Unlock Your Store's Latency Dividend?");
  const [ctaDescription, setCtaDescription] = React.useState(
    'Book a confidential 30-minute discovery briefing with a Gypsym Senior Headless Architect. We will audit your current Liquid stack and present a customized speed roadmap.'
  );
  const [ctaButton1Label, setCtaButton1Label] = React.useState('Schedule Architecture Audit');
  const [ctaButton1Url, setCtaButton1Url] = React.useState('/book');
  const [ctaButton2Label, setCtaButton2Label] = React.useState('Explore Services');
  const [ctaButton2Url, setCtaButton2Url] = React.useState('/services');

  // ── SEO State ──
  const [metaTitle, setMetaTitle] = React.useState(
    'Headless Shopify ROI & Revenue Uplift Calculator | Gypsym Technology'
  );
  const [metaDescription, setMetaDescription] = React.useState(
    "Simulate your store's projected annual revenue increase by switching to Gypsym's 42ms Next.js 15 Headless Edge architecture. Proven CRO conversion lift model."
  );
  const [canonicalUrl, setCanonicalUrl] = React.useState('https://gypsym.com/roi-calculator');
  const [ogImageUrl, setOgImageUrl] = React.useState('/assets/editorial/agency-hero-editorial.png');
  const [noIndex, setNoIndex] = React.useState(false);

  // ── Helper state updaters ──
  const updateCredential = (idx: number, field: keyof CredentialItem, val: string) => {
    setHeroCredentials((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      if (item) copy[idx] = { ...item, [field]: val };
      return copy;
    });
  };

  const addCredential = () => {
    setHeroCredentials((prev) => [...prev, { label: 'New Metric', value: '100%', sub: 'Description' }]);
  };

  const removeCredential = (idx: number) => {
    setHeroCredentials((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateMetric = (idx: number, field: keyof EmpiricalMetric, val: string) => {
    setMetricsList((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      if (item) copy[idx] = { ...item, [field]: val };
      return copy;
    });
  };

  const addMetric = () => {
    setMetricsList((prev) => [...prev, { source: 'New Research Source', stat: '+10%', desc: 'Impact description' }]);
  };

  const removeMetric = (idx: number) => {
    setMetricsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFaq = (idx: number, field: keyof FaqItem, val: string) => {
    setFaqs((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      if (item) copy[idx] = { ...item, [field]: val };
      return copy;
    });
  };

  const addFaq = () => {
    setFaqs((prev) => [...prev, { q: 'New frequently asked question?', a: 'Answer text explaining the architecture.' }]);
  };

  const removeFaq = (idx: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Load Data ──
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchApi<PageData>('/pages/roi-calculator');
      if (page) {
        setPageData(page);

        // SEO
        const seo = page.seoMetadata;
        if (seo?.metaTitle) setMetaTitle(seo.metaTitle);
        if (seo?.metaDescription) setMetaDescription(seo.metaDescription);
        if (seo?.canonicalUrl) setCanonicalUrl(seo.canonicalUrl);
        if (seo?.ogImageUrl) setOgImageUrl(seo.ogImageUrl);
        setNoIndex(Boolean(seo?.noIndex));

        // Hero Section
        const rawHero = page.sections?.find(
          (s) => s.sectionIdentifier === 'roi-hero' || s.componentType === 'HERO'
        );
        if (rawHero) {
          setHeroId(rawHero.id);
          setHeroActive(rawHero.isActive);
          const p = (rawHero.contentPayload as any) || {};
          if (p.eyebrow) setHeroEyebrow(p.eyebrow);
          if (p.titlePrefix) setHeroTitlePrefix(p.titlePrefix);
          if (p.highlight) setHeroHighlight(p.highlight);
          if (p.description) setHeroDescription(p.description);
          if (Array.isArray(p.credentials) && p.credentials.length > 0) {
            setHeroCredentials(p.credentials);
          }
        }

        // Calculator Section
        const rawCalc = page.sections?.find(
          (s) => s.sectionIdentifier === 'roi-calculator' || s.componentType === 'REVENUE_CALCULATOR'
        );
        if (rawCalc) {
          setCalcId(rawCalc.id);
          setCalcActive(rawCalc.isActive);
          const p = (rawCalc.contentPayload as any) || {};
          if (p.eyebrow) setCalcEyebrow(p.eyebrow);
          if (p.title) setCalcTitle(p.title);
          if (p.highlight) setCalcHighlight(p.highlight);
          if (p.subtitle) setCalcSubtitle(p.subtitle);
          if (p.defaultGmv) setDefaultGmv(p.defaultGmv);
          if (p.defaultCvr) setDefaultCvr(p.defaultCvr);
          if (p.defaultAov) setDefaultAov(p.defaultAov);
          if (p.defaultTtfb) setDefaultTtfb(p.defaultTtfb);
        }

        // Telemetry Metrics Section
        const rawMetrics = page.sections?.find(
          (s) => s.sectionIdentifier === 'roi-metrics' || s.componentType === 'METRICS'
        );
        if (rawMetrics) {
          setMetricsId(rawMetrics.id);
          setMetricsActive(rawMetrics.isActive);
          const p = (rawMetrics.contentPayload as any) || {};
          if (p.eyebrow) setMetricsEyebrow(p.eyebrow);
          if (p.title) setMetricsTitle(p.title);
          if (p.highlight) setMetricsHighlight(p.highlight);
          if (p.description) setMetricsDescription(p.description);
          if (Array.isArray(p.metrics) && p.metrics.length > 0) {
            setMetricsList(p.metrics);
          }
        }

        // FAQ Section
        const rawFaq = page.sections?.find(
          (s) => s.sectionIdentifier === 'roi-faq' || s.componentType === 'FAQ'
        );
        if (rawFaq) {
          setFaqId(rawFaq.id);
          setFaqActive(rawFaq.isActive);
          const p = (rawFaq.contentPayload as any) || {};
          if (p.eyebrow) setFaqEyebrow(p.eyebrow);
          if (p.title) setFaqTitle(p.title);
          if (p.highlight) setFaqHighlight(p.highlight);
          if (p.description) setFaqDescription(p.description);
          if (Array.isArray(p.faqs) && p.faqs.length > 0) {
            setFaqs(p.faqs);
          }
        }

        // CTA Section
        const rawCta = page.sections?.find(
          (s) => s.sectionIdentifier === 'roi-cta' || s.componentType === 'CTA'
        );
        if (rawCta) {
          setCtaId(rawCta.id);
          setCtaActive(rawCta.isActive);
          const p = (rawCta.contentPayload as any) || {};
          if (p.eyebrow) setCtaEyebrow(p.eyebrow);
          if (p.title) setCtaTitle(p.title);
          if (p.description) setCtaDescription(p.description);
          if (p.button1Label) setCtaButton1Label(p.button1Label);
          if (p.button1Url) setCtaButton1Url(p.button1Url);
          if (p.button2Label) setCtaButton2Label(p.button2Label);
          if (p.button2Url) setCtaButton2Url(p.button2Url);
        }
      }
    } catch {
      notify.error('Could not load ROI Calculator page settings from database.');
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
      // 1. Update Page & SEO
      await fetchApi('/pages/roi-calculator', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'ROI Calculator',
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
        titlePrefix: heroTitlePrefix,
        highlight: heroHighlight,
        description: heroDescription,
        credentials: heroCredentials,
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
        const created = await fetchApi<any>('/pages/roi-calculator/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'roi-hero',
            componentType: 'HERO',
            displayOrder: 1,
            contentPayload: heroPayload,
            isActive: heroActive,
          }),
        });
        if (created?.id) setHeroId(created.id);
      }

      // 3. Save Calculator Section
      const calcPayload = {
        eyebrow: calcEyebrow,
        title: calcTitle,
        highlight: calcHighlight,
        subtitle: calcSubtitle,
        defaultGmv,
        defaultCvr,
        defaultAov,
        defaultTtfb,
      };

      if (calcId && !calcId.startsWith('local-')) {
        await fetchApi(`/sections/${calcId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: calcPayload,
            isActive: calcActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/roi-calculator/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'roi-calculator',
            componentType: 'REVENUE_CALCULATOR',
            displayOrder: 2,
            contentPayload: calcPayload,
            isActive: calcActive,
          }),
        });
        if (created?.id) setCalcId(created.id);
      }

      // 4. Save Telemetry Metrics Section
      const metricsPayload = {
        eyebrow: metricsEyebrow,
        title: metricsTitle,
        highlight: metricsHighlight,
        description: metricsDescription,
        metrics: metricsList,
      };

      if (metricsId && !metricsId.startsWith('local-')) {
        await fetchApi(`/sections/${metricsId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: metricsPayload,
            isActive: metricsActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/roi-calculator/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'roi-metrics',
            componentType: 'METRICS',
            displayOrder: 3,
            contentPayload: metricsPayload,
            isActive: metricsActive,
          }),
        });
        if (created?.id) setMetricsId(created.id);
      }

      // 5. Save FAQ Section
      const faqPayload = {
        eyebrow: faqEyebrow,
        title: faqTitle,
        highlight: faqHighlight,
        description: faqDescription,
        faqs,
      };

      if (faqId && !faqId.startsWith('local-')) {
        await fetchApi(`/sections/${faqId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: faqPayload,
            isActive: faqActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/roi-calculator/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'roi-faq',
            componentType: 'FAQ',
            displayOrder: 4,
            contentPayload: faqPayload,
            isActive: faqActive,
          }),
        });
        if (created?.id) setFaqId(created.id);
      }

      // 6. Save CTA Section
      const ctaPayload = {
        eyebrow: ctaEyebrow,
        title: ctaTitle,
        description: ctaDescription,
        button1Label: ctaButton1Label,
        button1Url: ctaButton1Url,
        button2Label: ctaButton2Label,
        button2Url: ctaButton2Url,
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
        const created = await fetchApi<any>('/pages/roi-calculator/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'roi-cta',
            componentType: 'CTA',
            displayOrder: 5,
            contentPayload: ctaPayload,
            isActive: ctaActive,
          }),
        });
        if (created?.id) setCtaId(created.id);
      }

      notify.success('All ROI Calculator page sections saved successfully.');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save ROI Calculator sections.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: 'PUBLISHED' | 'DRAFT') => {
    try {
      await fetchApi('/pages/roi-calculator', {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setPageData((prev) => (prev ? { ...prev, status: newStatus } : null));
      notify.success(`ROI Calculator page status updated to ${newStatus === 'PUBLISHED' ? 'Public' : 'Draft'}.`);
    } catch {
      notify.error('Failed to update page status.');
    }
  };

  return (
    <div className="space-y-6 w-full">
      <SectionsHeader
        pageTitle="ROI Calculator"
        pageRoute="/roi-calculator"
        layoutLabel="CRO SIMULATOR"
        sectionCount={5}
        status={pageData?.status || 'PUBLISHED'}
        onStatusChange={handleStatusChange}
        saving={saving}
        loading={loading}
        onBack={onBack || (() => {})}
        onSave={handleSave}
        onRefresh={loadData}
      />

      {/* Info Callout Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-100 bg-blue-50/70 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">Multi-Currency CRO Financial Simulator</h4>
            <p className="text-[11px] text-blue-800/80 mt-0.5">
              Supports 6 currencies including INR (₹ Indian Rupee with Cr/Lakh notation), USD, EUR, GBP, AED & AUD.
            </p>
          </div>
        </div>
        <Link href="/roi-calculator" target="_blank">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-blue-200 text-blue-700 bg-white hover:bg-blue-50 h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
          >
            Open Live Calculator
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
            1. Hero & Badges
          </TabsTrigger>
          <TabsTrigger
            value="simulator"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Calculator Defaults
          </TabsTrigger>
          <TabsTrigger
            value="metrics"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            3. Research Telemetry
          </TabsTrigger>
          <TabsTrigger
            value="faq"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            4. FAQ ({faqs.length})
          </TabsTrigger>
          <TabsTrigger
            value="cta"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            5. Audit CTA
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            6. SEO & Metadata
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: HERO ── */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Hero Section</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Subpage hero header, headline typography, and high-impact proof telemetry chips.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Active</span>
                <Switch checked={heroActive} onCheckedChange={setHeroActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Hero Eyebrow / Tagline</Label>
                  <Input
                    value={heroEyebrow}
                    onChange={(e) => setHeroEyebrow(e.target.value)}
                    placeholder="Interactive Financial Model · 2026 Edition"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Title Prefix</Label>
                    <Input
                      value={heroTitlePrefix}
                      onChange={(e) => setHeroTitlePrefix(e.target.value)}
                      placeholder="Calculate Your"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Title Highlight (Italic/Gradient Accent)</Label>
                    <Input
                      value={heroHighlight}
                      onChange={(e) => setHeroHighlight(e.target.value)}
                      placeholder="Revenue Lift"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label>Hero Description</Label>
                  <Textarea
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    rows={3}
                    placeholder="Enter value proposition paragraph..."
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Hero Proof Credentials */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Hero Credentials / Stat Chips</h4>
                    <p className="text-xs text-slate-500">Displayed in the hero strip banner below the action buttons.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCredential}
                    className="rounded-xl text-xs gap-1.5 h-8 border-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Stat
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {heroCredentials.map((cred, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeCredential(idx)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div>
                        <Label>Label</Label>
                        <Input
                          value={cred.label}
                          onChange={(e) => updateCredential(idx, 'label', e.target.value)}
                          placeholder="e.g. CVR Improvement"
                          className="bg-white rounded-lg h-8 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Value</Label>
                          <Input
                            value={cred.value}
                            onChange={(e) => updateCredential(idx, 'value', e.target.value)}
                            placeholder="e.g. +24%"
                            className="bg-white rounded-lg h-8 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <Label>Subtext</Label>
                          <Input
                            value={cred.sub}
                            onChange={(e) => updateCredential(idx, 'sub', e.target.value)}
                            placeholder="e.g. Avg. per migration"
                            className="bg-white rounded-lg h-8 text-xs"
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

        {/* ── TAB 2: CALCULATOR DEFAULTS ── */}
        <TabsContent value="simulator" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Simulator Section & Defaults</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Section heading and initial default values loaded into the live revenue model.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Active</span>
                <Switch checked={calcActive} onCheckedChange={setCalcActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Section Eyebrow</Label>
                  <Input
                    value={calcEyebrow}
                    onChange={(e) => setCalcEyebrow(e.target.value)}
                    placeholder="Interactive CRO Simulator"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={calcTitle}
                    onChange={(e) => setCalcTitle(e.target.value)}
                    placeholder="Model Your Store's"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Title Highlight</Label>
                  <Input
                    value={calcHighlight}
                    onChange={(e) => setCalcHighlight(e.target.value)}
                    placeholder="Latency Dividend"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label>Section Subtitle</Label>
                <Input
                  value={calcSubtitle}
                  onChange={(e) => setCalcSubtitle(e.target.value)}
                  placeholder="Configure your current metrics below..."
                  className="rounded-xl"
                />
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Simulator Model Default Seed Values</span>
                </h4>
                <p className="text-xs text-slate-500">
                  These initial inputs populate the sliders when enterprise merchants first load the page.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      Default Annual GMV ($)
                    </Label>
                    <Input
                      type="number"
                      value={defaultGmv}
                      onChange={(e) => setDefaultGmv(Number(e.target.value))}
                      className="bg-white rounded-lg font-mono font-bold text-sm"
                    />
                    <span className="text-[10px] text-slate-400">e.g. 12,000,000 ($12M)</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <Label>Default CVR (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={defaultCvr}
                      onChange={(e) => setDefaultCvr(Number(e.target.value))}
                      className="bg-white rounded-lg font-mono font-bold text-sm"
                    />
                    <span className="text-[10px] text-slate-400">e.g. 1.80% (Benchmark)</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <Label>Default AOV ($)</Label>
                    <Input
                      type="number"
                      value={defaultAov}
                      onChange={(e) => setDefaultAov(Number(e.target.value))}
                      className="bg-white rounded-lg font-mono font-bold text-sm"
                    />
                    <span className="text-[10px] text-slate-400">e.g. $125 Average Order Value</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <Label>Current TTFB (seconds)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={defaultTtfb}
                      onChange={(e) => setDefaultTtfb(Number(e.target.value))}
                      className="bg-white rounded-lg font-mono font-bold text-sm"
                    />
                    <span className="text-[10px] text-slate-400">e.g. 2.4s (Liquid Monolith)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold">Active Currency Multipliers:</span> USD ($1.00), EUR (€0.92), GBP (£0.79), INR (₹83.50 with Cr/Lakh formatting), AED (3.67), and AUD (A$1.52). All conversions and regional numeral representations update seamlessly in real time.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: TELEMETRY RESEARCH ── */}
        <TabsContent value="metrics" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Research & Telemetry Benchmarks</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Empirical data citations from Deloitte Digital, Google Core Web Vitals, and Amazon Research.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Active</span>
                <Switch checked={metricsActive} onCheckedChange={setMetricsActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Section Eyebrow</Label>
                  <Input
                    value={metricsEyebrow}
                    onChange={(e) => setMetricsEyebrow(e.target.value)}
                    placeholder="Empirical Speed Telemetry"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={metricsTitle}
                    onChange={(e) => setMetricsTitle(e.target.value)}
                    placeholder="Backed by Global"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Title Highlight</Label>
                  <Input
                    value={metricsHighlight}
                    onChange={(e) => setMetricsHighlight(e.target.value)}
                    placeholder="E-Commerce Data"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label>Section Description</Label>
                <Textarea
                  value={metricsDescription}
                  onChange={(e) => setMetricsDescription(e.target.value)}
                  rows={2}
                  className="rounded-xl"
                />
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Benchmark Metric Cards</h4>
                    <p className="text-xs text-slate-500">Add, edit, or remove statistical cards displayed in the 3-column grid.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMetric}
                    className="rounded-xl text-xs gap-1.5 h-8 border-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Metric Card
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {metricsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeMetric(idx)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div>
                        <Label>Research Source / Organization</Label>
                        <Input
                          value={item.source}
                          onChange={(e) => updateMetric(idx, 'source', e.target.value)}
                          placeholder="e.g. Deloitte Digital (2024)"
                          className="bg-white rounded-lg h-8 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <Label>Key Stat / Metric</Label>
                        <Input
                          value={item.stat}
                          onChange={(e) => updateMetric(idx, 'stat', e.target.value)}
                          placeholder="e.g. +8.4% Retail CVR"
                          className="bg-white rounded-lg h-8 text-xs font-mono font-extrabold text-blue-700"
                        />
                      </div>

                      <div>
                        <Label>Explanation / Details</Label>
                        <Textarea
                          value={item.desc}
                          onChange={(e) => updateMetric(idx, 'desc', e.target.value)}
                          rows={3}
                          placeholder="Details of empirical study..."
                          className="bg-white rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: FAQ ── */}
        <TabsContent value="faq" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Technical FAQ</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Frequently asked questions covering Shopify Plus checkout, headless latency, apps, and INR currency support.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Active</span>
                <Switch checked={faqActive} onCheckedChange={setFaqActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Section Eyebrow</Label>
                  <Input
                    value={faqEyebrow}
                    onChange={(e) => setFaqEyebrow(e.target.value)}
                    placeholder="Technical FAQ"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={faqTitle}
                    onChange={(e) => setFaqTitle(e.target.value)}
                    placeholder="Frequently Asked"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>Title Highlight</Label>
                  <Input
                    value={faqHighlight}
                    onChange={(e) => setFaqHighlight(e.target.value)}
                    placeholder="Questions"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label>Section Description</Label>
                <Input
                  value={faqDescription}
                  onChange={(e) => setFaqDescription(e.target.value)}
                  placeholder="Everything you need to know about headless migration..."
                  className="rounded-xl"
                />
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Q&A Items ({faqs.length})</h4>
                    <p className="text-xs text-slate-500">Rendered in a balanced 2-column responsive layout.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFaq}
                    className="rounded-xl text-xs gap-1.5 h-8 border-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add FAQ
                  </Button>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 pr-8">
                          <Label>Question</Label>
                          <Input
                            value={faq.q}
                            onChange={(e) => updateFaq(idx, 'q', e.target.value)}
                            placeholder="e.g. Can we keep our Shopify Plus admin?"
                            className="bg-white rounded-lg font-semibold text-xs h-9"
                          />
                        </div>
                      </div>

                      <div className="pl-8">
                        <Label>Answer</Label>
                        <Textarea
                          value={faq.a}
                          onChange={(e) => updateFaq(idx, 'a', e.target.value)}
                          rows={2}
                          placeholder="Comprehensive architectural answer..."
                          className="bg-white rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: AUDIT CTA ── */}
        <TabsContent value="cta" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Conversion CTA Section</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  High-converting enterprise discovery audit callout card at the bottom of the page.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Active</span>
                <Switch checked={ctaActive} onCheckedChange={setCtaActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Eyebrow</Label>
                  <Input
                    value={ctaEyebrow}
                    onChange={(e) => setCtaEyebrow(e.target.value)}
                    placeholder="Enterprise Architectural Audit"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>CTA Main Headline</Label>
                  <Input
                    value={ctaTitle}
                    onChange={(e) => setCtaTitle(e.target.value)}
                    placeholder="Ready to Unlock Your Store's Latency Dividend?"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label>CTA Description</Label>
                <Textarea
                  value={ctaDescription}
                  onChange={(e) => setCtaDescription(e.target.value)}
                  rows={3}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Primary Button (White Pill)</h4>
                  <div>
                    <Label>Button Label</Label>
                    <Input
                      value={ctaButton1Label}
                      onChange={(e) => setCtaButton1Label(e.target.value)}
                      placeholder="Schedule Architecture Audit"
                      className="bg-white rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label>Destination URL</Label>
                    <Input
                      value={ctaButton1Url}
                      onChange={(e) => setCtaButton1Url(e.target.value)}
                      placeholder="/book"
                      className="bg-white rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Secondary Button (Glass Pill)</h4>
                  <div>
                    <Label>Button Label</Label>
                    <Input
                      value={ctaButton2Label}
                      onChange={(e) => setCtaButton2Label(e.target.value)}
                      placeholder="Explore Services"
                      className="bg-white rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label>Destination URL</Label>
                    <Input
                      value={ctaButton2Url}
                      onChange={(e) => setCtaButton2Url(e.target.value)}
                      placeholder="/services"
                      className="bg-white rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 6: SEO ── */}
        <TabsContent value="seo" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">SEO & OpenGraph Metadata</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Search engine indexing, meta descriptions, canonical URLs, and social sharing artwork.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Page Title Tag (Meta Title)</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Headless Shopify ROI & Revenue Uplift Calculator | Gypsym Technology"
                    className="rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {metaTitle.length} characters (optimal 50-65)
                  </span>
                </div>

                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="Simulate your store's projected annual revenue increase..."
                    className="rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {metaDescription.length} characters (optimal 130-160)
                  </span>
                </div>

                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://gypsym.com/roi-calculator"
                    className="rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <Label>Social Share Image (OpenGraph / Twitter Card)</Label>
                  <ImageUploadField
                    value={ogImageUrl}
                    onChange={setOgImageUrl}
                    placeholder="Upload high-res 1200x630 social share preview"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Search Engine Indexing (Robots)</h4>
                    <p className="text-[11px] text-slate-500">
                      Enable &quot;No Index&quot; to prevent search engines from crawling or caching this page.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">No Index</span>
                    <Switch checked={noIndex} onCheckedChange={setNoIndex} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
