import * as React from 'react';
import { PageSectionDto } from '@/lib/cms-types';
import { HeroSection } from './hero-section';
import { VerifiedResultsSection } from './verified-results-section';
import { RevenueExperimentSection } from './revenue-experiment-section';
import { WhatWeChangeSection } from './what-we-change-section';
import { DeliveryProcessSection } from './delivery-process-section';
import { ClientTestimonialsSection } from './client-testimonials-section';
import { PortfolioSection } from './portfolio-section';

export interface SectionProps {
  section: PageSectionDto;
}

/**
 * Section Component Registry Map.
 * Registered components render dynamic CMS data.
 * ZERO placeholder sections or invented mock content.
 */
export const sectionRegistry: Record<string, React.ComponentType<SectionProps>> = {
  HERO: HeroSection,
  METRICS_BANNER: VerifiedResultsSection,
  VERIFIED_RESULTS: VerifiedResultsSection,
  CTA_STRIP: RevenueExperimentSection,
  REVENUE_EXPERIMENT: RevenueExperimentSection,
  CRO_REVENUE_EXPERIMENT: RevenueExperimentSection,
  FEATURE_GRID: WhatWeChangeSection,
  WHAT_WE_CHANGE: WhatWeChangeSection,
  PORTFOLIO: PortfolioSection,
  OUR_WORK: PortfolioSection,
  PORTFOLIO_SHOWCASE: PortfolioSection,
  TABBED_SOLUTIONS: DeliveryProcessSection,
  DELIVERY_PROCESS: DeliveryProcessSection,
  TESTIMONIAL_SLIDER: ClientTestimonialsSection,
  CLIENT_TESTIMONIALS: ClientTestimonialsSection,
};

/**
 * Helper to register a new section component at runtime or startup.
 */
export function registerSection(type: string, component: React.ComponentType<SectionProps>) {
  sectionRegistry[type.toUpperCase()] = component;
}

/**
 * Fallback renderer for unconfigured or unrecognized section types.
 * Renders an explicit technical notice in development, never fake content.
 */
export function UnregisteredSection({ section }: SectionProps) {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 my-6">
      <div className="border border-dashed border-amber-500/40 bg-amber-500/5 p-4 rounded-lg text-xs font-mono text-amber-500 flex items-center justify-between">
        <span>
          [Technical Notice] CMS Section registered in database but component not yet implemented: &lt;{section.componentType}&gt; (Identifier: {section.sectionIdentifier}, Order: {section.displayOrder})
        </span>
      </div>
    </div>
  );
}

/**
 * Resolves a section component from the registry.
 */
export function getSectionComponent(
  componentType: string,
  sectionIdentifier?: string
): React.ComponentType<SectionProps> {
  if (sectionIdentifier === 'cro-revenue-experiment') return RevenueExperimentSection;
  if (sectionIdentifier === 'what-we-actually-change') return WhatWeChangeSection;
  if (
    sectionIdentifier === 'portfolio-showcase' ||
    sectionIdentifier === 'our-work' ||
    sectionIdentifier === 'portfolio'
  ) {
    return PortfolioSection;
  }
  if (sectionIdentifier === 'delivery-process') return DeliveryProcessSection;
  const normalized = componentType.toUpperCase();
  return sectionRegistry[normalized] || UnregisteredSection;
}
