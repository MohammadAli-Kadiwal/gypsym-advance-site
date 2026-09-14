'use client';

import * as React from 'react';
import { BrandLogoCard, BrandLogoItem } from './brand-logo-card';

export interface BrandLogosGridProps {
  items: BrandLogoItem[];
  displayMode?: 'cards' | 'marquee';
  desktopRows?: number[];
  logoStyle?: 'original' | 'muted' | 'grayscale' | 'monochrome';
  logoSize?: 'small' | 'medium' | 'large';
  hoverEffect?: boolean;
  mobileCols?: 2 | 3;
}

// Maps column count to Tailwind grid-cols and proportional max-w to ensure 180px card slots
const COL_WIDTH_CONFIG: Record<number, { gridClass: string; maxWClass: string }> = {
  2: { gridClass: 'grid-cols-2', maxWClass: 'max-w-[360px]' },
  3: { gridClass: 'grid-cols-3', maxWClass: 'max-w-[540px]' },
  4: { gridClass: 'grid-cols-4', maxWClass: 'max-w-[720px]' },
  5: { gridClass: 'grid-cols-5', maxWClass: 'max-w-[900px]' },
  6: { gridClass: 'grid-cols-6', maxWClass: 'max-w-[1080px]' },
  7: { gridClass: 'grid-cols-7', maxWClass: 'max-w-[1260px]' },
  8: { gridClass: 'grid-cols-8', maxWClass: 'max-w-[1440px]' },
};

export function BrandLogosGrid({
  items,
  displayMode = 'cards',
  desktopRows,
  logoStyle = 'original',
  logoSize = 'medium',
  hoverEffect = true,
  mobileCols = 3,
}: BrandLogosGridProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Determine row slicing:
  // If desktopRows is provided, use it.
  // Otherwise, if 10 items (like Trusted By default), default to [6, 4]
  // If 18+ items (like Partners default), default to [8, 6, 4]
  // Otherwise, default to [6, 6]
  const rows = React.useMemo(() => {
    if (desktopRows && desktopRows.length > 0) return desktopRows;
    if (items.length <= 10) return [6, 4];
    if (items.length <= 14) return [6, 4, 4];
    return [8, 6, 4];
  }, [desktopRows, items.length]);

  // Slice items into rows
  const { rowSlices, overflowItems } = React.useMemo(() => {
    const slices: { count: number; items: BrandLogoItem[] }[] = [];
    let currentIndex = 0;

    for (const count of rows) {
      if (currentIndex >= items.length) break;
      const sliceItems = items.slice(currentIndex, currentIndex + count);
      slices.push({ count, items: sliceItems });
      currentIndex += count;
    }

    const overflow = items.slice(currentIndex);
    return { rowSlices: slices, overflowItems: overflow };
  }, [items, rows]);

  if (items.length === 0) return null;

  // ── Marquee Display Mode ────────────────────────────────────────────────────
  if (displayMode === 'marquee') {
    return (
      <div className="relative w-full overflow-hidden py-4">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 sm:w-28 bg-gradient-to-r from-[#f4f4f0] dark:from-neutral-900 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 sm:w-28 bg-gradient-to-l from-[#f4f4f0] dark:from-neutral-900 to-transparent z-10" />
        <div className="flex items-center gap-4 sm:gap-6 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
          {[...items, ...items].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="w-[180px] sm:w-[200px] shrink-0">
              <BrandLogoCard
                item={item}
                displayMode="marquee"
                logoStyle={logoStyle}
                logoSize={logoSize}
                hoverEffect={hoverEffect}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Cards Display Mode: Centered Cascading Rows on Desktop, Responsive Grid on Mobile ─
  const mobileColClass = mobileCols === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';

  return (
    <div className="w-full">
      {/* Desktop Cascading Centered Rows */}
      <div className="hidden md:block space-y-3 sm:space-y-4">
        {rowSlices.map(({ count, items: sliceItems }, rowIdx) => {
          if (sliceItems.length === 0) return null;
          const conf = COL_WIDTH_CONFIG[count] || {
            gridClass: `grid-cols-${count}`,
            maxWClass: 'max-w-[1440px]',
          };

          return (
            <div
              key={rowIdx}
              className={`grid ${conf.gridClass} gap-3 sm:gap-3.5 md:gap-4 w-full ${conf.maxWClass} mx-auto`}
            >
              {sliceItems.map((item) => (
                <BrandLogoCard
                  key={item.id}
                  item={item}
                  displayMode="cards"
                  logoStyle={logoStyle}
                  logoSize={logoSize}
                  hoverEffect={hoverEffect}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          );
        })}

        {/* Overflow items if any */}
        {overflowItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-[1080px] mx-auto pt-2">
            {overflowItems.map((item) => (
              <div key={item.id} className="w-[170px]">
                <BrandLogoCard
                  item={item}
                  displayMode="cards"
                  logoStyle={logoStyle}
                  logoSize={logoSize}
                  hoverEffect={hoverEffect}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Responsive Grid */}
      <div className="md:hidden">
        <div className={`grid ${mobileColClass} gap-2.5 sm:gap-3`}>
          {items.map((item) => (
            <div key={item.id} className="w-full">
              <BrandLogoCard
                item={item}
                displayMode="cards"
                logoStyle={logoStyle}
                logoSize={logoSize}
                hoverEffect={hoverEffect}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
