'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ScrollReveal, StaggerContainer, RevealItem } from '@/components/motion';

export interface OutcomeCardItem {
  id?: string;
  badge: string;
  quote: string;
  statValue: string;
  statLabel: string;
  rating?: number;
  clientLocation: string;
}

export interface ClientOutcomesPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  cards?: OutcomeCardItem[];
  trustBar?: {
    enabled?: boolean;
    textPrefix?: string;
    highlightText?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
}

interface ClientOutcomesSectionProps {
  section?: PageSectionDto;
  payload?: ClientOutcomesPayload;
}

const DEFAULT_CARDS: OutcomeCardItem[] = [
  {
    id: 'cro',
    badge: 'CRO',
    quote:
      '“I wanted to raise my conversion rate and Gypsym directly knew the right steps to improve the store’s layout. Delivery was in under 6 hours.”',
    statValue: '< 6 hrs',
    statLabel: 'from brief to first delivery',
    rating: 5,
    clientLocation: 'Verified client · Germany',
  },
  {
    id: 'figma-shopify',
    badge: 'FIGMA ➔ SHOPIFY',
    quote:
      '“I had reservations as it was my first experience — but the communication was outstanding and they perfectly captured the essence of the design brief.”',
    statValue: '1:1',
    statLabel: 'Figma design shipped as a working store',
    rating: 5,
    clientLocation: 'Verified client · Australia',
  },
  {
    id: 'custom-theme',
    badge: 'CUSTOM THEME',
    quote:
      '“They did a great job translating our design into a new Shopify theme. Clear communication, delivered ahead of deadline, and the design looks amazing.”',
    statValue: 'Ahead',
    statLabel: 'of deadline, every milestone',
    rating: 5,
    clientLocation: 'Verified client · United States',
  },
];

export function ClientOutcomesSection({ section, payload }: ClientOutcomesSectionProps) {
  const p = payload || (section?.contentPayload as ClientOutcomesPayload) || {};

  const eyebrow = p.eyebrow?.trim() || 'PROVEN OUTCOMES';
  const title = p.title?.trim() || 'How store owners like you use Gypsym';
  const titleHighlight = p.titleHighlight?.trim() || 'Gypsym';
  const description = p.description?.trim();
  const cards = p.cards && p.cards.length > 0 ? p.cards : DEFAULT_CARDS;
  const trustBar = p.trustBar || {};

  const trustPrefix = trustBar.textPrefix || 'Trusted by 1,000+ Shopify brands across 40+ countries —';
  const trustHighlight = trustBar.highlightText || '4.9★ from 1,400+ verified reviews';
  const trustCtaLabel = trustBar.ctaLabel || 'Read the reviews';
  const trustCtaUrl = trustBar.ctaUrl || '/#client-testimonials';

  return (
    <div
      id={section?.sectionIdentifier || 'client-outcomes'}
      className="w-full py-8 sm:py-10 md:py-12 transition-colors"
    >
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-10">
        {/* ── Section Header: Matching standard sections ────────────── */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-8 sm:mb-10">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>{eyebrow}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
              {renderTitleWithHighlight(
                title,
                titleHighlight,
                'font-serif italic font-normal text-[1.12em] tracking-normal inline-block px-1'
              )}
            </h2>

            {description && (
              <p className="text-sm sm:text-base lg:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-0.5">
                {description}
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* ── 3 Outcome Cards Grid ─────────────────────────────────── */}
        <StaggerContainer
          preset="normal"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch"
        >
          {cards.map((card, idx) => (
            <RevealItem key={card.id || idx} className="h-full">
              <div className="bg-white dark:bg-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-9 border border-neutral-200/80 dark:border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div>
                  {/* Category / Service Pill Badge */}
                  <div className="mb-5 sm:mb-6">
                    <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50">
                      {card.badge}
                    </span>
                  </div>

                  {/* Customer Quote */}
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                    {card.quote}
                  </p>
                </div>

                <div className="pt-8 sm:pt-10">
                  {/* Big Impact Metric */}
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-sky-600 dark:text-sky-400 tracking-tight leading-none font-mono">
                      {card.statValue}
                    </div>
                    <div className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-medium">
                      {card.statLabel}
                    </div>
                  </div>

                  {/* Rating Stars & Location Footer */}
                  <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                      {[...Array(card.rating || 5)].map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {card.clientLocation}
                    </span>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </StaggerContainer>

        {/* ── Dark Trust Bar Ribbon ─────────────────────────────────── */}
        <ScrollReveal direction="up" delay={120}>
          <div className="rounded-[18px] sm:rounded-[24px] bg-[#141517] dark:bg-neutral-900 border border-neutral-800 text-white px-5 sm:px-8 py-4 sm:py-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-sm">
            <div className="text-xs sm:text-sm font-medium text-neutral-300 text-center sm:text-left leading-relaxed">
              <span>{trustPrefix} </span>
              <span className="text-[#f5a623] font-semibold">{trustHighlight}</span>
            </div>

            <Link
              href={trustCtaUrl}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-neutral-300 transition-colors group underline underline-offset-4"
            >
              <span>{trustCtaLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
