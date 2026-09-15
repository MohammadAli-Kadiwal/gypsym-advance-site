import * as React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getPageBySlug, getPortfolioCategories, getPortfolioProjects } from '@/lib/api';
import { PortfolioSection, PortfolioCategoryFilterItem } from '@/components/cms/portfolio-section';
import { ContactSection } from '@/components/cms/contact-section';
import { CtaSection } from '@/components/cms/cta-section';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal, AnimatedCounter } from '@/components/motion';

export const dynamic = 'force-dynamic';

interface PortfolioPageProps {
  searchParams: {
    category?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('portfolio');
  const seo = page?.seoMetadata;

  return {
    title: seo?.metaTitle || 'Portfolio & Shopify Case Studies | Gypsym Technology',
    description:
      seo?.metaDescription ||
      'Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built by Gypsym Technology.',
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || 'Portfolio | Gypsym Technology',
      description:
        seo?.ogDescription ||
        seo?.metaDescription ||
        'Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built by Gypsym Technology.',
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const selectedCategory = (searchParams?.category || 'all').toLowerCase();

  // Concurrently fetch CMS page settings, home page sections, categories, and live portfolio projects
  const [page, homePage, categories, projects] = await Promise.all([
    getPageBySlug('portfolio'),
    getPageBySlug('home'),
    getPortfolioCategories(),
    getPortfolioProjects(selectedCategory),
  ]);

  // Extract CMS section payload if customized
  const rawSection = page?.sections?.find(
    (s: any) =>
      s.sectionIdentifier === 'portfolio-showcase' ||
      s.sectionIdentifier === 'our-work-portfolio' ||
      s.sectionIdentifier === 'portfolio' ||
      s.componentType === 'PORTFOLIO' ||
      s.componentType === 'OUR_WORK' ||
      s.componentType === 'FEATURE_GRID',
  );

  const cmsPayload = (rawSection?.contentPayload as Record<string, any>) || {};

  // Extract Homepage DIRECT ENGAGEMENT (Contact) and CTA sections
  const rawContactSection = homePage?.sections?.find(
    (s: any) =>
      s.componentType === 'CONTACT' ||
      s.sectionIdentifier === 'contact-inquiry' ||
      s.sectionIdentifier === 'contact',
  );

  const rawCtaSection = homePage?.sections?.find(
    (s: any) =>
      s.componentType === 'CTA' ||
      s.sectionIdentifier === 'homepage-cta' ||
      s.sectionIdentifier === 'cta-banner',
  );

  const showContactSection = cmsPayload.showContactSection !== false;
  const showCtaSection = cmsPayload.showCtaSection !== false;

  const contactSectionToRender: PageSectionDto = rawContactSection || {
    id: 'portfolio-contact-section',
    pageId: page?.id || 'portfolio',
    sectionIdentifier: 'contact-inquiry',
    componentType: 'CONTACT',
    displayOrder: 11,
    isActive: true,
    contentPayload: {
      eyebrow: 'DIRECT ENGAGEMENT',
      title: 'Initiate an Executive Technical Briefing',
      titleHighlight: 'Executive',
      description: 'Direct engagement with our Senior Technical Fellows and Enterprise Architects.',
    },
  };

  const ctaSectionToRender: PageSectionDto = rawCtaSection || {
    id: 'portfolio-cta-section',
    pageId: page?.id || 'portfolio',
    sectionIdentifier: 'homepage-cta',
    componentType: 'CTA',
    displayOrder: 12,
    isActive: true,
    contentPayload: {
      eyebrow: 'ENTERPRISE ARCHITECTURE',
      title: 'Ready to Accelerate Your Digital Transformation?',
      titleHighlight: 'Transformation',
      description:
        'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure engineered for uncompromising scale.',
      primaryButton: {
        label: 'Schedule Architecture Review',
        url: '/contact',
        variant: 'primary',
      },
    },
  };

  const syntheticSection: PageSectionDto = {
    id: rawSection?.id || 'portfolio-section',
    pageId: page?.id || 'portfolio',
    sectionIdentifier: rawSection?.sectionIdentifier || 'portfolio-showcase',
    componentType: rawSection?.componentType || 'PORTFOLIO',
    displayOrder: 1,
    isActive: true,
    contentPayload: {
      eyebrow: cmsPayload.eyebrow || 'SELECTED D2C WORKS',
      title: cmsPayload.title || 'Stores we are proud of.',
      titleHighlight: cmsPayload.titleHighlight || 'proud',
      description:
        cmsPayload.description ||
        'A curated collection of high-growth Shopify Plus storefronts, custom Liquid architectures, and high-conversion D2C experiences engineered by Gypsym.',
      showCategoryFilter: cmsPayload.showCategoryFilter !== false,
      defaultCategory: cmsPayload.defaultCategory || 'all',
      hoverEffectsEnabled: cmsPayload.hoverEffectsEnabled !== false,
      viewButtonEnabled: cmsPayload.viewButtonEnabled !== false,
      viewButtonLabel:
        cmsPayload.viewButtonLabel === 'View Case Study'
          ? 'View'
          : cmsPayload.viewButtonLabel || 'View',
      overlayEnabled: cmsPayload.overlayEnabled !== false,
      backdropBlurEnabled: cmsPayload.backdropBlurEnabled !== false,
      imageZoomEnabled: cmsPayload.imageZoomEnabled !== false,
      threeDScrollEnabled: cmsPayload.threeDScrollEnabled !== false,
      threeDIntensity: cmsPayload.threeDIntensity || 'premium',
      mouseParallaxEnabled: cmsPayload.mouseParallaxEnabled !== false,
    },
  };

  const filterCategories: PortfolioCategoryFilterItem[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    displayOrder: c.displayOrder,
    projectCount: c.projectCount,
  }));

