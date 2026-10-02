/**
 * Resolves the public website URL and admin panel URL driven by environment variables.
 * Falls back to localhost in local dev, or gypsym.com in production.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3000';
  }
  return 'https://gypsym.com';
}

export function getAdminUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3001';
  }
  return 'https://admin.gypsym.com';
}
