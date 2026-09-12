import * as React from 'react';
import { getNavigation, getBrandSettings } from '@/lib/api';
import { FooterView } from './footer-view';

/**
 * Dynamic CMS Footer (Server Component).
 * Fetches navigation and active brand settings from the CMS API.
 * Delegates live branding and reactive state to FooterView.
 */
export async function Footer() {
  const [footerNav, brand] = await Promise.all([
    getNavigation('footer'),
    getBrandSettings(),
  ]);

  return <FooterView navigation={footerNav} brand={brand} />;
}
