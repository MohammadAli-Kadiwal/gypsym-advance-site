'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ArrowRight } from 'lucide-react';
import { AnimatedCounter } from '@/components/motion';

interface RevenueExperimentSectionProps {
  section: PageSectionDto;
}

export function RevenueExperimentSection({ section }: RevenueExperimentSectionProps) {
  const p = section.contentPayload || {};

  const eyebrow = p.eyebrow || 'CRO REVENUE EXPERIMENT';
  const headline = p.headline || 'Test what makes money, not what looks nice';
  const titleHighlight = p.titleHighlight;
  const description =
    p.description ||
    'Every month we ship experiments against a single number — revenue per session. Winners stay, losers get reverted, and you see both.';
  const ctaText = p.ctaText || 'Start a CRO audit';
  const ctaUrl = p.ctaUrl || '#audit';

  const experimentTag = p.experimentTag || 'Experiment 14 · PDP bundle block';
  const winnerBadge = p.winnerBadge || 'WINNER';
  const metricTitle = p.metricTitle || 'Revenue per session';

  const controlLabel = p.controlLabel || 'Control';
  const controlValue = p.controlValue || '$1.94';
  const controlSubtext = p.controlSubtext || 'rev / session';

  const variantLabel = p.variantLabel || 'Variant B';
  const variantValue = p.variantValue || '$2.61';
  const variantSubtext = p.variantSubtext || '+34.5% · 97% conf.';

  const rawBars = Array.isArray(p.bars) && p.bars.length > 0 ? p.bars : [22, 35, 50, 65, 80, 100];
  const barColors = [
    '#fce7f3', // Bar 1
    '#fbcfe8', // Bar 2
    '#f472b6', // Bar 3
    '#ec4899', // Bar 4
    '#db2777', // Bar 5
    '#c026d3', // Bar 6 (Winner)
  ];

  const barsContainerRef = React.useRef<HTMLDivElement>(null);
  const [barsInView, setBarsInView] = React.useState(false);

  React.useEffect(() => {
    const el = barsContainerRef.current;
    if (!el || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setBarsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Format variant subtext with animated percentage if applicable
  const subtextParts = variantSubtext.split('·');
  const hasMultipleParts = subtextParts.length > 1;

  return (
    <div className="w-full py-8 sm:py-10 md:py-12">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Main Card Container */}
        <div className="w-full bg-white dark:bg-card rounded-[24px] sm:rounded-[36px] md:rounded-[42px] border border-neutral-200/80 dark:border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column: Verified Results Design applied (dot, typography, colors) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4 text-left">
              {eyebrow && (
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                  <span>{eyebrow}</span>
                </div>
              )}
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                {renderTitleWithHighlight(headline, titleHighlight)}
              </h2>
              {description && (
                <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed pt-1">
                  {description}
                </p>
              )}
              <div className="pt-2">
                <Link
                  href={ctaUrl}
                  className="inline-flex items-center space-x-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium text-sm sm:text-base hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-200 shadow-sm group w-fit"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Experiment Card Column */}
            <div className="lg:col-span-7">
              <div className="rounded-[20px] sm:rounded-[28px] bg-[#fcf5f7] dark:bg-pink-950/20 border border-[#fae4eb] dark:border-pink-900/40 p-4 sm:p-8 md:p-10 space-y-5 sm:space-y-6">
                {/* Header row: Experiment Tag & Winner Badge */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {experimentTag}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#d9127b] bg-[#fbe7f0] dark:bg-pink-950/50 border border-[#f9cfe0] dark:border-pink-800/50 px-2.5 py-0.5 rounded-full uppercase">
                    {winnerBadge}
                  </span>
                </div>

                {/* Metric Subtitle */}
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
                    {metricTitle}
                  </h3>
                </div>

                {/* Comparison Boxes: Control vs Variant B */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Control */}
                  <div className="bg-white dark:bg-card rounded-2xl p-4 sm:p-5 border border-neutral-100 dark:border-border shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] space-y-1">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
                      {controlLabel}
                    </span>
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white block">
                      <AnimatedCounter value={controlValue} duration={1.6} />
                    </span>
                    <span className="text-[11px] sm:text-xs text-neutral-400 font-medium block">
                      {controlSubtext}
                    </span>
                  </div>

                  {/* Variant B (Winner) */}
                  <div className="bg-[#fae7ef]/60 dark:bg-pink-950/40 rounded-2xl p-4 sm:p-5 border border-[#f7d5e4] dark:border-pink-800/40 shadow-[0_2px_8px_-2px_rgba(217,18,123,0.06)] space-y-1">
                    <span className="text-xs font-semibold text-[#c026d3] dark:text-pink-400 block">
                      {variantLabel}
                    </span>
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white block">
                      <AnimatedCounter value={variantValue} duration={1.6} delay={120} />
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-[#db2777] dark:text-pink-400 block">
                      {hasMultipleParts ? (
                        <>
                          <AnimatedCounter value={subtextParts[0].trim()} duration={1.6} delay={200} />
                          {' · '}
                          {subtextParts.slice(1).join('·').trim()}
                        </>
                      ) : (
                        <AnimatedCounter value={variantSubtext} duration={1.6} delay={200} />
                      )}
                    </span>
                  </div>
                </div>

                {/* Progressive Bar Chart */}
                <div
                  ref={barsContainerRef}
                  className="pt-4 flex items-end justify-between gap-2.5 sm:gap-3.5 h-28 sm:h-36 px-1"
                >
                  {rawBars.map((heightPercent: number, idx: number) => {
                    const color = barColors[idx % barColors.length];
                    const clampedHeight = Math.max(10, Math.min(100, Number(heightPercent) || 20));
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col justify-end items-center h-full group"
                      >
                        <div
                          style={{
                            height: barsInView ? `${clampedHeight}%` : '6%',
                            backgroundColor: color,
                            transitionDelay: `${idx * 90}ms`,
                          }}
                          className="w-full rounded-t-lg sm:rounded-t-xl transition-all duration-700 ease-out group-hover:opacity-90"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
