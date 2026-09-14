'use client';

import * as React from 'react';
import { PageSectionDto } from '@/lib/cms-types';
import { BrandLogosSection } from './brand-logos-section';
import { BrandLogoItem } from './shared/brand-logo-card';

export interface PartnerItem extends BrandLogoItem {}

export interface PartnersLayoutSettings {
  preset?: '8/6/4' | '6/4/2' | '8/8' | '6/6/6' | '5/5' | 'custom';
  desktopRow1?: number;
  desktopRow2?: number;
  desktopRow3?: number;
  mobileCols?: 2 | 3;
  logoStyle?: 'muted' | 'grayscale' | 'monochrome' | 'original';
  logoSize?: 'small' | 'medium' | 'large';
  gap?: 'compact' | 'medium' | 'relaxed';
  rowAlignment?: 'center' | 'left';
}

export interface PartnersAnimationSettings {
  enableReveal?: boolean;
  hoverEffect?: boolean;
}

export interface PartnersPayload {
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
  layout?: PartnersLayoutSettings;
  animation?: PartnersAnimationSettings;
  partners?: PartnerItem[];
}

interface PartnersSectionProps {
  section: PageSectionDto;
}

export function PartnersSection({ section }: PartnersSectionProps) {
  const p = (section.contentPayload as PartnersPayload) || {};

  const eyebrow = p.eyebrow?.trim() || 'GLOBAL ALLIANCES';
  const title = p.title?.trim() || 'Strategic Cloud & Enterprise Partners';
  const titleHighlight = p.titleHighlight?.trim() || 'Enterprise Partners';
  const description =
    p.description?.trim() ||
    'We collaborate closely with leading cloud, commerce, and infrastructure providers to engineer resilient digital systems at global scale.';
  const cta = p.cta;

  const layout = p.layout || {};
  const animation = p.animation || {};

  const r1 = layout.desktopRow1 ?? 8;
  const r2 = layout.desktopRow2 ?? 6;
  const r3 = layout.desktopRow3 ?? 4;
  const desktopRows = [r1, r2, r3];

  return (
    <BrandLogosSection
      sectionIdentifier={section.sectionIdentifier || 'partners'}
      eyebrow={eyebrow}
      title={title}
      titleHighlight={titleHighlight}
      description={description}
      cta={cta}
      items={p.partners || []}
      layout={{
        displayMode: 'cards',
        desktopRows,
        logoStyle: layout.logoStyle || 'original',
        logoSize: layout.logoSize || 'medium',
        mobileCols: layout.mobileCols || 3,
      }}
      animation={{
        hoverEffect: animation.hoverEffect !== false,
      }}
      emptyNotice={`[PartnersSection] No published homepage partners found. Go to Admin > Content > Partners to add partners and enable "Show in Homepage Partners Section".`}
    />
  );
}
