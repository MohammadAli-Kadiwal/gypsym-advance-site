'use client';

import * as React from 'react';
import { BrandLogoCard, BrandLogoItem } from './brand-logo-card';

export interface BrandLogosGridProps {
  items: BrandLogoItem[];
  displayMode?: 'cards' | 'marquee';
  desktopRows?: number[];
  desktopCols?: number;
  logoStyle?: 'original' | 'muted' | 'grayscale' | 'monochrome';
  logoSize?: 'small' | 'medium' | 'large';
  hoverEffect?: boolean;
  mobileCols?: 2 | 3;
}

// Maps column count to responsive classes
function getDesktopColClass(itemCount: number, explicitCols?: number): string {
  if (explicitCols === 4) return 'lg:grid-cols-4';
  if (explicitCols === 5) return 'lg:grid-cols-5';
  if (explicitCols === 6) return 'lg:grid-cols-6';
  if (explicitCols === 7) return 'lg:grid-cols-7';
  if (explicitCols === 8) return 'lg:grid-cols-8';

  // Even division matching item counts to eliminate trailing/empty spaces:
  // 14 items (e.g. current client list): 7 cols = 2 perfect rows of 7
  if (itemCount >= 13 && itemCount <= 14) return 'lg:grid-cols-7';
  if (itemCount % 7 === 0 && itemCount >= 14) return 'lg:grid-cols-7';
  // 12, 18, 24 items: 6 cols
  if (itemCount % 6 === 0 || itemCount === 11 || itemCount === 12) return 'lg:grid-cols-6';
  // 10, 15, 20 items: 5 cols
  if (itemCount === 10 || itemCount === 15 || itemCount % 5 === 0) return 'lg:grid-cols-5';
  // 8 or fewer: 4 cols
  if (itemCount <= 8) return 'lg:grid-cols-4';
  // Default for larger lists: 7 cols
  return 'lg:grid-cols-7';
}

export function BrandLogosGrid({
  items,
  displayMode = 'cards',
  desktopRows: _desktopRows,
  desktopCols,
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

  // ── Cards Display Mode: Continuous Line-by-Line Grid without Empty Space ────
  // In mobile: show strictly 3 per row (grid-cols-3)
  const mobileColClass = mobileCols === 2 ? 'grid-cols-2' : 'grid-cols-3';
  const desktopColClass = getDesktopColClass(items.length, desktopCols);

  return (
    <div className="w-full">
      <div
        className={`grid ${mobileColClass} sm:grid-cols-4 md:grid-cols-5 ${desktopColClass} gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 w-full`}
      >
        {items.map((item) => (
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
    </div>
  );
}
