import * as React from 'react';
import { getHeaderData } from '@/lib/api';
import { HeaderView } from './header-view';

/**
 * Dynamic CMS Header (Server Component).
 * Strictly dynamic: fetches navigation tree, branding, and header config from NestJS API / PostgreSQL.
 * ZERO hardcoded links, ZERO hardcoded branding.
 */
export async function Header() {
  const headerData = await getHeaderData();

  return (
    <HeaderView
      navigation={headerData.navigation}
      brand={headerData.branding}
      config={headerData.config}
    />
  );
}

