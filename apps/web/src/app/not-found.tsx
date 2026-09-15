'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Home, Briefcase, Layers, MessageSquare } from 'lucide-react';
import { CtaSection } from '@/components/cms/cta-section';
import type { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal, StaggerContainer, RevealItem } from '@/components/motion';

const quickLinks = [
  {
    href: '/',
    icon: Home,
    label: 'Home',
    description: 'Return to the main Gypsym Technology portal',
    badge: 'Overview',
  },
  {
    href: '/portfolio',
    icon: Briefcase,
    label: 'Portfolio',
    description: 'Explore our portfolio of enterprise platforms',
    badge: 'Case Studies',
  },
  {
    href: '/services',
    icon: Layers,
    label: 'Services',
    description: 'Cloud cores, sovereign AI & zero-trust solutions',
    badge: 'Solutions',
  },
  {
    href: '/contact',
    icon: MessageSquare,
    label: 'Contact',
    description: 'Speak directly with our systems engineers',
    badge: 'Direct Advisory',
  },
];

const notFoundCtaSection: PageSectionDto = {
  id: 'not-found-cta',
  pageId: 'not-found',
  sectionIdentifier: 'homepage-cta',
  componentType: 'CTA',
  displayOrder: 99,
  isActive: true,
  contentPayload: {
    eyebrow: 'ENTERPRISE ARCHITECTURE',
    title: 'Ready to Accelerate Your Digital Transformation?',
    titleHighlight: 'Transformation',
    description:
      'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure engineered for uncompromising scale.',
    primaryButton: {
      label: 'Schedule an Architectural Briefing',
      url: '/contact',
      variant: 'glow',
      target: '_self',
    },
    secondaryButton: {
      enabled: true,
      label: 'Explore Portfolio',
      url: '/portfolio',
      variant: 'outline',
      target: '_self',
    },
    appearance: {
      backgroundType: 'gradient',
      enableGlow: true,
      overlayOpacity: 40,
    },
    layout: {
      alignment: 'center',
      borderRadius: '2xl',
      containerWidth: 'contained',
    },
  },
};

export default function NotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between bg-[#f4f3ef] text-neutral-900">
      {/* Top 404 Hero Section — matching home page container and branding */}
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6">
            {/* Eyebrow badge matching home page section standards */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#d9287c] bg-[#d9287c]/8 border border-[#d9287c]/20 shadow-2xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c] animate-pulse" />
              <span>Error 404 &bull; Route Not Found</span>
            </div>

            {/* Headline with Instrument Serif highlight */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.12]">
              Page not{' '}
              <span className="font-serif italic font-normal text-[1.06em] text-neutral-900">
                found
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              The resource or endpoint you requested is not available on the Gypsym Technology
              platform. It may have been relocated, updated, or temporarily decommissioned.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              <Link
                href="/"
                className="inline-flex items-center justify-center space-x-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-neutral-900 hover:bg-[#d9287c] text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-lg hover:shadow-[#d9287c]/25 transition-all duration-300 group w-full sm:w-auto cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Homepage</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200/90 font-semibold text-sm sm:text-base shadow-2xs transition-all duration-200 w-full sm:w-auto"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Quick Navigation Cards Grid — matching What We Change card aesthetics */}
        <div className="mt-14 sm:mt-18 md:mt-20">
          <ScrollReveal direction="up">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Direct Navigation Directory
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer preset="normal" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickLinks.map(({ href, icon: Icon, label, description, badge }) => (
              <RevealItem key={href}>
                <Link
                  href={href}
                  className="group bg-white rounded-[24px] sm:rounded-[28px] p-6 border border-neutral-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-[#d9287c]/10 group-hover:text-[#d9287c] group-hover:border-[#d9287c]/20 transition-all duration-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 group-hover:bg-[#d9287c]/10 group-hover:text-[#d9287c] transition-colors">
                        {badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#d9287c] transition-colors flex items-center gap-1.5">
                        {label}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-xs font-semibold text-neutral-700 group-hover:text-[#d9287c] transition-colors">
                    <span>Explore section</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </RevealItem>
            ))}
          </StaggerContainer>
        </div>
      </div>

      {/* Shared CTA Section — reuses the exact same component as the home page with zero duplicated markup */}
      <CtaSection section={notFoundCtaSection} />
    </div>
  );
}
