'use client';

import * as React from 'react';
import { PageSectionDto } from '@/lib/cms-types';
import { BrandLogosSection } from './brand-logos-section';
import { BrandLogoItem } from './shared/brand-logo-card';

export interface ClientItem extends BrandLogoItem {
  industry?: string;
  featured?: boolean;
}

export interface ClientsPayload {
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
  layout?: {
    displayMode?: 'cards' | 'marquee';
    desktopRows?: number[];
    logoStyle?: 'original' | 'muted' | 'grayscale' | 'monochrome';
    logoSize?: 'small' | 'medium' | 'large';
    showMetricsBar?: boolean;
    mobileCols?: 2 | 3;
  };
  animation?: {
    hoverEffect?: boolean;
  };
  clients?: ClientItem[];
}

interface ClientsTrustedBySectionProps {
  section: PageSectionDto;
}

const DEFAULT_METRICS = [
  { value: '100+', label: 'Enterprise Clients Worldwide' },
  { value: '99.98%', label: 'Production System SLA' },
  { value: '15+', label: 'Global Markets & Regions' },
  { value: '$2B+', label: 'Enterprise Volume Powered' },
];

export function ClientsTrustedBySection({ section }: ClientsTrustedBySectionProps) {
  const p = (section.contentPayload as ClientsPayload) || {};

  const eyebrow = p.eyebrow?.trim() || 'TRUSTED BY';
  const title = p.title?.trim() || 'Trusted by 100+ brands worldwide';
  const titleHighlight = p.titleHighlight?.trim() || '100+ brands worldwide';
  const description =
    p.description?.trim() ||
    'We partner with ambitious enterprises and high-growth innovators to engineer scalable, high-performance digital platforms.';
  const cta = p.cta;

  const layout = p.layout || {};
  const animation = p.animation || {};
  const showMetricsBar = layout.showMetricsBar !== false;

  // 10 clients arranged cleanly as 6 on row 1, 4 on row 2 centered!
  const desktopRows = layout.desktopRows || [6, 4];

  const metricsRibbon = showMetricsBar ? (
    <div className="mt-14 sm:mt-16 pt-8 sm:pt-10 border-t border-neutral-200/70 dark:border-neutral-800/80">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
        {DEFAULT_METRICS.map((metric, idx) => (
          <div key={idx} className="flex flex-col items-center text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-mono">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-700 dark:from-white dark:via-neutral-200 dark:to-neutral-400">
                {metric.value}
              </span>
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-snug">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <BrandLogosSection
      sectionIdentifier={section.sectionIdentifier || 'clients'}
      eyebrow={eyebrow}
      title={title}
      titleHighlight={titleHighlight}
      description={description}
      cta={cta}
      items={p.clients || []}
      layout={{
        displayMode: layout.displayMode || 'cards',
        desktopRows,
        logoStyle: layout.logoStyle || 'original',
        logoSize: layout.logoSize || 'medium',
        mobileCols: layout.mobileCols || 3,
      }}
      animation={{
        hoverEffect: animation.hoverEffect !== false,
      }}
      bottomSlot={metricsRibbon}
      emptyNotice={`[ClientsTrustedBySection] No clients configured in CMS payload for section "${section.sectionIdentifier}".`}
    />
  );
}
