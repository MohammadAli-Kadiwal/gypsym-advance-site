'use client';

import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface BrandLogoItem {
  id: string;
  name: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  websiteUrl?: string | null;
  slug?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  partnerType?: string | null;
  industry?: string | null;
  tier?: string;
  displayOrder?: number;
}

export interface BrandLogoCardProps {
  item: BrandLogoItem;
  displayMode?: 'cards' | 'minimal' | 'marquee';
  logoStyle?: 'original' | 'muted' | 'grayscale' | 'monochrome';
  logoSize?: 'small' | 'medium' | 'large';
  hoverEffect?: boolean;
  prefersReducedMotion?: boolean;
}

export function BrandLogoCard({
  item,
  displayMode = 'cards',
  logoStyle = 'original',
  logoSize = 'medium',
  hoverEffect = true,
  prefersReducedMotion = false,
}: BrandLogoCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const resolvedLogoUrl = React.useMemo(() => {
    if (!item.logoUrl) return null;
    const trimmed = item.logoUrl.trim();
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    return trimmed;
  }, [item.logoUrl]);

  React.useEffect(() => {
    setImageError(false);
  }, [resolvedLogoUrl]);

  const CardWrapper = item.websiteUrl ? 'a' : 'div';
  const wrapperProps = item.websiteUrl
    ? {
        href: item.websiteUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `Visit ${item.name} website`,
      }
    : { 'aria-label': item.name };

  const logoFilterClass =
    logoStyle === 'original'
      ? 'opacity-90 group-hover:opacity-100 transition-all duration-300'
      : logoStyle === 'monochrome'
      ? 'brightness-0 dark:invert opacity-75 group-hover:opacity-100 transition-all duration-300'
      : logoStyle === 'grayscale'
      ? 'grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300'
      : 'grayscale opacity-70 dark:opacity-65 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300';

  const logoMaxHeight =
    logoSize === 'small'
      ? 'max-h-5 sm:max-h-6 md:max-h-7'
      : logoSize === 'large'
      ? 'max-h-7 sm:max-h-8 md:max-h-9'
      : 'max-h-6 sm:max-h-7 md:max-h-8';

  const isCard = displayMode !== 'minimal';

  return (
    <CardWrapper
      {...(wrapperProps as any)}
      className={`group relative flex items-center justify-center transition-all duration-300 ${
        isCard
          ? 'w-full h-[56px] sm:h-[64px] md:h-[70px] px-2 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-neutral-800/60 backdrop-blur-xs border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-[#d9287c]/30 hover:bg-white dark:hover:bg-neutral-800/90 text-neutral-900 dark:text-white'
          : 'w-full h-10 sm:h-12 md:h-14 px-1.5'
      } ${
        hoverEffect && !prefersReducedMotion ? 'hover:-translate-y-1' : ''
      }`}
    >
      {/* Corner link indicator if websiteUrl exists and in card mode */}
      {isCard && item.websiteUrl && (
        <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-100/80 dark:bg-neutral-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-neutral-400 group-hover:text-[#d9287c]">
          <ArrowUpRight className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
        </span>
      )}

      {resolvedLogoUrl && !imageError ? (
        <div className="relative flex items-center justify-center w-full h-full p-0.5">
          <img
            src={resolvedLogoUrl}
            alt={item.name}
            className={`w-auto h-auto ${logoMaxHeight} max-w-[88%] object-contain select-none transition-all duration-300 [mix-blend-mode:multiply] dark:[mix-blend-mode:screen] ${logoFilterClass} ${
              hoverEffect && !prefersReducedMotion ? 'group-hover:scale-105' : ''
            }`}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <span className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-tight text-neutral-700 dark:text-neutral-300 truncate max-w-[85px] sm:max-w-[130px] text-center px-1">
          {item.name}
        </span>
      )}
    </CardWrapper>
  );
}
