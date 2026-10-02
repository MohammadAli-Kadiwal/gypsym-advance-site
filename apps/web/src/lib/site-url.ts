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
