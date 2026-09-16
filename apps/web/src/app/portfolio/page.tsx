import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getPageBySlug, getPortfolioCategories, getPortfolioProjects } from '@/lib/api';
import { PortfolioSection, PortfolioCategoryFilterItem } from '@/components/cms/portfolio-section';
import { ContactSection } from '@/components/cms/contact-section';
import { CtaSection } from '@/components/cms/cta-section';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal } from '@/components/motion';
import { SubpageHero } from '@/components/ui/subpage-hero';

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
      <SubpageHero
        ariaLabel="Portfolio Hero"
        backgroundImageUrl={
          cmsPayload.heroBackgroundImage ||
          cmsPayload.backgroundImageUrl ||
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2200&auto=format&fit=crop'
        }
        imageAlt="Gypsym Shopify Plus Agency Stores Portfolio Background"
        eyebrow="Shopify Plus Agency · D2C Portfolio"
        eyebrowBulletColor="bg-emerald-400"
        titlePrefix="High-Converting Shopify Plus Stores &"
        titleHighlight="Digital"
        titleSuffix="Commerce"
        description="Explore a showcase of bespoke Shopify Plus stores, custom themes, and conversion-engineered D2C shopping experiences built for scaling brands."
        credentials={credentials}
        showHeroStrip={showHeroStrip}
        actions={
          <>
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
          </>
        }
      />

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
