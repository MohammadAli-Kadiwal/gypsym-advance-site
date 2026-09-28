import * as React from 'react';
import { getFooterData } from '@/lib/api';
import { FooterView } from './footer-view';

/**
 * Dynamic CMS Footer (Server Component).
 * Fetches consolidated dynamic footer data (branding, navigation, config, contact, entity)
 * directly from NestJS CMS API / PostgreSQL.
 */
export async function Footer() {
  const footerData = await getFooterData();

  return <FooterView data={footerData} />;
}

