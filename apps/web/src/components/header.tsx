import * as React from 'react';
import { getHeaderData, getServices, getPublishedPages } from '@/lib/api';
import { HeaderView } from './header-view';

/**
 * Dynamic CMS Header (Server Component).
 * Fetches navigation tree, branding, header config, active services,
 * and published CMS pages to auto-populate the site header.
 */
export async function Header() {
  const [headerData, services, cmsPages] = await Promise.all([
    getHeaderData(),
    getServices().catch(() => []),
    getPublishedPages().catch(() => []),
  ]);

  return (
    <HeaderView
      navigation={headerData.navigation}
      brand={headerData.branding}
      config={headerData.config}
      services={services}
      cmsPages={cmsPages}
    />
  );
}
