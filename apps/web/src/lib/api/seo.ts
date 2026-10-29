import { cache } from 'react';
import { API_CONFIG } from './config';

const getBaseUrl = () => API_CONFIG.baseURL;

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
  alternates?: {
    languages?: Record<string, string>;
  };
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

export const getPublicGlobalSeo = cache(async (): Promise<PublicGlobalSeo | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/seo/public/global`, {
      next: { tags: ['seo-global'], revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
});

export const getPublicSitemapUrls = cache(async (): Promise<SitemapUrlItem[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/seo/public/sitemap-urls`, {
      next: { tags: ['seo-sitemap'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
});

export const getPublicRobotsRules = cache(async (): Promise<PublicRobotsConfig | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/seo/public/robots-rules`, {
      next: { tags: ['seo-robots'], revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
});

export const getPublicRedirects = cache(async (): Promise<PublicRedirectItem[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/seo/public/redirects`, {
      next: { tags: ['seo-redirects'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
});

export const getPublicAeo = cache(async (pageSlug?: string): Promise<PublicAeoItem[]> => {
  try {
    const url = pageSlug
      ? `${getBaseUrl()}/seo/public/aeo?pageSlug=${encodeURIComponent(pageSlug)}`
      : `${getBaseUrl()}/seo/public/aeo`;
    const res = await fetch(url, {
      next: { tags: ['seo-aeo', `seo-aeo-${pageSlug || 'all'}`], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
});
