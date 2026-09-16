import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check, X, Sparkles } from 'lucide-react';
import { getServices, getPageBySlug } from '@/lib/api';
import { ServicesFilterGrid } from '@/components/services/services-filter-grid';
import { CtaSection } from '@/components/cms/cta-section';
import { SubpageHero, CredentialItem } from '@/components/ui/subpage-hero';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal } from '@/components/motion';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('services');
  const seo = page?.seoMetadata;

  return {
    title: seo?.metaTitle || 'Our Services | Shopify Plus & E-commerce Agency | Gypsym Technology',
    description:
      seo?.metaDescription ||
      'Explore our 7 core Shopify services: E-commerce Solutions, Web Design & Development, Technical SEO, Website Maintenance, Theme Customization, Store Optimization, and Turnkey Store Setup.',
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || 'Our Services | Gypsym Technology',
      description:
        seo?.ogDescription ||
        seo?.metaDescription ||
        'Engineering high-growth Shopify Plus storefronts, custom themes, sub-second speed optimization, and 24/7 proactive maintenance retainers.',
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : [{ url: '/assets/editorial/agency-hero-editorial.png' }],
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

const CREDENTIALS: CredentialItem[] = [
  { label: 'Shopify Stores Built', value: '120+', sub: 'Enterprise D2C brands' },
  { label: 'Cost Advantage', value: '40–60%', sub: 'Less than US/UK agencies' },
  { label: 'Mobile Page Speed', value: '< 0.8s', sub: 'Core Web Vitals SLA' },
  { label: 'Dedicated Specialists', value: '25+', sub: 'Liquid, CRO & Theme leads' },
];

const COMPARISON_POINTS = [
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

export default async function ServicesPage() {
  const [services, homePage, servicesPage] = await Promise.all([
    getServices(),
    getPageBySlug('home'),
    getPageBySlug('services'),
  ]);

  const rawSection = servicesPage?.sections?.find(
    (s: any) =>
      s.componentType === 'SERVICES' ||
      s.sectionIdentifier === 'services-hero' ||
      s.sectionIdentifier === 'services'
  );
  const cmsPayload = (rawSection?.contentPayload as Record<string, any>) || {};

  const rawCapabilities = servicesPage?.sections?.find(
    (s: any) =>
      s.componentType === 'CAPABILITIES' ||
      s.sectionIdentifier === 'services-grid' ||
      s.sectionIdentifier === 'services-capabilities'
  );
  const capabilitiesPayload = (rawCapabilities?.contentPayload as Record<string, any>) || {};

  const rawAdvantage = servicesPage?.sections?.find(
    (s: any) =>
      s.componentType === 'FEATURE_GRID' ||
      s.sectionIdentifier === 'services-advantage' ||
      s.sectionIdentifier === 'gypsym-advantage'
  );
  const advantagePayload = (rawAdvantage?.contentPayload as Record<string, any>) || {};

  const heroBackgroundImage =
    cmsPayload.heroBackgroundImage ||
    cmsPayload.backgroundImageUrl ||
    '/assets/editorial/agency-hero-editorial.png';

  const rawCtaSection =
    servicesPage?.sections?.find(
      (s: any) => s.componentType === 'CTA' || s.sectionIdentifier === 'services-cta'
    ) ||
    homePage?.sections?.find(
      (s: any) => s.componentType === 'CTA' || s.sectionIdentifier === 'homepage-cta'
    );

  const ctaSectionToRender: PageSectionDto = rawCtaSection || {
    id: 'services-cta-section',
    pageId: 'services',
    sectionIdentifier: 'services-cta',
    componentType: 'CTA',
    displayOrder: 99,
    isActive: true,
    contentPayload: {
      eyebrow: 'GET IN TOUCH',
      title: 'Ready to Accelerate Your Shopify Revenue?',
      titleHighlight: 'Revenue',
      description:
        'Schedule a 30-minute discovery consultation with our senior e-commerce architects to discuss your storefront goals, technical scope, and migration roadmap.',
      primaryButton: {
        label: 'Schedule Strategy Call',
        url: '/book',
        variant: 'primary',
      },
    },
  };

  const activeComparisonPoints =
    Array.isArray(advantagePayload?.comparisonPoints) && advantagePayload.comparisonPoints.length > 0
      ? advantagePayload.comparisonPoints
      : COMPARISON_POINTS;

  return (
    <div className="w-full bg-[#f4f3ef] min-h-screen">
      {/* ── 1. Unified Subpage Hero Component ── */}
      <SubpageHero
        ariaLabel="Services Hero"
        backgroundImageUrl={heroBackgroundImage}
        imageAlt="Gypsym Technology E-commerce Architecture"
        eyebrow={cmsPayload.eyebrow || 'Specialized Shopify & D2C Capabilities'}
        eyebrowBulletColor="bg-emerald-400"
        titlePrefix={cmsPayload.titlePrefix || 'Engineering High-Growth Shopify Stores That'}
        titleHighlight={cmsPayload.titleHighlight || 'Convert'}
        description={
          cmsPayload.description ||
          'From bespoke Shopify Plus builds to sub-second speed optimization and ongoing 24/7 engineering retainers — we help ambitious brands outpace competition at 40–60% less cost than traditional US/UK agencies.'
        }
        credentials={
          Array.isArray(cmsPayload.credentials) && cmsPayload.credentials.length > 0
            ? cmsPayload.credentials
            : CREDENTIALS
        }
        showHeroStrip={cmsPayload.showHeroStrip !== undefined ? cmsPayload.showHeroStrip : true}
        actions={
          <>
            <Link
              href={cmsPayload.primaryCta?.url || '/book'}
              className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
            >
              <span>{cmsPayload.primaryCta?.label || 'Schedule Strategy Call'}</span>
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href={cmsPayload.secondaryCta?.url || '/contact'}
              className="inline-flex items-center px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all"
            >
              <span>{cmsPayload.secondaryCta?.label || 'Inquire About a Project'}</span>
            </Link>
          </>
        }
      />

      {/* ── 2. All Official Services Grid ── */}
      <section className="w-full py-8 sm:py-10 md:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>{capabilitiesPayload?.eyebrow || 'FULL-SPECTRUM CAPABILITIES'}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                {capabilitiesPayload?.title ? (
                  renderTitleWithHighlight(
                    capabilitiesPayload.title,
                    capabilitiesPayload.titleHighlight || 'Shopify'
                  )
                ) : (
                  <>
                    Everything Your Brand Needs to Scale on{' '}
                    <span className="font-serif italic font-normal text-neutral-900 dark:text-neutral-100">
                      Shopify
                    </span>
                  </>
                )}
              </h2>

              <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-1">
                {capabilitiesPayload?.description ||
                  'Explore our core e-commerce services tailored for ambitious founders, marketing leaders, and enterprise operations.'}
              </p>
            </div>
          </ScrollReveal>

          <ServicesFilterGrid services={services} />
        </div>
      </section>

      {/* ── 3. Why Brands Choose Gypsym (Comparison Matrix) ── */}
      <section className="w-full py-8 sm:py-10 md:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>{advantagePayload?.eyebrow || 'THE GYPSYM ADVANTAGE'}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                {advantagePayload?.title ? (
                  renderTitleWithHighlight(
                    advantagePayload.title,
                    advantagePayload.titleHighlight || 'Gypsym'
                  )
                ) : (
                  <>
                    Why High-Growth Brands Partner With{' '}
                    <span className="font-serif italic font-normal text-neutral-900 dark:text-neutral-100">
                      Gypsym
                    </span>
                  </>
                )}
              </h2>

              <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-1">
                {advantagePayload?.description ||
                  'How we compare against traditional agency retainers and unpredictable freelance marketplaces.'}
              </p>
            </div>
          </ScrollReveal>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-card shadow-xs">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  <th className="py-4 px-5 sm:px-6 w-[28%]">Key Criteria</th>
                  <th className="py-4 px-5 sm:px-6 w-[36%] bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-bold border-x border-emerald-100/80 dark:border-emerald-900/40">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Gypsym Technology</span>
                    </div>
                  </th>
                  <th className="py-4 px-5 sm:px-6 w-[18%]">Traditional US/UK Agency</th>
                  <th className="py-4 px-5 sm:px-6 w-[18%]">Freelance Platforms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs sm:text-sm">
                {activeComparisonPoints.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-5 sm:px-6 font-semibold text-neutral-900 dark:text-white">
                      {pt.feature}
                    </td>
                    <td className="py-4 px-5 sm:px-6 bg-emerald-50/30 dark:bg-emerald-950/10 font-medium text-emerald-950 dark:text-emerald-200 border-x border-emerald-100/60 dark:border-emerald-900/30">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt.gypsym}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 mt-0.5" />
                        <span>{pt.traditional}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 mt-0.5" />
                        <span>{pt.freelance}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. Global Conversion CTA Section ── */}
      <section id="services-cta" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <CtaSection section={ctaSectionToRender} />
        </ScrollReveal>
      </section>
    </div>
  );
}
