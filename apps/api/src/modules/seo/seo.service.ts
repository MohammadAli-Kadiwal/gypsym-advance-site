import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface GlobalSeoDto {
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

export interface SeoTemplatesDto {
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

export interface RobotsConfigDto {
  rules: RobotsRule[];
  sitemapUrl?: string;
  customText?: string;
}

export interface SitemapConfigDto {
  includePages: boolean;
  includeServices: boolean;
  includePortfolio: boolean;
  includeCategories: boolean;
  includeBlog: boolean;
  excludedSlugs: string[];
  defaultChangefreq: string;
  defaultPriority: number;
}

export interface RedirectDto {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: number; // 301, 302, 307, 308
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AeoItemDto {
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

export interface GeoProfileDto {
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

export interface HreflangLocaleDto {
  code: string;
  name: string;
  hreflangCode: string;
  domain?: string;
  isDefault?: boolean;
}

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveMediaUrl(media: any): string | null {
    if (!media) return null;
    if (media.variants && typeof media.variants === 'object') {
      const v = media.variants as Record<string, string>;
      const resolved = v.original || v.lg || v.md;
      if (resolved && (resolved.startsWith('http') || resolved.startsWith('/') || resolved.startsWith('data:'))) {
        return resolved;
      }
    }
    if (typeof media.url === 'string' && (media.url.startsWith('http') || media.url.startsWith('/') || media.url.startsWith('data:'))) {
      return media.url;
    }
    return null;
  }

  private async resolveUrlOrStorageKey(val?: string | null): Promise<string | null> {
    if (!val) return null;
    const trimmed = val.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    // Check if it's a storageKey or ID in media table
    const media = await this.prisma.media.findFirst({
      where: {
        OR: [
          { storageKey: trimmed },
          { id: trimmed },
        ],
      },
    }).catch(() => null);

    if (media) {
      const resolved = this.resolveMediaUrl(media);
      if (resolved) return resolved;
    }
    return null;
  }

  // ────────────────────────────────────────────────────────────
  // 1. GLOBAL SEO SETTINGS
  // ────────────────────────────────────────────────────────────
  async getGlobalSeo(): Promise<GlobalSeoDto> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:global' },
    });

    const legacyRow = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:defaults' },
    });

    const legacy = (legacyRow?.value as Record<string, any>) || {};
    const val = (row?.value as Record<string, any>) || {};

    const brand = await this.prisma.brandSetting.findFirst({
      where: { isActive: true },
      include: { logoLight: true, logoDark: true, favicon: true },
    }).catch(() => null);

    const brandFavicon = this.resolveMediaUrl(brand?.favicon) || (brand?.favicon as any)?.url || null;
    const brandLogo = this.resolveMediaUrl(brand?.logoLight) || (brand?.logoLight as any)?.url || 'https://gypsym.com/logo.svg';

    let resolvedFavicon = await this.resolveUrlOrStorageKey(val.favicon);
    if (!resolvedFavicon || resolvedFavicon === '/favicon.ico') {
      resolvedFavicon = brandFavicon || '/favicon.ico';
    }

    let resolvedLogo = await this.resolveUrlOrStorageKey(val.organizationLogo);
    if (!resolvedLogo) {
      resolvedLogo = brandLogo;
    }

    return {
      siteName: val.siteName || brand?.companyName || 'Gypsym Technology',
      siteTitle: val.siteTitle || legacy.defaultTitle || 'Gypsym Technology | Shopify & Shopify Plus Agency',
      siteDescription: val.siteDescription || legacy.defaultDescription || 'Gypsym Technology is a leading Shopify & Shopify Plus agency specializing in custom store design, e-commerce development, conversion rate optimization, and D2C growth strategies for global brands.',
      siteUrl: val.siteUrl || legacy.canonicalBaseUrl || 'https://gypsym.com',
      defaultTitle: val.defaultTitle || legacy.defaultTitle || 'Gypsym Technology | Shopify & Shopify Plus Agency',
      defaultDescription: val.defaultDescription || legacy.defaultDescription || 'Gypsym Technology is a leading Shopify & Shopify Plus agency specializing in custom store design, e-commerce development, conversion rate optimization, and D2C growth strategies for global brands.',
      defaultKeywords: val.defaultKeywords || legacy.defaultKeywords || [
        'Shopify agency',
        'Shopify Plus agency',
        'e-commerce development',
        'Shopify store design',
        'D2C e-commerce',
        'conversion rate optimization',
        'custom Shopify theme',
        'Shopify experts',
      ],
      defaultOgImage: val.defaultOgImage || legacy.ogDefaultImage || 'https://gypsym.com/og-default.png',
      defaultSocialImage: val.defaultSocialImage || legacy.ogDefaultImage || 'https://gypsym.com/og-default.png',
      favicon: resolvedFavicon || undefined,
      defaultAuthor: val.defaultAuthor || 'Gypsym Technology Engineering Team',
      organizationName: val.organizationName || brand?.companyName || 'Gypsym Technology',
      organizationLogo: resolvedLogo || undefined,
      organizationDescription: val.organizationDescription || 'High-performance e-commerce and digital systems engineering.',
      phone: val.phone || '+44 20 7946 0991',
      email: val.email || 'briefing@gypsym.com',
      address: val.address || '100 Bishopsgate, London EC2N 4AG, United Kingdom',
      country: val.country || 'United Kingdom',
      socialProfiles: val.socialProfiles || [
        { platform: 'LinkedIn', url: 'https://linkedin.com/company/gypsym' },
        { platform: 'X / Twitter', url: 'https://twitter.com/gypsymtech' },
        { platform: 'GitHub', url: 'https://github.com/gypsym' },
      ],
      defaultLanguage: val.defaultLanguage || 'en',
      defaultLocale: val.defaultLocale || 'en_US',
      timezone: val.timezone || 'UTC',
      metaTitleTemplate: val.metaTitleTemplate || legacy.metaTitleTemplate || '%s | Gypsym Technology',
      canonicalBaseUrl: val.canonicalBaseUrl || legacy.canonicalBaseUrl || 'https://gypsym.com',
      ogDefaultImage: val.ogDefaultImage || legacy.ogDefaultImage || 'https://gypsym.com/og-default.png',
      twitterCard: val.twitterCard || legacy.twitterCard || 'summary_large_image',
      twitterHandle: val.twitterHandle || legacy.twitterHandle || '@gypsymtech',
      robotsIndex: val.robotsIndex ?? legacy.robotsIndex ?? true,
      robotsFollow: val.robotsFollow ?? legacy.robotsFollow ?? true,
      googleVerification: val.googleVerification ?? legacy.googleVerification ?? '',
      bingVerification: val.bingVerification ?? legacy.bingVerification ?? '',
      yandexVerification: val.yandexVerification ?? legacy.yandexVerification ?? '',
      baiduVerification: val.baiduVerification ?? legacy.baiduVerification ?? '',
      googleAnalyticsId: val.googleAnalyticsId || '',
      gtmId: val.gtmId || '',
      metaPixelId: val.metaPixelId || '',
    };
  }

  async updateGlobalSeo(dto: GlobalSeoDto, user?: any): Promise<GlobalSeoDto> {
    const current = await this.getGlobalSeo();
    const merged = { ...current, ...dto };

    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:global' },
      create: {
        category: 'seo',
        key: 'seo:global',
        value: merged as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: merged as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    // Mirror to legacy seo:defaults for full compatibility
    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:defaults' },
      create: {
        category: 'seo',
        key: 'seo:defaults',
        value: {
          metaTitleTemplate: merged.metaTitleTemplate,
          defaultTitle: merged.defaultTitle,
          defaultDescription: merged.defaultDescription,
          defaultKeywords: merged.defaultKeywords,
          canonicalBaseUrl: merged.canonicalBaseUrl,
          ogDefaultImage: merged.ogDefaultImage,
          twitterCard: merged.twitterCard,
          twitterHandle: merged.twitterHandle,
          robotsIndex: merged.robotsIndex,
          robotsFollow: merged.robotsFollow,
          googleVerification: merged.googleVerification,
          bingVerification: merged.bingVerification,
          yandexVerification: merged.yandexVerification,
          baiduVerification: merged.baiduVerification,
        } as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: {
          metaTitleTemplate: merged.metaTitleTemplate,
          defaultTitle: merged.defaultTitle,
          defaultDescription: merged.defaultDescription,
          defaultKeywords: merged.defaultKeywords,
          canonicalBaseUrl: merged.canonicalBaseUrl,
          ogDefaultImage: merged.ogDefaultImage,
          twitterCard: merged.twitterCard,
          twitterHandle: merged.twitterHandle,
          robotsIndex: merged.robotsIndex,
          robotsFollow: merged.robotsFollow,
          googleVerification: merged.googleVerification,
          bingVerification: merged.bingVerification,
          yandexVerification: merged.yandexVerification,
          baiduVerification: merged.baiduVerification,
        } as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    // Record audit log
    if (user?.email) {
      await this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role || 'ADMIN',
          action: 'SEO_GLOBAL_UPDATED',
          resourceType: 'SeoSetting',
          resourceId: 'seo:global',
          diffSnapshot: { previous: current, updated: merged } as any,
        },
      }).catch(() => null);
    }

    return merged;
  }

  // ────────────────────────────────────────────────────────────
  // 2. SEO DASHBOARD (Real Measurable Audit Metrics)
  // ────────────────────────────────────────────────────────────
  async getDashboard(): Promise<any> {
    const [pages, services, portfolio, redirects, aeoSetting, geoSetting, robotsSetting, sitemapSetting] =
      await Promise.all([
        (this.prisma as any).page.findMany({
          where: { deletedAt: null },
          include: { seoMetadata: true },
        }),
        (this.prisma as any).service.findMany({
          where: { deletedAt: null },
          include: { seoMetadata: true },
        }),
        (this.prisma as any).portfolioProjectItem.findMany({
          where: { status: 'PUBLISHED' },
        }),
        this.getRedirects(),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:aeo' } }),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:geo' } }),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:robots' } }),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:sitemap' } }),
      ]);

    const allItems: Array<{ id: string; title: string; slug: string; type: string; seo: any }> = [
      ...pages.map((p: any) => ({ id: p.id, title: p.title, slug: p.slug, type: 'Page', seo: p.seoMetadata })),
      ...services.map((s: any) => ({ id: s.id, title: s.title, slug: `services/${s.slug}`, type: 'Service', seo: s.seoMetadata })),
      ...portfolio.map((pr: any) => ({ id: pr.id, title: pr.title, slug: `portfolio/${pr.slug}`, type: 'Portfolio', seo: null })),
    ];

    let missingTitles = 0;
    let missingDescriptions = 0;
    let missingCanonicals = 0;
    let missingOgImages = 0;
    let missingSchema = 0;
    let indexedPages = 0;
    let noindexPages = 0;

    const titleMap = new Map<string, string[]>();
    const descMap = new Map<string, string[]>();

    for (const item of allItems) {
      const title = (item.seo?.metaTitle || item.title || '').trim();
      const desc = (item.seo?.metaDescription || '').trim();
      const canonical = item.seo?.canonicalUrl;
      const og = item.seo?.ogTitle || item.seo?.ogImageId;
      const schema = item.seo?.structuredData;
      const isIndex = item.seo?.robotsIndex !== false;

      if (!title) missingTitles++;
      if (!desc) missingDescriptions++;
      if (!canonical) missingCanonicals++;
      if (!og) missingOgImages++;
      if (!schema) missingSchema++;

      if (isIndex) indexedPages++;
      else noindexPages++;

      if (title) {
        const arr = titleMap.get(title) || [];
        arr.push(item.slug);
        titleMap.set(title, arr);
      }

      if (desc) {
        const arr = descMap.get(desc) || [];
        arr.push(item.slug);
        descMap.set(desc, arr);
      }
    }

    const duplicateTitles = Array.from(titleMap.entries())
      .filter(([_, slugs]) => slugs.length > 1)
      .map(([title, slugs]) => ({ title, slugs, count: slugs.length }));

    const duplicateDescriptions = Array.from(descMap.entries())
      .filter(([_, slugs]) => slugs.length > 1)
      .map(([desc, slugs]) => ({ desc, slugs, count: slugs.length }));

    const aeoItems: AeoItemDto[] = Array.isArray((aeoSetting?.value as any))
      ? (aeoSetting?.value as unknown as AeoItemDto[])
      : [];
    const aeoCount = aeoItems.length;

    const geoVal = (geoSetting?.value as any) || {};
    const geoConfigured = Boolean(geoVal.brandName && geoVal.shortDescription);

    const robotsVal = (robotsSetting?.value as any) || {};
    const hasDangerousRobots = Array.isArray(robotsVal.rules) &&
      robotsVal.rules.some((r: any) => r.userAgent === '*' && Array.isArray(r.disallow) && r.disallow.includes('/'));

    const robotsStatus = hasDangerousRobots ? 'CRITICAL' : robotsSetting ? 'GOOD' : 'WARNING';
    const sitemapStatus = sitemapSetting ? 'GOOD' : 'WARNING';

    // Calculate measurable health score
    const totalChecks = allItems.length * 4;
    const passedChecks =
      (allItems.length - missingTitles) +
      (allItems.length - missingDescriptions) +
      (allItems.length - missingCanonicals) +
      (allItems.length - missingOgImages);
    const healthScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

    return {
      healthScore,
      status: healthScore >= 85 ? 'GOOD' : healthScore >= 60 ? 'WARNING' : 'CRITICAL',
      totalPages: pages.length,
      totalServices: services.length,
      totalPortfolio: portfolio.length,
      totalTrackedUrls: allItems.length,
      indexedPages,
      noindexPages,
      missingTitles,
      missingDescriptions,
      missingCanonicals,
      missingOgImages,
      missingSchema,
      missingAeo: Math.max(0, pages.length - aeoCount),
      missingGeo: geoConfigured ? 0 : 1,
      duplicateTitles,
      duplicateDescriptions,
      duplicateTitlesCount: duplicateTitles.length,
      duplicateDescriptionsCount: duplicateDescriptions.length,
      redirectCount: redirects.length,
      aeoCount,
      geoConfigured,
      sitemapStatus,
      robotsStatus,
      hasDangerousRobots,
    };
  }

  // ────────────────────────────────────────────────────────────
  // 3. PAGE-BY-PAGE SEO
  // ────────────────────────────────────────────────────────────
  async getPages(query?: { search?: string; status?: string; missingSeoOnly?: boolean }) {
    const pages = await (this.prisma as any).page.findMany({
      where: {
        deletedAt: null,
        ...(query?.status ? { status: query.status } : {}),
      },
      include: {
        seoMetadata: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    let result = pages.map((p: any) => {
      const seo = p.seoMetadata || {};
      const titleLen = (seo.metaTitle || p.title || '').length;
      const descLen = (seo.metaDescription || '').length;

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        status: p.status,
        layoutType: p.layoutType,
        updatedAt: p.updatedAt,
        seoMetadata: {
          metaTitle: seo.metaTitle || null,
          metaDescription: seo.metaDescription || null,
          canonicalUrl: seo.canonicalUrl || null,
          robotsIndex: seo.robotsIndex ?? true,
          robotsFollow: seo.robotsFollow ?? true,
          ogTitle: seo.ogTitle || null,
          ogDescription: seo.ogDescription || null,
          ogImageUrl: seo.ogImageUrl || null,
          twitterCard: seo.twitterCard || 'summary_large_image',
          structuredData: seo.structuredData || null,
        },
        audit: {
          hasTitle: Boolean(seo.metaTitle || p.title),
          titleLength: titleLen,
          titleStatus: titleLen >= 40 && titleLen <= 65 ? 'GOOD' : titleLen > 0 ? 'WARNING' : 'CRITICAL',
          hasDescription: Boolean(seo.metaDescription),
          descriptionLength: descLen,
          descriptionStatus: descLen >= 120 && descLen <= 165 ? 'GOOD' : descLen > 0 ? 'WARNING' : 'CRITICAL',
          hasCanonical: Boolean(seo.canonicalUrl),
          hasOg: Boolean(seo.ogTitle || seo.ogImageUrl),
          isIndexable: seo.robotsIndex !== false,
        },
      };
    });

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter((p: any) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }

    if (query?.missingSeoOnly) {
      result = result.filter((p: any) => !p.seoMetadata.metaTitle || !p.seoMetadata.metaDescription);
    }

    return result;
  }

  async getPageSeo(pageId: string) {
    const page = await (this.prisma as any).page.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });

    if (!page) {
      throw new NotFoundException(`Page '${pageId}' not found`);
    }

    return page;
  }

  async updatePageSeo(pageId: string, dto: any, user?: any) {
    const page = await (this.prisma as any).page.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });

    if (!page) {
      throw new NotFoundException(`Page '${pageId}' not found`);
    }

    const seoData = {
      metaTitle: dto.metaTitle || page.title,
      metaDescription: dto.metaDescription || '',
      canonicalUrl: dto.canonicalUrl || null,
      robotsIndex: dto.robotsIndex ?? true,
      robotsFollow: dto.robotsFollow ?? true,
      ogTitle: dto.ogTitle || null,
      ogDescription: dto.ogDescription || null,
      twitterCard: dto.twitterCard || 'summary_large_image',
      structuredData: dto.structuredData || null,
    };

    let updatedSeo: any;

    if (page.seoMetadata) {
      updatedSeo = await (this.prisma as any).seoMetadata.update({
        where: { id: page.seoMetadata.id },
        data: seoData,
      });
    } else {
      updatedSeo = await (this.prisma as any).seoMetadata.create({
        data: {
          ...seoData,
          pageId: page.id,
        },
      });
    }

    // Touch page updated_at
    await (this.prisma as any).page.update({
      where: { id: page.id },
      data: { updatedAt: new Date() },
    });

    // Record audit log
    if (user?.email) {
      await this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role || 'ADMIN',
          action: 'PAGE_SEO_UPDATED',
          resourceType: 'PageSeo',
          resourceId: page.id,
          diffSnapshot: { slug: page.slug, seo: seoData } as any,
        },
      }).catch(() => null);
    }

    return { ...page, seoMetadata: updatedSeo };
  }

  // ────────────────────────────────────────────────────────────
  // 4. SEO TEMPLATES
  // ────────────────────────────────────────────────────────────
  async getTemplates(): Promise<SeoTemplatesDto> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:templates' },
    });

    const defaults: SeoTemplatesDto = {
      pageTitleTemplate: '{pageTitle} | {siteName}',
      serviceTitleTemplate: '{serviceName} | {siteName}',
      portfolioTitleTemplate: '{projectName} | {siteName}',
      categoryTitleTemplate: '{categoryName} Case Studies | {siteName}',
      blogTitleTemplate: '{postTitle} | {siteName}',
      pageDescTemplate: '{description}',
      serviceDescTemplate: '{description}',
      portfolioDescTemplate: '{description}',
    };

    if (!row) return defaults;
    return { ...defaults, ...(row.value as Record<string, any>) };
  }

  async updateTemplates(dto: SeoTemplatesDto, user?: any): Promise<SeoTemplatesDto> {
    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:templates' },
      create: {
        category: 'seo',
        key: 'seo:templates',
        value: dto as any,
        isPublic: false,
        updatedBy: user?.id,
      },
      update: {
        value: dto as any,
        updatedBy: user?.id,
      },
    });

    if (user?.email) {
      await this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role || 'ADMIN',
          action: 'SEO_TEMPLATES_UPDATED',
          resourceType: 'SeoSetting',
          resourceId: 'seo:templates',
          diffSnapshot: dto as any,
        },
      }).catch(() => null);
    }

    return dto;
  }

  // ────────────────────────────────────────────────────────────
  // 5. ROBOTS.TXT MANAGEMENT
  // ────────────────────────────────────────────────────────────
  async getRobotsConfig(): Promise<RobotsConfigDto> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:robots' },
    });

    const globalSeo = await this.getGlobalSeo();
    const siteUrl = globalSeo.siteUrl || 'https://gypsym.com';

    const defaults: RobotsConfigDto = {
      rules: [
        {
          userAgent: '*',
          allow: ['/'],
          disallow: ['/api/', '/admin/'],
        },
        {
          userAgent: 'GPTBot',
          allow: ['/'],
          disallow: ['/api/', '/admin/'],
        },
        {
          userAgent: 'Claude-Web',
          allow: ['/'],
          disallow: ['/api/', '/admin/'],
        },
      ],
      sitemapUrl: `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`,
    };

    if (!row) return defaults;
    const val = row.value as Record<string, any>;
    return {
      rules: val.rules || defaults.rules,
      sitemapUrl: val.sitemapUrl || defaults.sitemapUrl,
      customText: val.customText || '',
    };
  }

  async updateRobotsConfig(dto: RobotsConfigDto, user?: any): Promise<RobotsConfigDto> {
    const isBlockingAll = dto.rules.some(
      (r) => r.userAgent === '*' && r.disallow.includes('/') && (!r.allow || r.allow.length === 0)
    );

    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:robots' },
      create: {
        category: 'seo',
        key: 'seo:robots',
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    if (user?.email) {
      await this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role || 'ADMIN',
          action: isBlockingAll ? 'ROBOTS_TXT_BLOCK_ALL_WARNING' : 'ROBOTS_TXT_UPDATED',
          resourceType: 'SeoSetting',
          resourceId: 'seo:robots',
          diffSnapshot: { isBlockingAll, ...dto } as any,
        },
      }).catch(() => null);
    }

    return dto;
  }

  // ────────────────────────────────────────────────────────────
  // 6. XML SITEMAP CONFIG
  // ────────────────────────────────────────────────────────────
  async getSitemapConfig(): Promise<SitemapConfigDto> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:sitemap' },
    });

    const defaults: SitemapConfigDto = {
      includePages: true,
      includeServices: true,
      includePortfolio: true,
      includeCategories: true,
      includeBlog: true,
      excludedSlugs: ['admin', 'login', 'dashboard', '404', '500'],
      defaultChangefreq: 'weekly',
      defaultPriority: 0.8,
    };

    if (!row) return defaults;
    return { ...defaults, ...(row.value as Record<string, any>) };
  }

  async updateSitemapConfig(dto: SitemapConfigDto, user?: any): Promise<SitemapConfigDto> {
    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:sitemap' },
      create: {
        category: 'seo',
        key: 'seo:sitemap',
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    return dto;
  }

  // ────────────────────────────────────────────────────────────
  // 7. REDIRECTS MANAGEMENT (301, 302, 307, 308)
  // ────────────────────────────────────────────────────────────
  async getRedirects(): Promise<RedirectDto[]> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:redirects' },
    });

    if (!row || !Array.isArray(row.value)) return [];
    return row.value as unknown as RedirectDto[];
  }

  async saveRedirects(redirects: RedirectDto[], user?: any): Promise<RedirectDto[]> {
    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:redirects' },
      create: {
        category: 'seo',
        key: 'seo:redirects',
        value: redirects as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: redirects as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    if (user?.email) {
      await this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role || 'ADMIN',
          action: 'REDIRECTS_UPDATED',
          resourceType: 'SeoSetting',
          resourceId: 'seo:redirects',
          diffSnapshot: { totalRedirects: redirects.length } as any,
        },
      }).catch(() => null);
    }

    return redirects;
  }

  async createRedirect(dto: Omit<RedirectDto, 'id' | 'createdAt' | 'updatedAt'>, user?: any): Promise<RedirectDto> {
    let source = dto.sourceUrl.trim();
    let target = dto.targetUrl.trim();

    if (!source.startsWith('/')) source = `/${source}`;
    if (!target.startsWith('/') && !target.startsWith('http')) target = `/${target}`;

    if (source.toLowerCase() === target.toLowerCase()) {
      throw new BadRequestException('Source and target URLs cannot be identical');
    }

    const current = await this.getRedirects();

    // Check loop
    const wouldLoop = current.some(
      (r) => r.isActive && r.sourceUrl.toLowerCase() === target.toLowerCase() && r.targetUrl.toLowerCase() === source.toLowerCase()
    );
    if (wouldLoop) {
      throw new BadRequestException('This redirect would create an infinite redirect loop with an existing rule');
    }

    const newRedirect: RedirectDto = {
      id: `redir_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sourceUrl: source,
      targetUrl: target,
      statusCode: [301, 302, 307, 308].includes(Number(dto.statusCode)) ? Number(dto.statusCode) : 301,
      isActive: dto.isActive !== false,
      notes: dto.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newRedirect, ...current.filter((r) => r.sourceUrl.toLowerCase() !== source.toLowerCase())];
    await this.saveRedirects(updated, user);
    return newRedirect;
  }

  async updateRedirect(id: string, dto: Partial<RedirectDto>, user?: any): Promise<RedirectDto> {
    const current = await this.getRedirects();
    const index = current.findIndex((r) => r.id === id);
    if (index === -1 || !current[index]) {
      throw new NotFoundException(`Redirect rule '${id}' not found`);
    }

    const existing = current[index];
    const source = (dto.sourceUrl ?? existing.sourceUrl).trim();
    const target = (dto.targetUrl ?? existing.targetUrl).trim();

    if (source.toLowerCase() === target.toLowerCase()) {
      throw new BadRequestException('Source and target URLs cannot be identical');
    }

    const updatedItem: RedirectDto = {
      ...existing,
      ...dto,
      id: existing.id,
      sourceUrl: source,
      targetUrl: target,
      statusCode: Number(dto.statusCode ?? existing.statusCode),
      isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    current[index] = updatedItem;
    await this.saveRedirects(current, user);
    return updatedItem;
  }

  async deleteRedirect(id: string, user?: any): Promise<{ success: boolean }> {
    const current = await this.getRedirects();
    const filtered = current.filter((r) => r.id !== id);
    await this.saveRedirects(filtered, user);
    return { success: true };
  }

  // ────────────────────────────────────────────────────────────
  // 8. AEO (ANSWER ENGINE OPTIMIZATION)
  // ────────────────────────────────────────────────────────────
  async getAeoItems(): Promise<AeoItemDto[]> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:aeo' },
    });

    if (!row || !Array.isArray(row.value)) return [];
    return row.value as unknown as AeoItemDto[];
  }

  async saveAeoItems(items: AeoItemDto[], user?: any): Promise<AeoItemDto[]> {
    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:aeo' },
      create: {
        category: 'seo',
        key: 'seo:aeo',
        value: items as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: items as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    return items;
  }

  async createAeoItem(dto: Omit<AeoItemDto, 'id'>, user?: any): Promise<AeoItemDto> {
    const current = await this.getAeoItems();
    const newItem: AeoItemDto = {
      id: `aeo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      question: dto.question.trim(),
      shortAnswer: dto.shortAnswer.trim(),
      detailedAnswer: dto.detailedAnswer?.trim() || '',
      relatedPageSlug: dto.relatedPageSlug || '',
      relatedServiceSlug: dto.relatedServiceSlug || '',
      topic: dto.topic?.trim() || 'General',
      entity: dto.entity?.trim() || 'Gypsym Technology',
      priority: dto.priority || 'MEDIUM',
      status: dto.status || 'PUBLISHED',
      displayOrder: dto.displayOrder ?? current.length + 1,
    };

    const updated = [...current, newItem];
    await this.saveAeoItems(updated, user);
    return newItem;
  }

  async updateAeoItem(id: string, dto: Partial<AeoItemDto>, user?: any): Promise<AeoItemDto> {
    const current = await this.getAeoItems();
    const index = current.findIndex((i) => i.id === id);
    if (index === -1 || !current[index]) {
      throw new NotFoundException(`AEO item '${id}' not found`);
    }

    const existing = current[index];
    const updatedItem: AeoItemDto = {
      ...existing,
      ...dto,
      id: existing.id,
      question: dto.question ? dto.question.trim() : existing.question,
      shortAnswer: dto.shortAnswer ? dto.shortAnswer.trim() : existing.shortAnswer,
    };
    current[index] = updatedItem;
    await this.saveAeoItems(current, user);
    return updatedItem;
  }

  async deleteAeoItem(id: string, user?: any): Promise<{ success: boolean }> {
    const current = await this.getAeoItems();
    const filtered = current.filter((i) => i.id !== id);
    await this.saveAeoItems(filtered, user);
    return { success: true };
  }

  // ────────────────────────────────────────────────────────────
  // 9. GEO (GENERATIVE ENGINE OPTIMIZATION)
  // ────────────────────────────────────────────────────────────
  async getGeoProfile(): Promise<GeoProfileDto> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:geo' },
    });

    const globalSeo = await this.getGlobalSeo();

    const defaults: GeoProfileDto = {
      brandName: globalSeo.siteName || 'Gypsym Technology',
      legalName: 'Gypsym Technology Ltd.',
      shortDescription: globalSeo.siteDescription || 'Custom Shopify Plus store development and enterprise e-commerce solutions.',
      longDescription: 'Gypsym Technology is an enterprise software engineering and high-frequency commerce agency specializing in Shopify Plus custom development, conversion rate optimization, headless commerce, and resilient infrastructure for global consumer brands.',
      industry: 'Enterprise Software & E-Commerce Engineering',
      foundedYear: '2020',
      headquarters: globalSeo.address || '100 Bishopsgate, London EC2N 4AG, United Kingdom',
      serviceAreas: ['North America', 'United Kingdom', 'European Union', 'Australia & APAC', 'Middle East'],
      websiteUrl: globalSeo.siteUrl || 'https://gypsym.com',
      contactEmail: globalSeo.email || 'briefing@gypsym.com',
      contactPhone: globalSeo.phone || '+44 20 7946 0991',
      socialProfiles: globalSeo.socialProfiles || [],
      founderInfo: 'Founded by senior systems engineers and distributed architecture experts.',
      keyDifferentiators: [
        'Zero-downtime architecture SLA',
        '+318% average volume surge capacity',
        '42ms median Time to First Byte (TTFB)',
        'Enterprise-grade multi-currency and global partitioning',
      ],
      topicalEntities: [
        { name: 'Shopify Plus Development', type: 'Service', description: 'Enterprise-grade custom theme, checkout extensibility, and app engineering.' },
        { name: 'Headless E-Commerce', type: 'Architecture', description: 'Next.js, Hydrogen, and high-concurrency microservices.' },
        { name: 'Conversion Rate Optimization', type: 'Practice', description: 'Empirical multivariate testing and latency reduction.' },
      ],
    };

    if (!row) return defaults;
    return { ...defaults, ...(row.value as Record<string, any>) };
  }

  async updateGeoProfile(dto: GeoProfileDto, user?: any): Promise<GeoProfileDto> {
    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:geo' },
      create: {
        category: 'seo',
        key: 'seo:geo',
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    if (user?.email) {
      await this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role || 'ADMIN',
          action: 'GEO_PROFILE_UPDATED',
          resourceType: 'SeoSetting',
          resourceId: 'seo:geo',
          diffSnapshot: dto as any,
        },
      }).catch(() => null);
    }

    return dto;
  }

  // ────────────────────────────────────────────────────────────
  // 10. HREFLANG CONFIG
  // ────────────────────────────────────────────────────────────
  async getHreflangConfig(): Promise<{ locales: HreflangLocaleDto[] }> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:hreflang' },
    });

    const defaults: { locales: HreflangLocaleDto[] } = {
      locales: [
        { code: 'en', name: 'English (Global)', hreflangCode: 'en', isDefault: true },
        { code: 'en-us', name: 'English (United States)', hreflangCode: 'en-US' },
        { code: 'en-gb', name: 'English (United Kingdom)', hreflangCode: 'en-GB' },
        { code: 'en-au', name: 'English (Australia)', hreflangCode: 'en-AU' },
        { code: 'en-ca', name: 'English (Canada)', hreflangCode: 'en-CA' },
        { code: 'de', name: 'German (Germany)', hreflangCode: 'de-DE' },
      ],
    };

    if (!row) return defaults;
    return { ...defaults, ...(row.value as Record<string, any>) };
  }

  async updateHreflangConfig(dto: { locales: HreflangLocaleDto[] }, user?: any) {
    await this.prisma.siteSetting.upsert({
      where: { key: 'seo:hreflang' },
      create: {
        category: 'seo',
        key: 'seo:hreflang',
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
      update: {
        value: dto as any,
        isPublic: true,
        updatedBy: user?.id,
      },
    });

    return dto;
  }

  // ────────────────────────────────────────────────────────────
  // 11. ON-PAGE AUDIT CALCULATOR
  // ────────────────────────────────────────────────────────────
  async auditPage(pageId: string) {
    const page = await (this.prisma as any).page.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });

    if (!page) {
      throw new NotFoundException(`Page '${pageId}' not found`);
    }

    const seo = page.seoMetadata || {};
    const title = (seo.metaTitle || page.title || '').trim();
    const desc = (seo.metaDescription || '').trim();
    const canonical = seo.canonicalUrl;
    const ogTitle = seo.ogTitle;
    const ogImage = seo.ogImageId;
    const isIndexable = seo.robotsIndex !== false;
    const schema = seo.structuredData;

    const issues: Array<{ type: 'CRITICAL' | 'WARNING' | 'GOOD'; message: string; field: string }> = [];

    // Title Check
    if (!title) {
      issues.push({ type: 'CRITICAL', message: 'SEO Title is missing.', field: 'metaTitle' });
    } else if (title.length < 30) {
      issues.push({ type: 'WARNING', message: `Title is short (${title.length} chars). Recommended: 50-60 characters.`, field: 'metaTitle' });
    } else if (title.length > 65) {
      issues.push({ type: 'WARNING', message: `Title exceeds 65 characters (${title.length} chars). May be truncated in search results.`, field: 'metaTitle' });
    } else {
      issues.push({ type: 'GOOD', message: `Title length is optimal (${title.length} chars).`, field: 'metaTitle' });
    }

    // Description Check
    if (!desc) {
      issues.push({ type: 'CRITICAL', message: 'Meta Description is missing.', field: 'metaDescription' });
    } else if (desc.length < 70) {
      issues.push({ type: 'WARNING', message: `Description is short (${desc.length} chars). Recommended: 120-160 characters.`, field: 'metaDescription' });
    } else if (desc.length > 165) {
      issues.push({ type: 'WARNING', message: `Description exceeds 165 characters (${desc.length} chars). May be truncated in search snippets.`, field: 'metaDescription' });
    } else {
      issues.push({ type: 'GOOD', message: `Description length is optimal (${desc.length} chars).`, field: 'metaDescription' });
    }

    // Canonical Check
    if (!canonical) {
      issues.push({ type: 'WARNING', message: 'No custom canonical URL set. Will fall back to auto-generated normalized URL.', field: 'canonicalUrl' });
    } else {
      issues.push({ type: 'GOOD', message: 'Explicit Canonical URL configured.', field: 'canonicalUrl' });
    }

    // Open Graph Check
    if (!ogTitle && !title) {
      issues.push({ type: 'WARNING', message: 'Open Graph title is not set.', field: 'ogTitle' });
    } else {
      issues.push({ type: 'GOOD', message: 'Social title is configured.', field: 'ogTitle' });
    }

    if (!ogImage) {
      issues.push({ type: 'WARNING', message: 'Dedicated OG Image is missing. Will use global fallback image.', field: 'ogImage' });
    } else {
      issues.push({ type: 'GOOD', message: 'Custom OG Image attached.', field: 'ogImage' });
    }

    // Structured Data Check
    if (!schema) {
      issues.push({ type: 'WARNING', message: 'No custom JSON-LD schema defined for this page.', field: 'structuredData' });
    } else {
      issues.push({ type: 'GOOD', message: 'Custom Structured Data is configured.', field: 'structuredData' });
    }

    // Indexability
    if (!isIndexable) {
      issues.push({ type: 'WARNING', message: 'This page is configured as NOINDEX. Search engines will not index it.', field: 'robotsIndex' });
    } else {
      issues.push({ type: 'GOOD', message: 'Page is configured to be indexed (INDEX, FOLLOW).', field: 'robotsIndex' });
    }

    const criticalCount = issues.filter((i) => i.type === 'CRITICAL').length;
    const warningCount = issues.filter((i) => i.type === 'WARNING').length;
    const score = Math.max(0, 100 - criticalCount * 30 - warningCount * 10);

    return {
      pageId: page.id,
      title: page.title,
      slug: page.slug,
      score,
      status: score >= 80 ? 'GOOD' : score >= 50 ? 'WARNING' : 'CRITICAL',
      issues,
    };
  }

  // ────────────────────────────────────────────────────────────
  // 12. PUBLIC SSR ENDPOINTS (Consumed by Next.js apps/web)
  // ────────────────────────────────────────────────────────────
  async getPublicGlobalSeo() {
    return this.getGlobalSeo();
  }

  async getPublicSitemapUrls() {
    const [config, globalSeo, pages, services, portfolio] = await Promise.all([
      this.getSitemapConfig(),
      this.getGlobalSeo(),
      (this.prisma as any).page.findMany({
        where: { deletedAt: null, status: 'PUBLISHED' },
        include: { seoMetadata: true },
      }),
      (this.prisma as any).service.findMany({
        where: { deletedAt: null, status: 'PUBLISHED' },
        include: { seoMetadata: true },
      }),
      (this.prisma as any).portfolioProjectItem.findMany({
        where: { status: 'PUBLISHED' },
      }),
    ]);

    const baseUrl = (globalSeo.siteUrl || 'https://gypsym.com').replace(/\/+$/, '');
    const excluded = new Set((config.excludedSlugs || []).map((s) => s.toLowerCase().trim()));

    const urls: Array<{ url: string; lastModified: Date; changeFrequency: string; priority: number }> = [];

    // 1. Pages
    if (config.includePages) {
      for (const p of pages) {
        if (p.seoMetadata?.robotsIndex === false) continue;
        const slug = p.slug === 'home' ? '' : p.slug;
        if (excluded.has(p.slug.toLowerCase())) continue;

        urls.push({
          url: slug ? `${baseUrl}/${slug}` : baseUrl,
          lastModified: p.updatedAt || new Date(),
          changeFrequency: slug === '' ? 'daily' : config.defaultChangefreq || 'weekly',
          priority: slug === '' ? 1.0 : config.defaultPriority || 0.8,
        });
      }
    }

    // 2. Services
    if (config.includeServices) {
      for (const s of services) {
        if (s.seoMetadata?.robotsIndex === false) continue;
        if (excluded.has(`services/${s.slug}`.toLowerCase())) continue;

        urls.push({
          url: `${baseUrl}/services/${s.slug}`,
          lastModified: s.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
        });
      }
    }

    // 3. Portfolio
    if (config.includePortfolio) {
      for (const pr of portfolio) {
        if (excluded.has(`portfolio/${pr.slug}`.toLowerCase())) continue;

        urls.push({
          url: `${baseUrl}/portfolio/${pr.slug}`,
          lastModified: pr.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    return urls;
  }

  async getPublicRobotsRules() {
    return this.getRobotsConfig();
  }

  async getPublicRedirects() {
    const redirects = await this.getRedirects();
    return redirects.filter((r) => r.isActive);
  }

  async getPublicAeoForPage(pageSlug?: string) {
    const items = await this.getAeoItems();
    const published = items.filter((i) => i.status === 'PUBLISHED');

    if (!pageSlug) return published;

    return published.filter(
      (i) => !i.relatedPageSlug || i.relatedPageSlug.toLowerCase() === pageSlug.toLowerCase()
    );
  }
}
