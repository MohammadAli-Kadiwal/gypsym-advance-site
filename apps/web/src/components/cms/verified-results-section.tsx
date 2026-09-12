'use client';

import * as React from 'react';
import { PageSectionDto, VerifiedResultsPayload, ResultCardPayload } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';

interface VerifiedResultsSectionProps {
  section: PageSectionDto;
}

/**
 * Format structured metric display safely.
 */
function formatMetricValue(metric: ResultCardPayload['metric']): string {
  if (metric.displayValue) {
    return metric.displayValue;
  }
  const prefix = metric.prefix || '';
  const suffix = metric.suffix || '';
  const val = typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value;
  return `${prefix}${val}${suffix}`;
}

const THEME_PALETTES: Record<string, { bg: string; bar: string; text: string }> = {
  pink: { bg: '#fae8f4', bar: '#8c7486', text: '#7a6575' },
  blue: { bg: '#eaf0ff', bar: '#7284a6', text: '#64748b' },
  yellow: { bg: '#fef2d8', bar: '#9c9173', text: '#857a5e' },
  peach: { bg: '#fae8de', bar: '#9a786f', text: '#8a6d65' },
};

const DEFAULT_THEME_KEYS = ['pink', 'blue', 'yellow', 'peach'];

/**
 * Ascending 6-bar chart with graduated opacity matching reference image.
 */
function MiniBarChart({
  dataPoints,
  themeColor = '#8c7486',
}: {
  dataPoints?: number[];
  themeColor?: string;
}) {
  const pts = dataPoints && dataPoints.length > 0 ? dataPoints : [22, 34, 45, 60, 80, 100];
  const max = Math.max(...pts, 1);

  return (
    <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2 h-6 sm:h-8 md:h-10 w-full mt-3 sm:mt-5" aria-hidden="true">
      {pts.map((val, idx) => {
        const heightPct = Math.max(18, Math.round((val / max) * 100));
        const opacity = 0.28 + (idx / Math.max(pts.length - 1, 1)) * 0.72;
        return (
          <div
            key={idx}
            className="flex-1 rounded-xs sm:rounded-md transition-all duration-500 ease-out"
            style={{
              height: `${heightPct}%`,
              backgroundColor: themeColor,
              opacity: opacity,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Single Result Metric Card
 */
function ResultCard({ card, index }: { card: ResultCardPayload; index: number }) {
  const fallbackKey = DEFAULT_THEME_KEYS[index % DEFAULT_THEME_KEYS.length] || 'pink';
  const token = card.appearance?.accentToken || '';
  const palette = THEME_PALETTES[token] ?? THEME_PALETTES[fallbackKey] ?? { bg: '#fae8f4', bar: '#8c7486', text: '#7a6575' };

  const cardBg = (card.appearance as any)?.cardBg || palette.bg;
  const barColor = (card.appearance as any)?.barColor || palette.bar;

  return (
    <div
      className="group relative flex flex-col justify-between rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-6 md:p-7 transition-all duration-300 border border-black/[0.04] shadow-sm hover:shadow-md min-h-[170px] sm:min-h-[220px]"
      style={{ backgroundColor: cardBg }}
    >
      {/* Top Meta: Category · Geography & VERIFIED ✓ Badge */}
      <div>
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-medium text-neutral-600 dark:text-neutral-700 truncate">
            {card.category}{card.region ? ` · ${card.region}` : card.geography ? ` · ${card.geography}` : ''}
          </span>

          {card.verification?.enabled && (
            <span className="shrink-0 inline-flex items-center gap-1 bg-white text-[#d9287c] text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-xs border border-pink-100/60">
              {card.verification.label || 'VERIFIED ✓'}
            </span>
          )}
        </div>

        {/* Middle: Metric Display & Subtext */}
        <div className="mt-3 sm:mt-5 mb-1">
          <div className="text-xl sm:text-[30px] md:text-[36px] font-bold text-neutral-900 tracking-tight leading-none truncate">
            {formatMetricValue(card.metric)}
          </div>
          {card.metric.description && (
            <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-600 font-normal mt-1 sm:mt-2 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
              {card.metric.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Footer: Mini Visual Chart */}
      <MiniBarChart dataPoints={card.chart?.dataPoints} themeColor={barColor} />
    </div>
  );
}

/**
 * Public Verified Results Section
 */
export function VerifiedResultsSection({ section }: VerifiedResultsSectionProps) {
  const payload = (section.contentPayload as VerifiedResultsPayload) || {};

  const eyebrow = payload.eyebrow;
  const headline = payload.headline;
  const description = payload.description;
  const supportingText = payload.supportingText;
  const cards = (payload.cards || [])
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section
      aria-labelledby={`heading-${section.id}`}
      className="w-full bg-[#F4F3EF] dark:bg-[#0b0d12] text-neutral-900 dark:text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 transition-colors"
    >
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Header Block: Eyebrow, Large Headline, Descriptions */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {eyebrow?.enabled && eyebrow.text && (
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
              <span>{eyebrow.text}</span>
            </div>
          )}

          {headline && (
            <h2
              id={`heading-${section.id}`}
              className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12] whitespace-pre-line"
            >
              {payload.titleHighlight ? (
                renderTitleWithHighlight(
                  headline.segments && headline.segments.length > 0
                    ? headline.segments.map((s) => s.value || (s as any).text || '').join('')
                    : headline.text || '',
                  payload.titleHighlight
                )
              ) : headline.segments && headline.segments.length > 0 ? (
                headline.segments.map((seg, idx) => {
                  if (seg.type === 'italic') {
                    return (
                      <span key={idx} className="font-serif italic font-normal text-[1.08em] tracking-normal">
                        {seg.value}
                      </span>
                    );
                  }
                  return <span key={idx}>{seg.value}</span>;
                })
              ) : (
                <span>{headline.text}</span>
              )}
            </h2>
          )}

          {description?.enabled && description.content && (
            <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-1">
              {description.content}
            </p>
          )}

          {supportingText?.enabled && supportingText.content && (
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
              {supportingText.content}
            </p>
          )}
        </div>

        {/* Responsive Cards Grid: 2 columns in mobile (2 in one row), 4 columns desktop */}
        {cards.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {cards.map((card, idx) => (
              <ResultCard key={card.id} card={card} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
