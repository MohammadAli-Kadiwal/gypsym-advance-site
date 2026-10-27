import { getPublicGlobalSeo } from '@/lib/api/seo';

/**
 * Resolves the canonical public site URL for Gypsym (gypsym.com).
 * Priority: NEXT_PUBLIC_SITE_URL > SITE_URL > 'https://gypsym.com'
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://gypsym.com';
}

/**
 * Dynamically resolves the canonical origin domain configured in SEO Settings (Canonicals & Hreflang).
 * Priority: Global SEO canonicalBaseUrl > Global SEO siteUrl > NEXT_PUBLIC_SITE_URL > SITE_URL > 'https://gypsym.com'
 */
export async function resolveSiteUrl(): Promise<string> {
  const globalSeo = await getPublicGlobalSeo().catch(() => null);
  const configured = globalSeo?.canonicalBaseUrl || globalSeo?.siteUrl;
  if (configured && typeof configured === 'string' && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, '');
  }
  return getSiteUrl();
}
