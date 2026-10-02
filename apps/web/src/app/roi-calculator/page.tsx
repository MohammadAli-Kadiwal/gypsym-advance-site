import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { RevenueUpliftCalculator } from '@/components/calculator/revenue-calculator';
import { SubpageHero, CredentialItem } from '@/components/ui/subpage-hero';
import { ScrollReveal } from '@/components/motion';
import { JsonLd, buildBreadcrumbsSchema, buildFaqSchema, buildWebPageSchema } from '@/components/seo/json-ld';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Headless Shopify ROI & Revenue Uplift Calculator | Gypsym Technology',
    description:
      'Simulate your store\'s projected annual revenue increase by switching to Gypsym\'s 42ms Next.js 15 Headless Edge architecture. Proven CRO conversion lift model.',
    openGraph: {
      title: 'Headless Shopify ROI & Revenue Uplift Calculator | Gypsym Technology',
      description:
        'Calculate projected annual revenue lift and conversion expansion from sub-50ms TTFB Next.js headless storefronts.',
      images: [{ url: '/assets/editorial/agency-hero-editorial.png' }],
    },
  };
}

const HERO_CREDENTIALS: CredentialItem[] = [
  { label: 'CVR Improvement', value: '+24%', sub: 'Avg. per headless migration' },
  { label: 'Edge TTFB', value: '42ms', sub: 'Gypsym Next.js 15 P95' },
  { label: 'Annual Incremental Revenue', value: '$1.4M', sub: 'Per $100M GMV / 100ms' },
  { label: 'Currencies Supported', value: '6', sub: 'USD, EUR, GBP, INR, AED, AUD' },
];

const EMPIRICAL_METRICS = [
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

const FAQS = [
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

export default function RoiCalculatorPage() {
  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', item: '/' },
    { name: 'ROI Calculator', item: '/roi-calculator' },
  ]);

  const webPageSchema = buildWebPageSchema({
    name: 'Headless Shopify ROI & Revenue Uplift Calculator',
    description: 'Simulate your store\'s projected annual revenue increase by switching to Gypsym\'s 42ms Next.js 15 Headless Edge architecture.',
    url: `${getSiteUrl()}/roi-calculator`,
  });

  const faqSchema = buildFaqSchema(
    FAQS.map((f) => ({
      question: f.q,
      answer: f.a,
    }))
  );

  return (
    // bg-[#f4f3ef] matches the SubpageHero outer wrapper exactly — one seamless background
    <div className="w-full bg-[#f4f3ef]">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* ── 1. SubpageHero — same outer bg-[#f4f3ef] flows from here ─── */}
      <SubpageHero
        ariaLabel="ROI Calculator Hero"
        backgroundImageUrl="/assets/editorial/agency-hero-editorial.png"
        imageAlt="Gypsym Headless ROI Revenue Calculator"
        eyebrow="Interactive Financial Model · 2026 Edition"
        eyebrowBulletColor="bg-primary"
        titlePrefix="Calculate Your"
        titleHighlight="Revenue Lift"
        description="Drag the sliders to simulate how decoupling from slow Shopify Liquid monoliths to Gypsym's 42ms Next.js Edge accelerates your annual bottom line. Supports USD, EUR, GBP, INR, AED & AUD."
        credentials={HERO_CREDENTIALS}
        showHeroStrip={true}
        actions={
          <>
            <Link
              href="#calculator"
              className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
            >
              <span>Open Calculator</span>
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all"
            >
              <span>Book Architecture Audit</span>
            </Link>
          </>
        }
      />

      {/* ── 2. Interactive Calculator Section ──────────────────────────
          Same pattern as what-we-change-section: py-8 sm:py-10 md:py-12
          inner max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8            */}
      <section id="calculator" className="w-full py-8 sm:py-10 md:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>Interactive CRO Simulator</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12]">
                Model Your Store&apos;s{' '}
                <span className="font-serif italic font-normal text-[1.12em] tracking-normal inline-block px-1">
                  Latency Dividend
                </span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto pt-1">
                Configure your current metrics below to calculate empirical conversion expansion and annual top-line incremental gains.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            {/* Calculator card on bg-white for contrast against #f4f3ef page bg */}
            <div className="bg-white rounded-[22px] sm:rounded-[30px] border border-neutral-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6 sm:p-10 md:p-12">
              <RevenueUpliftCalculator />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3. Empirical Telemetry Research Benchmarks ──────────────── */}
      <section className="w-full py-8 sm:py-10 md:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>Empirical Speed Telemetry</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12]">
                Backed by Global{' '}
                <span className="font-serif italic font-normal text-[1.12em] tracking-normal inline-block px-1">
                  E-Commerce Data
                </span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto pt-1">
                Speed is not just an engineering metric — it is the highest-leverage conversion lever in enterprise digital commerce.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {EMPIRICAL_METRICS.map((item, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.08}>
                <div className="bg-white rounded-[22px] sm:rounded-[30px] p-5 sm:p-7 border border-neutral-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow duration-200 h-full space-y-3">
                  <span className="text-xs font-mono font-semibold text-neutral-500 block uppercase tracking-wider">
                    {item.source}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-mono block">
                    {item.stat}
                  </span>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FAQ Section ───────────────────────────────────────────── */}
      <section className="w-full py-8 sm:py-10 md:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>Technical FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12]">
                Frequently Asked{' '}
                <span className="font-serif italic font-normal text-[1.12em] tracking-normal inline-block px-1">
                  Questions
                </span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                Everything you need to know about headless migration, speed ROI, and the Gypsym architecture.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            {FAQS.map((faq, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.06}>
                <div className="bg-white rounded-[22px] sm:rounded-[30px] p-5 sm:p-7 border border-neutral-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-2.5 text-left hover:shadow-md transition-shadow duration-200 h-full">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#d9287c] shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Conversion Bottom CTA ─────────────────────────────────── */}
      <section className="w-full py-8 sm:py-10 md:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="relative rounded-[22px] sm:rounded-[30px] overflow-hidden bg-neutral-900 px-6 sm:px-12 md:px-16 py-12 sm:py-16 text-center">
              {/* Ambient glow matching site CTA style */}
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#d9287c]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#d9287c]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise Architectural Audit</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-[54px] font-bold tracking-tight text-white leading-[1.15]">
                  Ready to Unlock Your Store&apos;s{' '}
                  <span className="font-serif italic font-normal">Latency Dividend?</span>
                </h2>

                <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
                  Book a confidential 30-minute discovery briefing with a Gypsym Senior Headless Architect. We will audit your current Liquid stack and present a customized speed roadmap.
                </p>

                <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-sm shadow-sm transition-all group hover:scale-105"
                  >
                    <span>Schedule Architecture Audit</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-semibold text-sm transition-all"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Explore Services</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}