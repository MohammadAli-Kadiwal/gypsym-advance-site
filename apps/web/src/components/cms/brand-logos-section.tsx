'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { BrandLogosGrid } from './shared/brand-logos-grid';
import { BrandLogoItem } from './shared/brand-logo-card';

export interface BrandLogosSectionProps {
  id?: string;
  sectionIdentifier?: string;
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  cta?: {
    enabled?: boolean;
    label?: string;
    url?: string;
    target?: '_self' | '_blank';
  };
  items: BrandLogoItem[];
  layout?: {
    displayMode?: 'cards' | 'marquee';
    desktopRows?: number[];
    logoStyle?: 'original' | 'muted' | 'grayscale' | 'monochrome';
    logoSize?: 'small' | 'medium' | 'large';
    mobileCols?: 2 | 3;
  };
  animation?: {
    hoverEffect?: boolean;
  };
  bottomSlot?: React.ReactNode;
  emptyNotice?: string;
}

export function BrandLogosSection({
  id,
  sectionIdentifier,
  eyebrow = 'TRUSTED BY',
  title = '',
  titleHighlight = '',
  description = '',
  cta,
  items = [],
  layout = {},
  animation = {},
  bottomSlot,
  emptyNotice,
}: BrandLogosSectionProps) {
  // Deduplicate items by name and logo URL
  const uniqueItems: BrandLogoItem[] = React.useMemo(() => {
    if (!Array.isArray(items)) return [];
    const seenNames = new Set<string>();
    const seenLogos = new Set<string>();
    const result: BrandLogoItem[] = [];

    for (const item of items) {
      if (!item || !item.name) continue;
      const normName = item.name.trim().toLowerCase();
      const normLogo = (item.logoUrl || '').trim();

      if (seenNames.has(normName)) continue;
      if (normLogo && seenLogos.has(normLogo)) continue;

      seenNames.add(normName);
      if (normLogo) seenLogos.add(normLogo);
      result.push(item);
    }
    return result;
  }, [items]);

  if (uniqueItems.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="w-full max-w-[1360px] mx-auto px-4 py-8">
          <div className="p-4 border border-dashed border-[#d9287c]/50 bg-[#d9287c]/10 rounded-2xl text-xs font-mono text-[#d9287c]">
            {emptyNotice || `[BrandLogosSection] No items configured for section "${sectionIdentifier || id || 'logos'}".`}
          </div>
        </div>
      );
    }
    return null;
  }

  const sectionId = sectionIdentifier || id || 'brand-logos';
  const logoStyle = layout.logoStyle || 'original';
  const logoSize = layout.logoSize || 'medium';
  const displayMode = layout.displayMode || 'cards';
  const hoverEffect = animation.hoverEffect !== false;
  const mobileCols = layout.mobileCols || 3;

  return (
    <section
      id={sectionId}
      className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-transparent transition-colors duration-300 relative overflow-hidden"
    >
      {/* Ambient background glow matching site theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#d9287c]/6 via-[#d9287c]/2 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14 space-y-3 sm:space-y-4">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d9287c]/8 border border-[#d9287c]/20 text-xs font-bold tracking-widest text-[#d9287c] uppercase shadow-2xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c] animate-pulse" />
              <span>{eyebrow}</span>
            </div>
          )}

          {title && (
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.2] sm:leading-[1.18] whitespace-pre-line">
              {renderTitleWithHighlight(
                title,
                titleHighlight,
                'font-serif italic font-normal text-[1.06em] tracking-normal inline-block text-neutral-900 dark:text-white leading-normal'
              )}
            </h2>
          )}

          {description && (
            <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-1">
              {description}
            </p>
          )}

          {cta?.enabled && cta.url && (
            <div className="pt-2">
              <Link
                href={cta.url}
                target={cta.target || '_self'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors"
              >
                <span>{cta.label || 'Learn More'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Brand Logos Grid (Shared unified cards & cascading centered rows) ── */}
        <BrandLogosGrid
          items={uniqueItems}
          displayMode={displayMode}
          desktopRows={layout.desktopRows}
          logoStyle={logoStyle}
          logoSize={logoSize}
          hoverEffect={hoverEffect}
          mobileCols={mobileCols}
        />

        {/* ── Optional Bottom Slot (e.g. Trust Metrics Ribbon) ──────── */}
        {bottomSlot && <div className="w-full">{bottomSlot}</div>}
      </div>
    </section>
  );
}
