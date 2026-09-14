import * as React from 'react';
import type { Metadata } from 'next';
import { getPageBySlug, getPortfolioCategories, getPortfolioProjects } from '@/lib/api';
import { PortfolioSection, PortfolioCategoryFilterItem } from '@/components/cms/portfolio-section';
import { PageSectionDto } from '@/lib/cms-types';

export const dynamic = 'force-dynamic';

interface OurWorkPageProps {
  searchParams: {
    category?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('our-work');
  if (!page) {
    return {
      title: 'Our Work | Gypsym Technology',
    };
  }

  const seo = page.seoMetadata;
  return {
    title: seo?.metaTitle || page.title || 'Our Work',
    description: seo?.metaDescription || page.description || undefined,
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || page.title || 'Our Work',
      description: seo?.ogDescription || seo?.metaDescription || page.description || undefined,
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function OurWorkPage({ searchParams }: OurWorkPageProps) {
  const selectedCategory = (searchParams?.category || 'all').toLowerCase();

  // Concurrently fetch CMS page settings, categories, and server-side filtered portfolio projects
  const [page, categories, projects] = await Promise.all([
    getPageBySlug('our-work'),
    getPortfolioCategories(),
    getPortfolioProjects(selectedCategory),
  ]);

  // Extract or build portfolio section payload from CMS
  const rawSection = page?.sections?.find(
    (s) =>
      s.sectionIdentifier === 'our-work-portfolio' ||
      s.sectionIdentifier === 'portfolio-showcase' ||
      s.componentType === 'PORTFOLIO' ||
      s.componentType === 'OUR_WORK' ||
      s.componentType === 'FEATURE_GRID',
  );

  const cmsPayload = (rawSection?.contentPayload as Record<string, any>) || {};

  const syntheticSection: PageSectionDto = {
    id: rawSection?.id || 'our-work-section',
    pageId: page?.id || 'our-work',
    sectionIdentifier: rawSection?.sectionIdentifier || 'our-work-portfolio',
    componentType: rawSection?.componentType || 'FEATURE_GRID',
    displayOrder: 1,
    isActive: true,
    contentPayload: {
      eyebrow: cmsPayload.eyebrow || 'OUR WORK',
      title: cmsPayload.title || page?.title || "Work we're proud of.",
      titleHighlight: cmsPayload.titleHighlight || 'Our Work',
      description:
        cmsPayload.description ||
        page?.description ||
        "A curated collection of mission-critical platforms, distributed architectures, and digital experiences engineered for industry leaders.",
      showCategoryFilter: cmsPayload.showCategoryFilter !== false,
      defaultCategory: cmsPayload.defaultCategory || 'all',
      hoverEffectsEnabled: cmsPayload.hoverEffectsEnabled !== false,
      viewButtonEnabled: cmsPayload.viewButtonEnabled !== false,
      viewButtonLabel: cmsPayload.viewButtonLabel || 'View',
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

  return (
    <div className="w-full min-h-screen bg-background">
      <PortfolioSection
        section={syntheticSection}
        categories={filterCategories}
        activeCategory={selectedCategory}
        overrideProjects={projects}
      />
    </div>
  );
}
