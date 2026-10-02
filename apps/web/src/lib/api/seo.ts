import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.baseURL;

export interface PublicGlobalSeo {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  defaultSocialImage: string;
  favicon: string;
  defaultAuthor: string;
  organizationName: string;
  organizationLogo: string;
  organizationDescription: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  socialProfiles: Array<{ platform: string; url: string }>;
  defaultLanguage: string;
  defaultLocale: string;
  timezone: string;
  metaTitleTemplate: string;
  canonicalBaseUrl: string;
  ogDefaultImage: string;
  twitterCard: string;
  twitterHandle: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleVerification?: string;
  bingVerification?: string;
  yandexVerification?: string;
  baiduVerification?: string;
  googleAnalyticsId?: string;
  gtmId?: string;
  metaPixelId?: string;
}

export interface SitemapUrlItem {
  url: string;
  lastModified: string | Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface RobotsRuleItem {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
}

export interface PublicRobotsConfig {
  rules: RobotsRuleItem[];
  sitemapUrl: string;
  customText?: string;
}

export interface PublicRedirectItem {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  isActive: boolean;
}

export interface PublicAeoItem {
  id: string;
  question: string;
  shortAnswer: string;
  detailedAnswer?: string;
  relatedPageSlug?: string;
  topic?: string;
  entity?: string;
}

export async function getPublicGlobalSeo(): Promise<PublicGlobalSeo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/seo/public/global`, {
      cache: 'no-store',
      next: { tags: ['seo-global'], revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function getPublicSitemapUrls(): Promise<SitemapUrlItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/seo/public/sitemap-urls`, {
      cache: 'no-store',
      next: { tags: ['seo-sitemap'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function getPublicRobotsRules(): Promise<PublicRobotsConfig | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/seo/public/robots-rules`, {
      cache: 'no-store',
      next: { tags: ['seo-robots'], revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function getPublicRedirects(): Promise<PublicRedirectItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/seo/public/redirects`, {
      cache: 'no-store',
      next: { tags: ['seo-redirects'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function getPublicAeo(pageSlug?: string): Promise<PublicAeoItem[]> {
  try {
    const url = pageSlug
      ? `${API_BASE_URL}/seo/public/aeo?pageSlug=${encodeURIComponent(pageSlug)}`
      : `${API_BASE_URL}/seo/public/aeo`;
    const res = await fetch(url, {
      cache: 'no-store',
      next: { tags: ['seo-aeo', `seo-aeo-${pageSlug || 'all'}`], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}
