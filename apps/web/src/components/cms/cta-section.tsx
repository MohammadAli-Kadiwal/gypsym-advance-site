'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { ScrollReveal } from '@/components/motion';

export interface CtaButton {
  label: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'glow';
  target?: '_self' | '_blank';
}

export interface CtaAppearance {
  backgroundType?: 'brand' | 'surface' | 'gradient' | 'image';
  backgroundImageUrl?: string;
  overlayOpacity?: number;
  enableGlow?: boolean;
}

export interface CtaLayout {
  alignment?: 'left' | 'center' | 'right';
  containerWidth?: 'narrow' | 'contained' | 'wide';
  borderRadius?: 'none' | 'md' | 'xl' | '2xl' | '3xl';
}

export interface CtaPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  primaryButton?: CtaButton;
  secondaryButton?: {
    enabled?: boolean;
    label?: string;
    url?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'glow';
    target?: '_self' | '_blank';
  };
  appearance?: CtaAppearance;
  layout?: CtaLayout;
}

interface CtaSectionProps {
  section: PageSectionDto;
}

export function CtaSection({ section }: CtaSectionProps) {
  const p = (section.contentPayload as CtaPayload) || {};

  const eyebrow = p.eyebrow?.trim() || 'ENTERPRISE ARCHITECTURE';
  const title = p.title?.trim() || 'Ready to Accelerate Your Digital Transformation?';
  const titleHighlight = p.titleHighlight?.trim() || 'Transformation';
  const description =
    p.description?.trim() ||
    'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure engineered for uncompromising scale.';

  const primaryButton: CtaButton = p.primaryButton || {
    label: 'Schedule an Architectural Briefing',
    url: '#contact-inquiry',
    variant: 'glow',
    target: '_self',
  };

  const secondaryButton = p.secondaryButton;
  const appearance: CtaAppearance = p.appearance || {};
  const layout: CtaLayout = p.layout || {};

  // Alignment classes
  const alignClass =
    layout.alignment === 'left'
      ? 'text-left items-start'
      : layout.alignment === 'right'
      ? 'text-right items-end'
      : 'text-center items-center';

  const buttonAlignClass =
    layout.alignment === 'left'
      ? 'justify-start'
      : layout.alignment === 'right'
      ? 'justify-end'
      : 'justify-center';

  const renderButton = (btn: CtaButton, isPrimary: boolean) => {
    const isExternal = btn.target === '_blank' || btn.url.startsWith('http');

    if (isPrimary) {
      return (
        <Link
          key={btn.label}
          href={btn.url}
          target={btn.target || '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center justify-center space-x-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-neutral-900 hover:bg-[#d9287c] text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-lg hover:shadow-[#d9287c]/25 transition-all duration-300 group w-full sm:w-auto cursor-pointer"
        >
          <span>{btn.label}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      );
    }

    return (
      <Link
        key={btn.label}
        href={btn.url}
        target={btn.target || '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center justify-center space-x-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-200/90 dark:border-neutral-700 font-semibold text-sm sm:text-base shadow-2xs transition-all duration-200 w-full sm:w-auto"
      >
        <span>{btn.label}</span>
        {isExternal && <ExternalLink className="w-4 h-4 opacity-60" />}
      </Link>
    );
  };

  return (
    <div
      id={section.sectionIdentifier || 'homepage-cta'}
      className="w-full py-8 sm:py-10 md:py-12 bg-transparent transition-colors duration-300 relative overflow-hidden"
    >
      {/* Ambient background glow matching site theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#d9287c]/6 via-[#d9287c]/2 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Main Card Container matching What We Change & Revenue Experiment design exactly */}
        <div className="w-full bg-white dark:bg-card rounded-[24px] sm:rounded-[36px] md:rounded-[42px] border border-neutral-200/80 dark:border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-8 md:p-10 lg:p-12 relative overflow-hidden">
          {/* Custom Background Image if specified */}
          {appearance.backgroundType === 'image' && appearance.backgroundImageUrl && (
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={appearance.backgroundImageUrl}
                alt="Call to action backdrop"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 bg-white dark:bg-neutral-950"
                style={{ opacity: (appearance.overlayOpacity ?? 50) / 100 }}
              />
            </div>
          )}

          {/* Card Content */}
          <ScrollReveal direction="up">
            <div className={`relative z-10 flex flex-col ${alignClass} space-y-4 sm:space-y-5 max-w-3xl mx-auto`}>
              {/* Eyebrow matching other section */}
              {eyebrow && (
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                  <span>{eyebrow}</span>
                </div>
              )}

              {/* Title with Serif-Italic Highlight (Standardized font size matching other sections) */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight whitespace-pre-line">
                {renderTitleWithHighlight(
                  title,
                  titleHighlight,
                  'font-serif italic font-normal text-[1.06em] tracking-normal inline-block text-neutral-900 dark:text-white leading-normal'
                )}
              </h2>

              {/* Description (Standardized font size matching other sections) */}
              {description && (
                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                  {description}
                </p>
              )}

              {/* Action Buttons - Mobile First Responsive Column on Small Screens */}
              <div className={`pt-2 sm:pt-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full ${buttonAlignClass}`}>
                {primaryButton?.label && renderButton(primaryButton, true)}

                {secondaryButton?.enabled && secondaryButton?.label && secondaryButton?.url && (
                  renderButton(
                    {
                      label: secondaryButton.label,
                      url: secondaryButton.url,
                      variant: secondaryButton.variant || 'outline',
                      target: secondaryButton.target || '_self',
                    },
                    false
                  )
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
