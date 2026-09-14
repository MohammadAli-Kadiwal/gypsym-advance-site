'use client';

import * as React from 'react';
import Image from 'next/image';
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
      ? 'max-h-8 sm:max-h-9 md:max-h-10'
      : logoSize === 'large'
      ? 'max-h-11 sm:max-h-13 md:max-h-15'
      : 'max-h-9 sm:max-h-11 md:max-h-12';

  const isCard = displayMode !== 'minimal';

  return (
    <CardWrapper
      {...(wrapperProps as any)}
      className={`group relative flex items-center justify-center transition-all duration-300 ${
        isCard
          ? 'w-full h-[84px] sm:h-[98px] md:h-[108px] px-4 sm:px-5 py-3 rounded-2xl bg-white/80 dark:bg-neutral-800/50 backdrop-blur-xs border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-[#d9287c]/30 hover:bg-white dark:hover:bg-neutral-800/90 text-neutral-900 dark:text-white'
          : 'w-full h-12 sm:h-14 md:h-16 px-2'
      } ${
        hoverEffect && !prefersReducedMotion ? 'hover:-translate-y-1' : ''
      }`}
    >
      {/* Corner link indicator if websiteUrl exists and in card mode */}
      {isCard && item.websiteUrl && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-neutral-100/80 dark:bg-neutral-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-neutral-400 group-hover:text-[#d9287c]">
          <ArrowUpRight className="w-3 h-3" />
        </span>
      )}

      {item.logoUrl && !imageError ? (
        <div className="relative flex items-center justify-center w-full h-full">
          <Image
            src={item.logoUrl}
            alt={item.name}
            width={220}
            height={70}
            className={`w-auto h-auto ${logoMaxHeight} max-w-[85%] object-contain select-none transition-all duration-300 [mix-blend-mode:multiply] dark:[mix-blend-mode:screen] ${logoFilterClass} ${
              hoverEffect && !prefersReducedMotion ? 'group-hover:scale-105' : ''
            }`}
            unoptimized={item.logoUrl.endsWith('.svg')}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <span className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-700 dark:text-neutral-300 truncate max-w-[130px] text-center px-1">
          {item.name}
        </span>
      )}
    </CardWrapper>
  );
}
