import * as React from 'react';
import { getHeaderData, getServices } from '@/lib/api';
import { HeaderView } from './header-view';

/**
 * Dynamic CMS Header (Server Component).
 * Strictly dynamic: fetches navigation tree, branding, header config, and active services.
 */
export async function Header() {
  const [headerData, services] = await Promise.all([
    getHeaderData(),
    getServices().catch(() => []),
  ]);

  return (
    <HeaderView
      navigation={headerData.navigation}
      brand={headerData.branding}
      config={headerData.config}
      services={services}
    />
  );
}

