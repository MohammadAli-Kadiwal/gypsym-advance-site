export interface GlobalSeoSettings {
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

export interface SeoTemplates {
  pageTitleTemplate: string;
  serviceTitleTemplate: string;
  portfolioTitleTemplate: string;
  categoryTitleTemplate: string;
  blogTitleTemplate: string;
  pageDescTemplate: string;
  serviceDescTemplate: string;
  portfolioDescTemplate: string;
}

export interface RobotsConfig {
  rules: Array<{
    userAgent: string;
    allow: string[];
    disallow: string[];
  }>;
  sitemapUrl: string;
  customText?: string;
}

export interface SitemapConfig {
  includePages: boolean;
  includeServices: boolean;
  includePortfolio: boolean;
  includeCategories: boolean;
  includeBlog: boolean;
  excludedSlugs: string[];
  defaultChangefreq: string;
  defaultPriority: number;
}

export interface RedirectItem {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AeoItem {
  id: string;
  question: string;
  shortAnswer: string;
  detailedAnswer?: string;
  relatedPageSlug?: string;
  relatedServiceSlug?: string;
  topic?: string;
  entity?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'PUBLISHED' | 'DRAFT';
  displayOrder?: number;
}

export interface GeoProfile {
  brandName: string;
  legalName?: string;
  shortDescription?: string;
  longDescription?: string;
  industry?: string;
  foundedYear?: string;
  headquarters?: string;
  serviceAreas?: string[];
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialProfiles?: Array<{ platform: string; url: string }>;
  founderInfo?: string;
  keyDifferentiators?: string[];
  topicalEntities?: Array<{ name: string; type: string; description: string }>;
}

export interface HreflangLocale {
  code: string;
  name: string;
  hreflangCode: string;
  domain?: string;
  isDefault?: boolean;
}

export interface PageSeoItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  layoutType: string;
  updatedAt: string;
  seoMetadata: {
    metaTitle: string | null;
    metaDescription: string | null;
    canonicalUrl: string | null;
    robotsIndex: boolean;
    robotsFollow: boolean;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;
    twitterCard: string;
    structuredData: any;
  };
  audit: {
    hasTitle: boolean;
    titleLength: number;
    titleStatus: 'GOOD' | 'WARNING' | 'CRITICAL';
    hasDescription: boolean;
    descriptionLength: number;
    descriptionStatus: 'GOOD' | 'WARNING' | 'CRITICAL';
    hasCanonical: boolean;
    hasOg: boolean;
    isIndexable: boolean;
  };
}
