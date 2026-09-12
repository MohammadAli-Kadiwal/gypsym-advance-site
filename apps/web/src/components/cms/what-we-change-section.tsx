'use client';

import * as React from 'react';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';

interface WhatWeChangeSectionProps {
  section: PageSectionDto;
}

export function WhatWeChangeSection({ section }: WhatWeChangeSectionProps) {
  const p = section.contentPayload || {};

  const eyebrow = p.eyebrow || 'WHAT WE ACTUALLY CHANGE';
  const title = p.title || 'Give shoppers fewer reasons to leave';
  const titleHighlight = p.titleHighlight;
  const description =
    p.description ||
    'Every store we touch gets the same three things fixed first — the ones that move revenue before any new traffic is bought.';

  const cards = Array.isArray(p.cards) && p.cards.length > 0 ? p.cards : [];

  return (
    <div className="w-full py-8 sm:py-10 md:py-12">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header: Matching Verified Results exactly */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
              <span>{eyebrow}</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
            {renderTitleWithHighlight(title, titleHighlight)}
          </h2>
          <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-1">
            {description}
          </p>
        </div>

        {/* 3-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {cards.map((card: any, index: number) => {
            const cardType = card.type || (index === 0 ? 'cart' : index === 1 ? 'speed' : 'theme');

            return (
              <div
                key={card.id || index}
                className="bg-white rounded-[22px] sm:rounded-[30px] p-5 sm:p-7 border border-neutral-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                {/* Top Visual Preview Container */}
                <div className="h-44 sm:h-48 rounded-2xl bg-[#fce7ec] p-5 sm:p-6 flex flex-col justify-center items-stretch mb-6 relative overflow-hidden">
                  {/* Visual 1: Cart & Checkout */}
                  {cardType === 'cart' && (
                    <div className="w-full space-y-2.5">
                      <div className="bg-white rounded-xl py-2.5 px-4 flex items-center justify-between shadow-xs">
                        <span className="text-xs font-semibold text-neutral-800">
                          {card.cartLabel || 'Cart'}
                        </span>
                        <span className="text-[11px] font-bold text-[#d9127b] bg-[#fdf2f4] px-2 py-0.5 rounded-md">
                          {card.cartStep || '1 step'}
                        </span>
                      </div>
                      <div className="w-full py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center shadow-xs">
                        {card.checkoutButtonText || 'Checkout · $89.00'}
                      </div>
                    </div>
                  )}

                  {/* Visual 2: Speed / Core Web Vitals */}
                  {cardType === 'speed' && (
                    <div className="w-full space-y-3.5">
                      {(card.metrics || [
                        { label: 'LCP', value: '0.9s', percent: 78 },
                        { label: 'CLS', value: '0.02', percent: 92 },
                      ]).map((m: any, mIdx: number) => (
                        <div key={mIdx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 px-0.5">
                            <span>{m.label}</span>
                            <span>{m.value}</span>
                          </div>
                          <div className="h-2 w-full bg-white/70 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.max(10, Math.min(100, m.percent || 80))}%` }}
                              className="h-full bg-[#d9127b] rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Visual 3: Native Liquid Theme Sections */}
                  {cardType === 'theme' && (
                    <div className="w-full space-y-2">
                      {(card.items || [
                        { title: 'Hero section', badge: 'Editable' },
                        { title: 'Bundle block', badge: 'Editable' },
                        { title: 'Reviews', badge: 'Editable' },
                      ]).map((item: any, iIdx: number) => (
                        <div
                          key={iIdx}
                          className="bg-white rounded-xl py-2 px-3.5 flex items-center justify-between shadow-xs text-xs font-semibold text-neutral-800"
                        >
                          <span>{item.title}</span>
                          <span className="text-[11px] font-medium text-neutral-400">
                            {item.badge || 'Editable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Card Content */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mb-2.5">
                    {card.title}
                  </h3>
                  <p className="text-sm text-neutral-600 font-normal leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
