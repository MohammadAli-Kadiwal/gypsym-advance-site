import * as React from 'react';
import dynamic from 'next/dynamic';
import { PageSectionDto } from '@/lib/cms-types';
import { HeroSection } from './hero-section';

export interface SectionProps {
  section: PageSectionDto;
}

const VerifiedResultsSection = dynamic<SectionProps>(
  () => import('./verified-results-section').then((mod) => mod.VerifiedResultsSection),
  { ssr: true }
);
const RevenueExperimentSection = dynamic<SectionProps>(
  () => import('./revenue-experiment-section').then((mod) => mod.RevenueExperimentSection),
  { ssr: true }
);
const WhatWeChangeSection = dynamic<SectionProps>(
  () => import('./what-we-change-section').then((mod) => mod.WhatWeChangeSection),
  { ssr: true }
);
const ClientsTrustedBySection = dynamic<SectionProps>(
  () => import('./clients-trusted-by-section').then((mod) => mod.ClientsTrustedBySection),
  { ssr: true }
);
const PartnersSection = dynamic<SectionProps>(
  () => import('./partners-section').then((mod) => mod.PartnersSection),
  { ssr: true }
);
const CtaSection = dynamic<SectionProps>(
  () => import('./cta-section').then((mod) => mod.CtaSection),
  { ssr: true }
);
const CapabilitiesSection = dynamic<SectionProps>(
  () => import('./capabilities-section').then((mod) => mod.CapabilitiesSection),
  { ssr: true }
);
const ClientOutcomesSection = dynamic<SectionProps>(
  () => import('./client-outcomes-section').then((mod) => mod.ClientOutcomesSection),
  { ssr: true }
);
const DirectContactSection = dynamic<SectionProps>(
  () => import('./direct-contact-section').then((mod) => mod.DirectContactSection),
  { ssr: true }
);
const DeliveryProcessSection = dynamic<SectionProps>(
  () => import('./delivery-process-section').then((mod) => mod.DeliveryProcessSection),
  { ssr: true }
);
const ClientTestimonialsSection = dynamic<SectionProps>(
  () => import('./client-testimonials-section').then((mod) => mod.ClientTestimonialsSection),
  { ssr: true }
);
const PortfolioSection = dynamic<SectionProps>(
  () => import('./portfolio-section').then((mod) => mod.PortfolioSection),
  { ssr: true }
);
const ContactSection = dynamic<SectionProps>(
  () => import('./contact-section').then((mod) => mod.ContactSection),
  { ssr: true }
);
const BookingCalendarSection = dynamic<SectionProps>(
  () => import('./booking-calendar-section').then((mod) => mod.BookingCalendarSection),
  { ssr: true }
);
const RoiCalculatorSection = dynamic<SectionProps>(
  () => import('./roi-calculator-section').then((mod) => mod.RoiCalculatorSection),
  { ssr: true }
);

export { BrandLogosSection } from './brand-logos-section';
export { BrandLogoCard } from './shared/brand-logo-card';
export { BrandLogosGrid } from './shared/brand-logos-grid';

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
  LOGO_CLOUD: ClientsTrustedBySection,
  CLIENTS: ClientsTrustedBySection,
  TRUSTED_BY: ClientsTrustedBySection,
  CLIENTS_TRUSTED_BY: ClientsTrustedBySection,
  CLIENTS_PARTNERS: ClientsTrustedBySection,
  CLIENTS_AND_PARTNERS: ClientsTrustedBySection,
  PARTNERS: PartnersSection,
  HOMEPAGE_PARTNERS: PartnersSection,
  OUR_PARTNERS: PartnersSection,
  BRAND_LOGOS: ClientsTrustedBySection,
  CONTACT: ContactSection,
  CONTACT_INQUIRY: ContactSection,
  CONTACT_US: ContactSection,
  INQUIRY: ContactSection,
  CTA: CtaSection,
  CTA_BANNER: CtaSection,
  CALL_TO_ACTION: CtaSection,
  CAPABILITIES: CapabilitiesSection,
  OUR_CAPABILITIES: CapabilitiesSection,
  TECH_STACK: CapabilitiesSection,
  CLIENT_OUTCOMES: ClientOutcomesSection,
  STORE_OUTCOMES: ClientOutcomesSection,
  HOW_IT_WORKS_OUTCOMES: ClientOutcomesSection,
  DIRECT_CONTACT: DirectContactSection,
  DIRECT_CHANNELS: DirectContactSection,
  REACH_US_DIRECTLY: DirectContactSection,
  BOOKING_CALENDAR: BookingCalendarSection,
  DISCOVERY_BOOKING: BookingCalendarSection,
  ROI_CALCULATOR: RoiCalculatorSection,
  REVENUE_UPLIFT_CALCULATOR: RoiCalculatorSection,
  REVENUE_CALCULATOR: RoiCalculatorSection,
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
  if (
    sectionIdentifier === 'our-capabilities' ||
    sectionIdentifier === 'capabilities' ||
    sectionIdentifier === 'tech-stack'
  ) {
    return CapabilitiesSection;
  }
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
  if (
    sectionIdentifier === 'clients-trusted-by' ||
    sectionIdentifier === 'trusted-by' ||
    sectionIdentifier === 'clients' ||
    sectionIdentifier === 'clients-partners' ||
    sectionIdentifier === 'clients-and-partners'
  ) {
    return ClientsTrustedBySection;
  }
  if (
    sectionIdentifier === 'homepage-partners' ||
    sectionIdentifier === 'our-partners' ||
    sectionIdentifier === 'partners'
  ) {
    return PartnersSection;
  }
  if (
    sectionIdentifier === 'homepage-cta' ||
    sectionIdentifier === 'cta-banner' ||
    sectionIdentifier === 'cta'
  ) {
    return CtaSection;
  }
  if (
    sectionIdentifier === 'contact-inquiry' ||
    sectionIdentifier === 'contact' ||
    sectionIdentifier === 'inquiry'
  ) {
    return ContactSection;
  }
  if (
    sectionIdentifier === 'client-outcomes' ||
    sectionIdentifier === 'store-outcomes' ||
    sectionIdentifier === 'how-it-works-outcomes'
  ) {
    return ClientOutcomesSection;
  }
  if (
    sectionIdentifier === 'direct-contact' ||
    sectionIdentifier === 'reach-us-directly' ||
    sectionIdentifier === 'direct-channels'
  ) {
    return DirectContactSection;
  }
  if (
    sectionIdentifier === 'book-discovery' ||
    sectionIdentifier === 'discovery-call' ||
    sectionIdentifier === 'booking-calendar'
  ) {
    return BookingCalendarSection;
  }
  const normalized = componentType.toUpperCase();
  return sectionRegistry[normalized] || UnregisteredSection;
}
