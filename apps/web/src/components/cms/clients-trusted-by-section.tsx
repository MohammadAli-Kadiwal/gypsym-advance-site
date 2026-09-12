'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';

interface ClientItem {
  id: string;
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  tier?: string;
  displayOrder?: number;
}

interface ClientsLayoutSettings {
  preset?: '8/6/4' | '6/4/2' | '8/8' | '6/6/6' | 'equal' | 'custom';
  rowPattern?: number[];
  overflowBehavior?: 'continue' | 'limit';
  rowAlignment?: 'center' | 'left';
  logoStyle?: 'muted' | 'grayscale' | 'monochrome' | 'original';
  logoSize?: 'small' | 'medium' | 'large';
  gap?: 'compact' | 'medium' | 'relaxed';
}

interface ClientsAnimationSettings {
  enableReveal?: boolean;
  revealStyle?: 'stagger' | 'fade';
  hoverEffect?: boolean;
}

interface ClientsPayload {
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
  layout?: ClientsLayoutSettings;
  animation?: ClientsAnimationSettings;
  clients?: ClientItem[];
  selectedClients?: Array<{ clientId: string; displayOrder: number; visibility?: boolean }>;
}

interface ClientsTrustedBySectionProps {
  section: PageSectionDto;
}

export function ClientsTrustedBySection({ section }: ClientsTrustedBySectionProps) {
  const p = (section.contentPayload as ClientsPayload) || {};

  const eyebrow = p.eyebrow;
  const title = p.title || '';
  const titleHighlight = p.titleHighlight || 'ambitious businesses';
  const description = p.description || '';
  const cta = p.cta;

  const layout = p.layout || {};
  const animation = p.animation || {};

  const logoStyle = layout.logoStyle || 'original';
  const logoSize = layout.logoSize || 'medium';
  const hoverEffect = animation.hoverEffect !== false;

  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Strictly deduplicate clients by ID, name, and logo URL so no client is EVER shown multiple times
  const uniqueClients: ClientItem[] = React.useMemo(() => {
    if (!Array.isArray(p.clients)) return [];
    const seenNames = new Set<string>();
    const seenLogos = new Set<string>();
    const result: ClientItem[] = [];

    for (const c of p.clients) {
      if (!c || !c.name) continue;
      const normName = c.name.trim().toLowerCase();
      const normLogo = (c.logoUrl || '').trim();

      if (seenNames.has(normName)) continue;
      if (normLogo && seenLogos.has(normLogo)) continue;

      seenNames.add(normName);
      if (normLogo) seenLogos.add(normLogo);
      result.push(c);
    }
    return result;
  }, [p.clients]);

  // Empty state handling: NEVER fabricate placeholder clients on production
  if (!uniqueClients || uniqueClients.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="p-4 border border-dashed border-amber-500/50 bg-amber-500/10 rounded-lg text-xs font-mono text-amber-500">
            [ClientsTrustedBySection] No clients configured in CMS payload for section &quot;{section.sectionIdentifier}&quot;.
          </div>
        </div>
      );
    }
    return null;
  }

  // Dimension classes based on size settings (clean, compact & responsive)
  const containerHeightClass =
    logoSize === 'small'
      ? 'h-8 sm:h-11 md:h-13 w-full px-1'
      : logoSize === 'large'
      ? 'h-11 sm:h-15 md:h-18 w-full px-1'
      : 'h-9 sm:h-13 md:h-15 w-full px-1';

  const logoMaxHeightClass =
    logoSize === 'small'
      ? 'max-h-6 sm:max-h-8 md:max-h-10'
      : logoSize === 'large'
      ? 'max-h-8 sm:max-h-12 md:max-h-14'
      : 'max-h-7 sm:max-h-10 md:max-h-12';

  const logoMaxWidthClass =
    logoSize === 'small'
      ? 'w-full max-w-[80px] sm:max-w-[120px] md:max-w-[150px]'
      : logoSize === 'large'
      ? 'w-full max-w-[105px] sm:max-w-[160px] md:max-w-[195px]'
      : 'w-full max-w-[92px] sm:max-w-[140px] md:max-w-[175px]';

  // Logo style treatment
  const logoFilterClass =
    logoStyle === 'original'
      ? 'opacity-90 hover:opacity-100 transition-opacity dark:brightness-110'
      : logoStyle === 'monochrome'
      ? 'brightness-0 dark:invert opacity-70 hover:opacity-100'
      : logoStyle === 'grayscale'
      ? 'grayscale opacity-80 hover:grayscale-0 hover:opacity-100'
      : 'grayscale opacity-70 dark:opacity-60 hover:grayscale-0 hover:opacity-100 dark:hover:opacity-100';

  const displayEyebrow = eyebrow?.trim() || 'TRUSTED BY';
  const displayTitle = title?.trim() || 'Trusted by 100+ brands worldwide';
  const displayHighlight = titleHighlight?.trim() || '100+ brands worldwide';
  const displayDescription =
    (description && description.trim()) ||
    'We partner with ambitious enterprises and high-growth innovators to engineer scalable, high-performance digital platforms.';

  return (
    <section
      id={section.sectionIdentifier || 'clients'}
      className="w-full py-10 sm:py-14 md:py-16 lg:py-20 bg-transparent transition-colors duration-300 relative overflow-hidden"
    >
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* ── Section Header (Consistent typography & spacing with other sections) ───────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c] animate-pulse" />
            <span>{displayEyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
            {renderTitleWithHighlight(displayTitle, displayHighlight)}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-1">
            {displayDescription}
          </p>

          {cta?.enabled && cta.url && (
            <div className="pt-2">
              <Link
                href={cta.url}
                target={cta.target || '_self'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors"
              >
                <span>{cta.label || 'Work With Us'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Multi-Row Centered Floating Client Logos (6 per line desktop, 3 per line mobile, generous row & column spacing) ───── */}
        <div className="w-full max-w-[1360px] mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 gap-y-5 sm:gap-y-8 md:gap-y-10 items-center justify-items-center">
            {uniqueClients.map((client) => (
              <ClientLogoItem
                key={client.id}
                client={client}
                containerHeightClass={containerHeightClass}
                logoMaxHeightClass={logoMaxHeightClass}
                logoMaxWidthClass={logoMaxWidthClass}
                logoFilterClass={logoFilterClass}
                hoverEffect={hoverEffect}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientLogoItem({
  client,
  containerHeightClass,
  logoMaxHeightClass,
  logoMaxWidthClass,
  logoFilterClass,
  hoverEffect,
  prefersReducedMotion,
}: {
  client: ClientItem;
  containerHeightClass: string;
  logoMaxHeightClass: string;
  logoMaxWidthClass: string;
  logoFilterClass: string;
  hoverEffect: boolean;
  prefersReducedMotion: boolean;
}) {
  const [imageError, setImageError] = React.useState(false);

  const CardWrapper = client.websiteUrl ? 'a' : 'div';
  const wrapperProps = client.websiteUrl
    ? {
        href: client.websiteUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `Visit ${client.name} website`,
      }
    : { 'aria-label': client.name };

  return (
    <CardWrapper
      {...(wrapperProps as any)}
      className={`group relative flex items-center justify-center ${containerHeightClass} bg-transparent border-0 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9127b] rounded-md transition-all duration-300 ${
        hoverEffect && !prefersReducedMotion ? 'hover:scale-105' : ''
      }`}
    >
      {client.logoUrl && !imageError ? (
        <div className="relative flex items-center justify-center bg-transparent w-full h-full">
          <Image
            src={client.logoUrl}
            alt={client.name}
            width={240}
            height={80}
            className={`w-full ${logoMaxHeightClass} ${logoMaxWidthClass} object-contain transition-all duration-300 [mix-blend-mode:multiply] dark:[mix-blend-mode:screen] ${logoFilterClass}`}
            unoptimized={client.logoUrl.endsWith('.svg')}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <span className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-600 dark:text-neutral-400 truncate max-w-[120px]">
          {client.name}
        </span>
      )}
    </CardWrapper>
  );
}