  // Hero credentials & agency qualifications (clean low content, toggleable via Admin Studio)
  const showHeroStrip = cmsPayload.showHeroStrip !== false;
  const credentials =
    Array.isArray(cmsPayload.heroCredentials) && cmsPayload.heroCredentials.length > 0
      ? cmsPayload.heroCredentials
      : [
          { label: 'Shopify Plus Partner', value: 'Official Agency', sub: 'Enterprise D2C Specialists' },
          { label: 'Cost Advantage', value: '40–60%', sub: 'Less than US/UK agencies' },
          { label: 'Mobile Store Speed', value: '< 0.8s', sub: 'Core Web Vitals optimized' },
          { label: 'Dedicated Specialists', value: '25+', sub: 'Liquid, CRO & Theme leads' },
        ];

  return (
    <div className="w-full">
      {/* ── 1. Editorial Image-Based Hero Section (Home Page Aesthetic) ── */}
      <div className="w-full bg-[#f4f3ef] px-1.5 sm:px-2 md:px-3 pt-[clamp(6px,1vw,10px)]">
        <section
          aria-label="Portfolio Hero"
          className="relative isolate w-full rounded-[18px] sm:rounded-[22px] md:rounded-[28px] overflow-hidden flex flex-col shadow-sm border border-neutral-200/50"
          style={{ minHeight: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)', height: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)' }}
        >
          {/* Background Image with Ambient Visual Depth */}
          <div className="absolute inset-0 z-0 overflow-hidden select-none">
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2200&auto=format&fit=crop"
              alt="Gypsym Shopify Plus Agency Stores Portfolio Background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-105 animate-in fade-in duration-1000"
            />
            {/* Multi-tier Gradient & Contrast Overlay for Daylight / Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/50 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />
          </div>

          {/* Centered Hero Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 pt-[clamp(80px,14vw,130px)] pb-6 max-w-5xl mx-auto space-y-5 sm:space-y-6">
            {/* Eyebrow Badge */}
            <ScrollReveal direction="down" delay={60}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.2em] text-neutral-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>Shopify Plus Agency · D2C Portfolio</span>
              </div>
            </ScrollReveal>

            {/* Editorial Headline with Instrument Serif Accent */}
            <ScrollReveal direction="up" delay={120}>
              <h1 className="text-[clamp(32px,6.5vw,66px)] font-semibold tracking-[-0.025em] text-white leading-[1.12] drop-shadow-md">
                High-Converting Shopify Plus Stores &{' '}
                <span className="font-serif italic font-normal text-white drop-shadow-md text-[clamp(36px,7.5vw,74px)] inline-block leading-none mx-1.5 sm:mx-2.5">
                  Digital
                </span>{' '}
                Commerce
              </h1>
            </ScrollReveal>

            {/* Subtitle Description */}
            <ScrollReveal direction="up" delay={180}>
              <p className="text-[14px] sm:text-[16px] md:text-[17px] text-neutral-200 max-w-[90%] sm:max-w-2xl mx-auto leading-[1.65] font-normal drop-shadow">
                Explore a showcase of bespoke Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built for scaling brands.
              </p>
            </ScrollReveal>

            {/* Interactive Jump Action */}
            <ScrollReveal direction="up" delay={240}>
              <div className="pt-2 flex items-center justify-center gap-3.5">
                <a
                  href="#portfolio-grid"
                  className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
                >
                  <span>Explore Showcase ({projects.length} Stores)</span>
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all"
                >
                  <span>Book Free Strategy Call</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom Low-Profile Agency Credentials Strip (Toggleable via Admin Studio) */}
          {showHeroStrip && (
            <div className="w-full relative z-10 mt-auto border-t border-white/15 bg-white/95 backdrop-blur-md">
              <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-3.5 sm:py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200/80">
                  {credentials.map((item: any, i: number) => (
                    <div
                      key={i}
                      className={`flex flex-col justify-center ${i > 0 ? 'pt-2 md:pt-0 md:pl-6' : ''}`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-[17px] sm:text-[20px] md:text-[22px] font-bold text-neutral-900 tracking-tight">
                          <AnimatedCounter
                            value={item.value}
                            duration={1.8}
                            delay={i * 120}
                            threshold={0}
                            rootMargin="100px 0px 100px 0px"
                          />
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-[12px] font-semibold text-neutral-800 tracking-tight">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {item.sub}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── 2. Interactive Portfolio Grid with Dynamic Category Filter ── */}
      <main id="portfolio-grid" className="w-full flex-1">
        <PortfolioSection
          section={syntheticSection}
          categories={filterCategories}
          activeCategory={selectedCategory}
          overrideProjects={projects}
        />
      </main>

      {/* ── 3. DIRECT ENGAGEMENT (Contact) Section from Homepage ── */}
      {showContactSection && (
        <section id="portfolio-contact" className="w-full relative overflow-x-clip">
          <ScrollReveal direction="up" intensity="subtle" className="w-full">
            <ContactSection section={contactSectionToRender} />
          </ScrollReveal>
        </section>
      )}

      {/* ── 4. Call to Action (CTA) Section from Homepage ── */}
      {showCtaSection && (
        <section id="portfolio-cta" className="w-full relative overflow-x-clip">
          <ScrollReveal direction="up" intensity="subtle" className="w-full">
            <CtaSection section={ctaSectionToRender} />
          </ScrollReveal>
        </section>
      )}
    </div>
  );
}
