'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ScrollReveal, StaggerContainer, RevealItem } from '@/components/motion';

export interface DirectContactCard {
  id?: string;
  icon?: 'calendar' | 'mail' | 'whatsapp' | 'phone';
  iconBgColor?: 'blue' | 'amber' | 'sky' | 'emerald' | 'purple';
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

export interface DirectContactPayload {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  footnote?: string;
  cards?: DirectContactCard[];
}

interface DirectContactSectionProps {
  section?: PageSectionDto;
  payload?: DirectContactPayload;
}

const DEFAULT_CARDS: DirectContactCard[] = [
  {
    id: 'book-call',
    icon: 'calendar',
    iconBgColor: 'blue',
    title: 'Book a 30-min call',
    description:
      'Book a 30-minute discovery session directly on our calendar. A live look at your store, no pitch deck.',
    linkText: 'gypsym.com/book →',
    linkUrl: 'https://gypsym.com/book',
  },
  {
    id: 'email-us',
    icon: 'mail',
    iconBgColor: 'amber',
    title: 'Email us',
    description: 'For briefs, RFPs and anything with attachments.',
    linkText: 'project@gypsym.com →',
    linkUrl: 'mailto:project@gypsym.com',
  },
  {
    id: 'whatsapp',
    icon: 'whatsapp',
    iconBgColor: 'sky',
    title: 'WhatsApp',
    description:
      'Quick questions, quick answers. Based in Gujarat (IST), we serve clients in USA, UK, and globally — time zones aren’t a barrier.',
    linkText: '+91 73397 26403 →',
    linkUrl: 'https://wa.me/917339726403',
  },
];

function renderCardIcon(icon?: string, color?: string) {
  const bgClass =
    color === 'amber'
      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40'
      : color === 'sky'
      ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-100 dark:border-sky-900/40'
      : color === 'emerald'
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40'
      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/40';

  let IconComponent = Calendar;
  if (icon === 'mail') IconComponent = Mail;
  else if (icon === 'whatsapp' || icon === 'phone') IconComponent = MessageCircle;

  return (
    <div
      className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs ${bgClass}`}
    >
      <IconComponent className="w-5 h-5" />
    </div>
  );
}

export function DirectContactSection({ section, payload }: DirectContactSectionProps) {
  const p = payload || (section?.contentPayload as DirectContactPayload) || {};

  if (p.enabled === false) {
    return null;
  }

  const eyebrow = p.eyebrow?.trim() || 'DIRECT CHANNELS';
  const title = p.title?.trim() || 'Or Reach Us Directly';
  const titleHighlight = p.titleHighlight?.trim() || 'Directly';
  const footnote =
    p.footnote?.trim() || 'We reply within 24 hours on business days. Gujarat, India.';
  const cards = p.cards && p.cards.length > 0 ? p.cards : DEFAULT_CARDS;

  return (
    <div
      id={section?.sectionIdentifier || 'reach-us-directly'}
      className="w-full py-8 sm:py-10 md:py-12 transition-colors"
    >
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-8">
        {/* ── Section Title ────────────────────────────────────────── */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
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
                'font-serif italic font-normal text-[1.06em] tracking-normal inline-block text-neutral-900 dark:text-white leading-normal'
              )}
            </h2>
          </div>
        </ScrollReveal>

        {/* ── 3 Direct Channel Cards ───────────────────────────────── */}
        <StaggerContainer
          preset="normal"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch"
        >
          {cards.map((card, idx) => {
            const isExternal =
              card.linkUrl.startsWith('http://') ||
              card.linkUrl.startsWith('https://') ||
              card.linkUrl.startsWith('mailto:') ||
              card.linkUrl.startsWith('tel:');

            return (
              <RevealItem key={card.id || idx} className="h-full">
                <div className="bg-white dark:bg-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 border border-neutral-200/80 dark:border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div>
                    {/* Top Icon Badge */}
                    {renderCardIcon(card.icon, card.iconBgColor)}

                    {/* Card Title */}
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white mt-5">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-[13.5px] leading-relaxed mt-2 font-normal">
                      {card.description}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-6 sm:pt-8 mt-auto">
                    <Link
                      href={card.linkUrl}
                      target={isExternal && !card.linkUrl.startsWith('mailto:') ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group/link"
                    >
                      <span>{card.linkText.replace(/→$/, '').trim()}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </StaggerContainer>

        {/* ── Footnote / Availability Note ─────────────────────────── */}
        {footnote && (
          <ScrollReveal direction="up" delay={100}>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 pt-1">
              {footnote}
            </p>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
