import { api } from '@/lib/api';

export interface GlobalSeoData {
  siteName?: string;
  siteTitle?: string;
  siteDescription?: string;
  siteUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string[];
  defaultOgImage?: string;
  defaultSocialImage?: string;
  favicon?: string;
  defaultAuthor?: string;
  organizationName?: string;
  organizationLogo?: string;
  organizationDescription?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  socialProfiles?: Array<{ platform: string; url: string }>;
  defaultLanguage?: string;
  defaultLocale?: string;
  timezone?: string;
  metaTitleTemplate?: string;
  canonicalBaseUrl?: string;
  ogDefaultImage?: string;
  twitterCard?: string;
  twitterHandle?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  googleVerification?: string;
  bingVerification?: string;
  yandexVerification?: string;
  baiduVerification?: string;
  googleAnalyticsId?: string;
  gtmId?: string;
  metaPixelId?: string;
}

export interface SeoTemplatesData {
  pageTitleTemplate?: string;
  serviceTitleTemplate?: string;
  portfolioTitleTemplate?: string;
  categoryTitleTemplate?: string;
  blogTitleTemplate?: string;
  pageDescTemplate?: string;
  serviceDescTemplate?: string;
  portfolioDescTemplate?: string;
}

export interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

export interface RobotsConfigData {
  rules: RobotsRule[];
  sitemapUrl?: string;
  customText?: string;
}

export interface SitemapConfigData {
  includePages: boolean;
  includeServices: boolean;
  includePortfolio: boolean;
  includeCategories: boolean;
  includeBlog: boolean;
  excludedSlugs: string[];
  defaultChangefreq: string;
  defaultPriority: number;
}

export interface RedirectData {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AeoItemData {
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

export interface GeoProfileData {
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

export interface HreflangLocaleData {
  code: string;
  name: string;
  hreflangCode: string;
  domain?: string;
  isDefault?: boolean;
}

export const seoService = {
  // 1. Dashboard Metrics
  async getDashboard(): Promise<any> {
    const res = await api.get<any>('/seo/dashboard');
    return (res as any)?.data ?? res;
  },

  // 2. Global SEO Settings
  async getGlobal(): Promise<GlobalSeoData> {
    const res = await api.get<any>('/seo/global');
    return (res as any)?.data ?? res;
  },

  async updateGlobal(data: GlobalSeoData): Promise<GlobalSeoData> {
    const res = await api.put<any>('/seo/global', data);
    return (res as any)?.data ?? res;
  },

  // 3. Page SEO
  async getPages(params?: { search?: string; status?: string; missingSeoOnly?: boolean }): Promise<any[]> {
    const query: Record<string, string> = {};
    if (params?.search) query.search = params.search;
    if (params?.status) query.status = params.status;
    if (params?.missingSeoOnly) query.missingSeoOnly = 'true';
    const res = await api.get<any>('/seo/pages', query);
    return (res as any)?.data ?? res;
  },

  async getPageSeo(pageId: string): Promise<any> {
    const res = await api.get<any>(`/seo/pages/${pageId}`);
    return (res as any)?.data ?? res;
  },

  async updatePageSeo(pageId: string, data: any): Promise<any> {
    const res = await api.put<any>(`/seo/pages/${pageId}`, data);
    return (res as any)?.data ?? res;
  },

  async auditPage(pageId: string): Promise<any> {
    const res = await api.get<any>(`/seo/audit/${pageId}`);
    return (res as any)?.data ?? res;
  },

  // 4. Templates
  async getTemplates(): Promise<SeoTemplatesData> {
    const res = await api.get<any>('/seo/templates');
    return (res as any)?.data ?? res;
  },

  async updateTemplates(data: SeoTemplatesData): Promise<SeoTemplatesData> {
    const res = await api.put<any>('/seo/templates', data);
    return (res as any)?.data ?? res;
  },

  // 5. Robots.txt
  async getRobots(): Promise<RobotsConfigData> {
    const res = await api.get<any>('/seo/robots');
    return (res as any)?.data ?? res;
  },

  async updateRobots(data: RobotsConfigData): Promise<RobotsConfigData> {
    const res = await api.put<any>('/seo/robots', data);
    return (res as any)?.data ?? res;
  },

  // 6. Sitemap
  async getSitemap(): Promise<SitemapConfigData> {
    const res = await api.get<any>('/seo/sitemap');
    return (res as any)?.data ?? res;
  },

  async updateSitemap(data: SitemapConfigData): Promise<SitemapConfigData> {
    const res = await api.put<any>('/seo/sitemap', data);
    return (res as any)?.data ?? res;
  },

  // 7. Redirects
  async getRedirects(): Promise<RedirectData[]> {
    const res = await api.get<any>('/seo/redirects');
    return (res as any)?.data ?? res;
  },

  async createRedirect(data: Omit<RedirectData, 'id'>): Promise<RedirectData> {
    const res = await api.post<any>('/seo/redirects', data);
    return (res as any)?.data ?? res;
  },

  async updateRedirect(id: string, data: Partial<RedirectData>): Promise<RedirectData> {
    const res = await api.put<any>(`/seo/redirects/${id}`, data);
    return (res as any)?.data ?? res;
  },

  async deleteRedirect(id: string): Promise<any> {
    return api.delete<any>(`/seo/redirects/${id}`);
  },

  // 8. AEO
  async getAeo(): Promise<AeoItemData[]> {
    const res = await api.get<any>('/seo/aeo');
    return (res as any)?.data ?? res;
  },

  async createAeo(data: Omit<AeoItemData, 'id'>): Promise<AeoItemData> {
    const res = await api.post<any>('/seo/aeo', data);
    return (res as any)?.data ?? res;
  },

  async updateAeo(id: string, data: Partial<AeoItemData>): Promise<AeoItemData> {
    const res = await api.put<any>(`/seo/aeo/${id}`, data);
    return (res as any)?.data ?? res;
  },

  async deleteAeo(id: string): Promise<any> {
    return api.delete<any>(`/seo/aeo/${id}`);
  },

  // 9. GEO
  async getGeo(): Promise<GeoProfileData> {
    const res = await api.get<any>('/seo/geo');
    return (res as any)?.data ?? res;
  },

  async updateGeo(data: GeoProfileData): Promise<GeoProfileData> {
    const res = await api.put<any>('/seo/geo', data);
    return (res as any)?.data ?? res;
  },

  // 10. Hreflang
  async getHreflang(): Promise<{ locales: HreflangLocaleData[] }> {
    const res = await api.get<any>('/seo/hreflang');
    return (res as any)?.data ?? res;
  },

  async updateHreflang(data: { locales: HreflangLocaleData[] }): Promise<any> {
    const res = await api.put<any>('/seo/hreflang', data);
    return (res as any)?.data ?? res;
  },
};
