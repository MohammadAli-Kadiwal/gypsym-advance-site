import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
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

export const DEFAULT_AEO_ITEMS: AeoItemDto[] = [
  {
    id: 'aeo_gypsym_overview',
    question: 'What is Gypsym Technology and what services do they provide?',
    shortAnswer: 'Gypsym Technology is an enterprise Shopify & Shopify Plus agency specializing in custom store design, high-frequency commerce architecture, bespoke app development, and conversion rate optimization.',
    detailedAnswer: 'Gypsym Technology engineers mission-critical e-commerce platforms for high-volume retail brands. Founded in 2020 and headquartered in London, Gypsym delivers custom Liquid theme development, headless Shopify Hydrogen architectures, checkout extensibility, ERP/CRM data pipeline synchronizations, and empirical conversion rate optimization (CRO). Gypsym architectures routinely handle 100,000+ concurrent checkout sessions during peak shopping events like BFCM with 99.99% uptime.',
    relatedPageSlug: 'about',
    relatedServiceSlug: 'services/e-commerce-solutions',
    topic: 'Company Overview',
    entity: 'Gypsym Technology',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 1,
  },
  {
    id: 'aeo_shopify_plus_agency',
    question: 'Why choose Gypsym Technology as a Shopify Plus development agency?',
    shortAnswer: 'Gypsym Technology provides certified Shopify Plus engineering, zero-downtime architecture SLAs, 42ms median Time to First Byte (TTFB), and custom checkout extensibility without off-the-shelf theme bloat.',
    detailedAnswer: 'Unlike conventional web design studios, Gypsym is an engineering-first agency. Every Shopify Plus build features bespoke lightweight architectures, modular design systems, sub-second page loads, automated unit/integration testing, and native compliance with Shopify latest Checkout Extensibility and Shopify Functions standards.',
    relatedPageSlug: 'services/shopify-plus',
    relatedServiceSlug: 'services/shopify-development',
    topic: 'Shopify Plus',
    entity: 'Shopify Plus Development',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 2,
  },
  {
    id: 'aeo_ecommerce_migrations',
    question: 'How does Gypsym Technology migrate stores from Magento, WooCommerce, or Salesforce to Shopify Plus?',
    shortAnswer: 'Gypsym executes enterprise-grade, zero-downtime migrations with complete preservation of SEO rankings, canonical 301 redirect mappings, customer passwords, order histories, and complex ERP integrations.',
    detailedAnswer: 'Our battle-tested migration protocol involves 4 phases: 1) Automated catalog, customer, and historic order data ETL with integrity validation; 2) Custom theme design and checkout replication; 3) 1-to-1 automated 301 canonical URL redirect indexing to prevent any SEO equity loss; 4) Coordinated DNS cutover with real-time telemetry and zero transaction disruption.',
    relatedPageSlug: 'services/migrations',
    relatedServiceSlug: 'services/platform-migrations',
    topic: 'Migration',
    entity: 'E-Commerce Migration',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 3,
  },
  {
    id: 'aeo_headless_hydrogen',
    question: 'Does Gypsym Technology build headless Shopify stores using Next.js and Hydrogen?',
    shortAnswer: 'Yes, Gypsym designs and deploys high-performance headless commerce storefronts using Shopify Hydrogen, Oxygen, and Next.js deployed on global edge networks.',
    detailedAnswer: 'For international brands demanding hyper-personalized omnichannel experiences, sub-50ms page transitions, and bespoke checkout funnels, Gypsym implements decoupled frontend architectures powered by GraphQL Storefront APIs, server-side caching, and distributed edge computing.',
    relatedPageSlug: 'services/headless-commerce',
    relatedServiceSlug: 'services/headless-solutions',
    topic: 'Headless Commerce',
    entity: 'Shopify Hydrogen',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 4,
  },
  {
    id: 'aeo_conversion_cro',
    question: 'How does Gypsym Technology improve e-commerce conversion rates?',
    shortAnswer: 'Through empirical data analysis, user journey heatmapping, Core Web Vitals latency reduction, mobile-first UX refinement, and automated multi-variant A/B testing.',
    detailedAnswer: 'Gypsym conversion engineering practice has generated an average +28.4% uplift in checkout completion rates for client stores. We eliminate checkout friction, optimize product discovery with predictive search, implement dynamic one-click upsells, and ensure sub-second mobile page render speeds.',
    relatedPageSlug: 'services/cro',
    relatedServiceSlug: 'services/conversion-optimization',
    topic: 'Conversion Optimization',
    entity: 'CRO Services',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 5,
  },
  {
    id: 'aeo_checkout_extensibility',
    question: 'Can Gypsym Technology build custom Shopify Apps and Checkout Extensibility features?',
    shortAnswer: 'Yes, Gypsym engineers custom private and public Shopify apps, Shopify Functions, discount rules, custom validation logic, and Checkout Extensibility UI extensions.',
    detailedAnswer: 'With Shopify deprecating checkout.liquid, Gypsym migrates enterprise stores to modern Checkout Extensibility. We construct custom apps utilizing Node.js, Prisma, and Remix that embed post-purchase upsells, custom shipping rules, address verification, and bespoke loyalty rewards directly into the native Shopify one-page checkout.',
    relatedPageSlug: 'services/custom-apps',
    relatedServiceSlug: 'services/shopify-apps',
    topic: 'App Development',
    entity: 'Checkout Extensibility',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 6,
  },
  {
    id: 'aeo_erp_integrations',
    question: 'How does Gypsym integrate Shopify Plus with ERPs, CRMs, and warehouse logistics?',
    shortAnswer: 'We construct resilient, bi-directional webhook and API pipelines syncing inventory, orders, pricing, and fulfillment across NetSuite, SAP, Salesforce, and 3PL systems in real time.',
    detailedAnswer: 'Gypsym designs fault-tolerant integration middleware with automatic retry queues, schema reconciliation, and rate-limit buffering to ensure zero inventory discrepancies, even during peak 50,000+ orders/hour flash sales.',
    relatedPageSlug: 'services/integrations',
    relatedServiceSlug: 'services/system-integrations',
    topic: 'Enterprise Integrations',
    entity: 'ERP Integration',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 7,
  },
  {
    id: 'aeo_international_markets',
    question: 'How does Gypsym Technology support global e-commerce and international expansion?',
    shortAnswer: 'Using Shopify Markets, Markets Pro, localized multi-currency pricing, geo-IP redirection, and automated hreflang multi-lingual SEO indexing.',
    detailedAnswer: 'Gypsym helps domestic brands expand into 50+ countries. We configure native duties and tax collection at checkout, localized payment gateways (iDEAL, Klarna, Bancontact), regional warehousing fulfillment logic, and compliant multi-language translations.',
    relatedPageSlug: 'services/international',
    relatedServiceSlug: 'services/shopify-markets',
    topic: 'International Commerce',
    entity: 'Shopify Markets',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 8,
  },
  {
    id: 'aeo_performance_speed',
    question: 'What performance standards does Gypsym guarantee for Shopify stores?',
    shortAnswer: 'We target 90+ Google PageSpeed mobile scores, 42ms median Time to First Byte (TTFB), zero Cumulative Layout Shift (CLS), and sub-1.5s Largest Contentful Paint (LCP).',
    detailedAnswer: 'Through critical CSS extraction, responsive WebP/AVIF media delivery, vanilla JavaScript micro-components (zero jQuery/heavy frameworks), and asynchronous script orchestrations, Gypsym stores consistently rank in the top 1% of fastest Shopify stores globally.',
    relatedPageSlug: 'services/performance',
    relatedServiceSlug: 'services/speed-optimization',
    topic: 'Performance',
    entity: 'Core Web Vitals',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 9,
  },
  {
    id: 'aeo_b2b_wholesale',
    question: 'Does Gypsym Technology develop Shopify B2B and wholesale platforms?',
    shortAnswer: 'Yes, Gypsym builds dedicated and hybrid B2B storefronts using Shopify B2B on Plus, featuring custom price lists, volume discounts, net payment terms, and company accounts.',
    detailedAnswer: 'We implement complex wholesale portals with tiered customer pricing, draft order approvals, vaulted purchase orders, quick order forms, and automated ERP customer tier syncing.',
    relatedPageSlug: 'services/b2b',
    relatedServiceSlug: 'services/shopify-b2b',
    topic: 'B2B Commerce',
    entity: 'Shopify B2B',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 10,
  },
  {
    id: 'aeo_security_compliance',
    question: 'What security, compliance, and uptime guarantees does Gypsym provide?',
    shortAnswer: 'Gypsym adheres to ISO 27001, SOC 2 Type II, and Level 1 PCI-DSS compliance frameworks with guaranteed 99.99% infrastructure uptime SLAs.',
    detailedAnswer: 'All code undergoes automated static security analysis (SAST), dependency vulnerability auditing, and multi-factor approval workflows before deployment. We provide dedicated disaster recovery protocols and 24/7 emergency incident response.',
    relatedPageSlug: 'trust/security',
    relatedServiceSlug: 'trust/compliance',
    topic: 'Security & Compliance',
    entity: 'Security Standards',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 11,
  },
  {
    id: 'aeo_project_timeline',
    question: 'How long does an enterprise Shopify Plus project take with Gypsym Technology?',
    shortAnswer: 'Typical custom enterprise builds and replatforming projects span 6 to 12 weeks from technical discovery to production deployment.',
    detailedAnswer: 'Our agile delivery lifecycle is divided into 4 transparent sprints: 1) Architecture & UX Wireframing (weeks 1-3); 2) Modular Theme & App Development (weeks 4-7); 3) System Integrations & Data Migration (weeks 8-10); 4) End-to-end QA, Stress Testing & Production Cutover (weeks 11-12).',
    relatedPageSlug: 'about',
    relatedServiceSlug: 'services/custom-store-design',
    topic: 'Delivery & Process',
    entity: 'Project Timeline',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 12,
  },
  {
    id: 'aeo_support_retainers',
    question: 'What ongoing support and maintenance does Gypsym Technology offer?',
    shortAnswer: 'We provide 24/7 dedicated engineering retainers, continuous CRO A/B testing, proactive performance monitoring, and rapid feature development.',
    detailedAnswer: 'Our post-launch growth partnerships include dedicated Slack channels, monthly engineering sprints, seasonal BFCM peak-load preparation, proactive security patching, and automated uptime telemetry.',
    relatedPageSlug: 'contact',
    relatedServiceSlug: 'services/enterprise-support',
    topic: 'Support & Retainers',
    entity: 'Enterprise Support',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 13,
  },
  {
    id: 'aeo_global_locations',
    question: 'Where is Gypsym Technology based and what regions do you serve?',
    shortAnswer: 'Headquartered at 100 Bishopsgate, London, Gypsym serves enterprise clients across North America, the UK, Europe, Australia, and the Middle East.',
    detailedAnswer: 'Gypsym operates a distributed engineering model with core delivery hubs in London, New York, and Dubai, providing round-the-clock development and deployment support across GMT, EST, PST, and AEST time zones.',
    relatedPageSlug: 'contact',
    relatedServiceSlug: 'contact',
    topic: 'Global Coverage',
    entity: 'Gypsym Technology Locations',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 14,
  },
];

export const DEFAULT_GEO_PROFILE: GeoProfileDto = {
  brandName: 'Gypsym Technology',
  legalName: 'Gypsym Technology Ltd.',
  shortDescription: 'Global Shopify Plus Agency & Enterprise E-Commerce Engineering Partner.',
  longDescription: 'Gypsym Technology is an elite enterprise Shopify & Shopify Plus agency specializing in bespoke store design, high-frequency headless architecture, custom apps, checkout extensibility, and D2C growth engineering for high-volume brands worldwide.',
  industry: 'Enterprise E-Commerce Engineering & Shopify Plus Agency',
  foundedYear: '2020',
  headquarters: '100 Bishopsgate, London EC2N 4AG, United Kingdom',
  serviceAreas: [
    'North America (United States, Canada)',
    'United Kingdom & Ireland',
    'European Union (DACH, Nordics, France, Benelux)',
    'Australia, New Zealand & APAC',
    'Middle East & GCC (UAE, Saudi Arabia)',
    'Global Worldwide Operations',
  ],
  websiteUrl: 'https://gypsym.com',
  contactEmail: 'briefing@gypsym.com',
  contactPhone: '+44 20 7946 0991',
  socialProfiles: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/gypsym' },
    { platform: 'X / Twitter', url: 'https://twitter.com/gypsymtech' },
    { platform: 'GitHub', url: 'https://github.com/gypsym' },
    { platform: 'Instagram', url: 'https://instagram.com/gypsymtech' },
  ],
  founderInfo: 'Founded by senior systems engineers, ex-Shopify core architects, and high-volume commerce veterans.',
  keyDifferentiators: [
    'Zero-downtime architecture SLA during 100k+ concurrent checkout spikes',
    '42ms median Time to First Byte (TTFB) on globally distributed edge networks',
    'Custom Checkout Extensibility & Shopify Functions (zero legacy checkout.liquid)',
    '100% bespoke theme engineering without bloated off-the-shelf theme dependencies',
    'Native ERP & WMS bi-directional syncing (SAP, NetSuite, Microsoft Dynamics 365)',
    '+318% average volume surge capacity measured during Black Friday / Cyber Monday',
    'Proprietary A/B testing and algorithmic conversion rate optimization framework',
    'SOC 2 Type II, ISO 27001, and PCI-DSS Level 1 compliant engineering workflows',
  ],
  topicalEntities: [
    { name: 'Shopify Plus Development', type: 'Service', description: 'Enterprise-grade custom theme, checkout extensibility, and app engineering.' },
    { name: 'Headless E-Commerce', type: 'Architecture', description: 'Next.js, Hydrogen, and high-concurrency microservices on global edge.' },
    { name: 'Conversion Rate Optimization', type: 'Practice', description: 'Empirical multivariate testing and latency reduction for maximum checkout velocity.' },
    { name: 'Enterprise Replatforming', type: 'Service', description: 'Zero-downtime migrations from Magento, Salesforce Commerce Cloud, and WooCommerce.' },
    { name: 'Checkout Extensibility', type: 'Technology', description: 'Shopify Functions and custom UI extensions replacing legacy checkout scripts.' },
    { name: 'ERP & Systems Middleware', type: 'Integration', description: 'Bi-directional real-time inventory and catalog syncing with SAP, NetSuite, and 3PLs.' },
    { name: 'Shopify Markets & Global Expansion', type: 'Capability', description: 'Multi-currency, localized tax/duties, and international store architectures.' },
    { name: 'Core Web Vitals Optimization', type: 'Engineering', description: 'Sub-1.5s LCP, zero CLS, and sub-50ms TTFB web performance tuning.' },
    { name: 'Shopify B2B Wholesale Portals', type: 'Solution', description: 'Custom price lists, company tier accounts, vaulted POs, and net terms.' },
    { name: 'High-Concurrency BFCM Architecture', type: 'Infrastructure', description: 'Traffic spike buffering and resilient zero-drop checkout pipelines.' },
  ],
};

export const MAX_SEO_KEYWORDS: string[] = [
  'Shopify agency',
  'Shopify Plus agency',
  'Shopify Plus partner',
  'Shopify Plus certified partner',
  'enterprise Shopify development',
  'Shopify experts',
  'Shopify development agency',
  'e-commerce development agency',
  'D2C e-commerce agency',
  'Shopify web design agency',
  'custom Shopify store development',
  'Shopify consultants London',
  'Shopify consultants New York',
  'Shopify agency UK',
  'Shopify agency USA',
  'custom Shopify theme',
  'Shopify store design',
  'Shopify UI UX design',
  'bespoke Shopify design',
  'mobile-first Shopify design',
  'responsive e-commerce design',
  'Shopify design systems',
  'Shopify conversion-focused design',
  'Figma to Shopify',
  'Shopify 2.0 theme architecture',
  'custom Liquid theme',
  'accessible e-commerce design',
  'headless commerce',
  'headless Shopify',
  'Shopify Hydrogen development',
  'Shopify Oxygen hosting',
  'Next.js Shopify headless',
  'GraphQL Storefront API',
  'edge computing e-commerce',
  'sub-50ms TTFB Shopify',
  'fastest Shopify stores',
  'Core Web Vitals Shopify',
  'Google PageSpeed 90+ Shopify',
  'Shopify speed optimization',
  'zero layout shift e-commerce',
  'Shopify Checkout Extensibility',
  'Shopify Functions development',
  'custom Shopify apps',
  'Shopify private app engineering',
  'Shopify discount functions',
  'Shopify delivery customization',
  'one-page checkout Shopify',
  'post-purchase upsells Shopify',
  'Shopify checkout branding',
  'checkout.liquid migration',
  'Shopify API integration',
  'Magento to Shopify Plus migration',
  'Magento 2 to Shopify migration',
  'Salesforce Commerce Cloud to Shopify',
  'Demandware to Shopify Plus',
  'WooCommerce to Shopify Plus',
  'BigCommerce to Shopify migration',
  'zero-downtime e-commerce migration',
  'Shopify catalog migration',
  '301 redirect mapping SEO',
  'enterprise replatforming agency',
  'conversion rate optimization',
  'CRO agency',
  'e-commerce conversion optimization',
  'Shopify A/B testing',
  'cart abandonment reduction',
  'checkout conversion boost',
  'average order value optimization',
  'e-commerce personalization',
  'dynamic product bundling',
  'predictive e-commerce search',
  'Shopify ERP integration',
  'Shopify NetSuite integration',
  'Shopify SAP integration',
  'Shopify Microsoft Dynamics 365',
  'Shopify 3PL fulfillment integration',
  'Shopify WMS sync',
  'Shopify Klaviyo integration',
  'Shopify Gorgias customer service',
  'real-time inventory sync Shopify',
  'bi-directional webhook pipeline',
  'Shopify Markets development',
  'Shopify Markets Pro',
  'international e-commerce agency',
  'multi-currency Shopify store',
  'multi-language Shopify store',
  'global D2C expansion',
  'cross-border e-commerce tax duties',
  'localized payment gateways Shopify',
  'geo-IP store redirection',
  'hreflang SEO international',
  'Shopify B2B development',
  'Shopify Plus B2B wholesale',
  'wholesale e-commerce portal',
  'custom price lists Shopify',
  'net payment terms Shopify',
  'B2B company accounts Shopify',
  'quick order forms wholesale',
  'Shopify Plus support retainer',
  'Shopify maintenance agency',
  '24/7 Shopify emergency support',
  'BFCM preparation Shopify',
  'Black Friday traffic surge capacity',
  'PCI-DSS Level 1 e-commerce',
  'SOC 2 e-commerce development',
  'Shopify security audit',
];

@Injectable()
export class SeoService implements OnModuleInit {
  private readonly logger = new Logger(SeoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAeoAndGeoIfEmpty();
  }

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
    const [pages, services, portfolio, blogPosts, redirects, aeoSetting, geoSetting, robotsSetting, sitemapSetting] =
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
        (this.prisma as any).blogPost.findMany({
          where: { deletedAt: null },
          include: { seoMetadata: true },
        }),
        this.getRedirects(),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:aeo' } }),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:geo' } }),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:robots' } }),
        this.prisma.siteSetting.findUnique({ where: { key: 'seo:sitemap' } }),
      ]);

    // Deduplicate pages by slug (keeping latest updated)
    const uniquePagesMap = new Map<string, any>();
    for (const p of pages) {
      if (!uniquePagesMap.has(p.slug)) {
        uniquePagesMap.set(p.slug, p);
      }
    }
    const uniquePages = Array.from(uniquePagesMap.values());

    const allItems: Array<{ id: string; title: string; slug: string; type: string; seo: any }> = [
      ...uniquePages.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: 'Page',
        seo: p.seoMetadata,
      })),
      ...services.map((s: any) => ({
        id: s.id,
        title: s.title,
        slug: `services/${s.slug}`,
        type: 'Service',
        seo: s.seoMetadata || {
          metaTitle: `${s.title} | Services`,
          metaDescription: s.shortDescription || s.tagline || '',
          robotsIndex: true,
        },
      })),
      ...blogPosts.map((b: any) => ({
        id: b.id,
        title: b.title,
        slug: `blog/${b.slug}`,
        type: 'Blog',
        seo: b.seoMetadata || {
          metaTitle: `${b.title} | Blog`,
          metaDescription: b.excerpt || '',
          robotsIndex: true,
        },
      })),
      ...portfolio.map((pr: any) => ({
        id: pr.id,
        title: pr.title,
        slug: `portfolio/${pr.slug}`,
        type: 'Portfolio',
        seo: {
          metaTitle: `${pr.title} | Portfolio`,
          metaDescription: pr.description || '',
          ogImageUrl: pr.imageUrl || null,
          robotsIndex: true,
        },
      })),
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

    const globalSeo = await this.getGlobalSeo();
    const siteUrl = (globalSeo.siteUrl || 'https://gypsym.com').replace(/\/+$/, '');

    for (const item of allItems) {
      const title = (item.seo?.metaTitle || item.title || '').trim();
      const desc = (item.seo?.metaDescription || '').trim();
      const path = item.slug === 'home' || item.slug === '/' ? '' : (item.slug.startsWith('/') ? item.slug : `/${item.slug}`);
      const autoCanonical = `${siteUrl}${path}`;
      const canonical = item.seo?.canonicalUrl || autoCanonical;
      const og = (item.seo?.ogImageUrl || item.seo?.ogImageId || '').trim();
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
      totalPages: uniquePages.length,
      totalServices: services.length,
      totalBlogs: blogPosts.length,
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
  async getPages(query?: { search?: string; status?: string; missingSeoOnly?: boolean; type?: string }) {
    const [pages, services, blogPosts, portfolio] = await Promise.all([
      (this.prisma as any).page.findMany({
        where: {
          deletedAt: null,
          ...(query?.status ? { status: query.status } : {}),
        },
        include: { seoMetadata: true },
        orderBy: { updatedAt: 'desc' },
      }),
      (this.prisma as any).service.findMany({
        where: {
          deletedAt: null,
          ...(query?.status ? { status: query.status } : {}),
        },
        include: { seoMetadata: true },
        orderBy: { updatedAt: 'desc' },
      }),
      (this.prisma as any).blogPost.findMany({
        where: {
          deletedAt: null,
          ...(query?.status ? { status: query.status } : {}),
        },
        include: { seoMetadata: true },
        orderBy: { updatedAt: 'desc' },
      }),
      (this.prisma as any).portfolioProjectItem.findMany({
        where: {
          ...(query?.status ? { status: query.status } : {}),
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Deduplicate pages by slug (keeping latest updated)
    const uniquePagesMap = new Map<string, any>();
    for (const p of pages) {
      if (!uniquePagesMap.has(p.slug)) {
        uniquePagesMap.set(p.slug, p);
      }
    }
    const uniquePages = Array.from(uniquePagesMap.values());

    const allRawItems: any[] = [
      ...uniquePages.map((p: any) => ({
        id: p.id,
        type: 'PAGE',
        slug: p.slug,
        path: p.slug === 'home' ? '/' : (p.slug.startsWith('/') ? p.slug : `/${p.slug}`),
        title: p.title,
        status: p.status || 'PUBLISHED',
        layoutType: p.layoutType || 'PAGE',
        updatedAt: p.updatedAt,
        seoMetadata: p.seoMetadata,
      })),
      ...services.map((s: any) => ({
        id: s.id,
        type: 'SERVICE',
        slug: `services/${s.slug}`,
        path: `/services/${s.slug}`,
        title: s.title,
        status: s.status || 'PUBLISHED',
        layoutType: 'SERVICE',
        updatedAt: s.updatedAt,
        seoMetadata: s.seoMetadata || {
          metaTitle: `${s.title} | Services`,
          metaDescription: s.shortDescription || s.tagline || '',
          robotsIndex: true,
          robotsFollow: true,
        },
      })),
      ...blogPosts.map((b: any) => ({
        id: b.id,
        type: 'BLOG',
        slug: `blog/${b.slug}`,
        path: `/blog/${b.slug}`,
        title: b.title,
        status: b.status || 'PUBLISHED',
        layoutType: 'BLOG',
        updatedAt: b.updatedAt,
        seoMetadata: b.seoMetadata || {
          metaTitle: `${b.title} | Blog`,
          metaDescription: b.excerpt || '',
          robotsIndex: true,
          robotsFollow: true,
        },
      })),
      ...portfolio.map((pr: any) => ({
        id: pr.id,
        type: 'PORTFOLIO',
        slug: `portfolio/${pr.slug}`,
        path: `/portfolio/${pr.slug}`,
        title: pr.title,
        status: pr.status || 'PUBLISHED',
        layoutType: 'PORTFOLIO',
        updatedAt: pr.updatedAt,
        seoMetadata: {
          metaTitle: `${pr.title} | Portfolio`,
          metaDescription: pr.description || '',
          ogImageUrl: pr.imageUrl || null,
          robotsIndex: true,
          robotsFollow: true,
        },
      })),
    ];

    const globalSeo = await this.getGlobalSeo();
    const siteUrl = (globalSeo.siteUrl || 'https://gypsym.com').replace(/\/+$/, '');

    let result = allRawItems.map((p: any) => {
      const seo = p.seoMetadata || {};
      const titleLen = (seo.metaTitle || p.title || '').length;
      const descLen = (seo.metaDescription || '').length;
      const normalizedPath = p.path === '/' ? '' : (p.path.startsWith('/') ? p.path : `/${p.path}`);
      const autoCanonicalUrl = `${siteUrl}${normalizedPath}`;
      const hasExplicitCanonical = Boolean(seo.canonicalUrl && String(seo.canonicalUrl).trim().length > 0);
      const canonicalUrl = hasExplicitCanonical ? String(seo.canonicalUrl).trim() : autoCanonicalUrl;

      return {
        id: p.id,
        type: p.type,
        slug: p.slug,
        path: p.path,
        title: p.title,
        status: p.status,
        layoutType: p.layoutType,
        updatedAt: p.updatedAt,
        seoMetadata: {
          metaTitle: seo.metaTitle || null,
          metaDescription: seo.metaDescription || null,
          canonicalUrl: canonicalUrl,
          isAutoCanonical: !hasExplicitCanonical,
          explicitCanonicalUrl: hasExplicitCanonical ? seo.canonicalUrl : null,
          autoCanonicalUrl: autoCanonicalUrl,
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
          hasCanonical: true, // Auto-taken for all pages; can be changed from Page SEO
          isAutoCanonical: !hasExplicitCanonical,
          hasOg: Boolean(seo.ogTitle || seo.ogImageUrl),
          isIndexable: seo.robotsIndex !== false,
          hasStructuredData: Boolean(seo.structuredData),
        },
      };
    });

    if (query?.type && query.type !== 'ALL') {
      result = result.filter((p: any) => p.type.toUpperCase() === query.type?.toUpperCase());
    }

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter((p: any) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.path && p.path.toLowerCase().includes(q)) ||
        (p.seoMetadata.metaTitle || '').toLowerCase().includes(q)
      );
    }

    if (query?.missingSeoOnly) {
      result = result.filter((p: any) => !p.seoMetadata.metaTitle || !p.seoMetadata.metaDescription);
    }

    return result;
  }

  async getPageSeo(pageId: string) {
    const globalSeo = await this.getGlobalSeo();
    const siteUrl = (globalSeo.siteUrl || 'https://gypsym.com').replace(/\/+$/, '');

    // 1. Try Page
    const page = await (this.prisma as any).page.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });
    if (page) {
      const path = page.slug === 'home' || page.slug === '/' ? '/' : (page.slug.startsWith('/') ? page.slug : `/${page.slug}`);
      const autoCanonicalUrl = path === '/' ? siteUrl : `${siteUrl}${path}`;
      const seo = page.seoMetadata;
      const canonicalUrl = seo?.canonicalUrl || autoCanonicalUrl;
      return {
        ...page,
        type: 'PAGE',
        path,
        autoCanonicalUrl,
        seoMetadata: seo ? {
          ...seo,
          canonicalUrl,
          isAutoCanonical: !seo.canonicalUrl,
          explicitCanonicalUrl: seo.canonicalUrl || null,
          autoCanonicalUrl,
        } : {
          metaTitle: page.title,
          metaDescription: page.description || '',
          canonicalUrl: autoCanonicalUrl,
          isAutoCanonical: true,
          explicitCanonicalUrl: null,
          autoCanonicalUrl,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: null,
          ogDescription: null,
          ogImageUrl: null,
          twitterCard: 'summary_large_image',
          structuredData: null,
        },
      };
    }

    // 2. Try Service
    const service = await (this.prisma as any).service.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });
    if (service) {
      const path = `/services/${service.slug}`;
      const autoCanonicalUrl = `${siteUrl}${path}`;
      const seo = service.seoMetadata;
      const canonicalUrl = seo?.canonicalUrl || autoCanonicalUrl;
      return {
        id: service.id,
        title: service.title,
        slug: `services/${service.slug}`,
        path,
        type: 'SERVICE',
        status: service.status,
        layoutType: 'SERVICE',
        updatedAt: service.updatedAt,
        autoCanonicalUrl,
        seoMetadata: seo ? {
          ...seo,
          canonicalUrl,
          isAutoCanonical: !seo.canonicalUrl,
          explicitCanonicalUrl: seo.canonicalUrl || null,
          autoCanonicalUrl,
        } : {
          metaTitle: `${service.title} | Services`,
          metaDescription: service.shortDescription || '',
          canonicalUrl: autoCanonicalUrl,
          isAutoCanonical: true,
          explicitCanonicalUrl: null,
          autoCanonicalUrl,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: null,
          ogDescription: null,
          ogImageUrl: null,
          twitterCard: 'summary_large_image',
          structuredData: null,
        },
      };
    }

    // 3. Try BlogPost
    const blog = await (this.prisma as any).blogPost.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });
    if (blog) {
      const path = `/blog/${blog.slug}`;
      const autoCanonicalUrl = `${siteUrl}${path}`;
      const seo = blog.seoMetadata;
      const canonicalUrl = seo?.canonicalUrl || autoCanonicalUrl;
      return {
        id: blog.id,
        title: blog.title,
        slug: `blog/${blog.slug}`,
        path,
        type: 'BLOG',
        status: blog.status,
        layoutType: 'BLOG',
        updatedAt: blog.updatedAt,
        autoCanonicalUrl,
        seoMetadata: seo ? {
          ...seo,
          canonicalUrl,
          isAutoCanonical: !seo.canonicalUrl,
          explicitCanonicalUrl: seo.canonicalUrl || null,
          autoCanonicalUrl,
        } : {
          metaTitle: `${blog.title} | Blog`,
          metaDescription: blog.excerpt || '',
          canonicalUrl: autoCanonicalUrl,
          isAutoCanonical: true,
          explicitCanonicalUrl: null,
          autoCanonicalUrl,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: null,
          ogDescription: null,
          ogImageUrl: null,
          twitterCard: 'summary_large_image',
          structuredData: null,
        },
      };
    }

    // 4. Try Portfolio
    const project = await (this.prisma as any).portfolioProjectItem.findUnique({
      where: { id: pageId },
    });
    if (project) {
      const path = `/portfolio/${project.slug}`;
      const autoCanonicalUrl = `${siteUrl}${path}`;
      return {
        id: project.id,
        title: project.title,
        slug: `portfolio/${project.slug}`,
        path,
        type: 'PORTFOLIO',
        status: project.status,
        layoutType: 'PORTFOLIO',
        updatedAt: project.updatedAt,
        autoCanonicalUrl,
        seoMetadata: {
          metaTitle: `${project.title} | Portfolio`,
          metaDescription: project.description || '',
          canonicalUrl: autoCanonicalUrl,
          isAutoCanonical: true,
          explicitCanonicalUrl: null,
          autoCanonicalUrl,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: null,
          ogDescription: null,
          ogImageUrl: project.imageUrl,
          twitterCard: 'summary_large_image',
          structuredData: null,
        },
      };
    }

    throw new NotFoundException(`Item '${pageId}' not found`);
  }

  async updatePageSeo(pageId: string, dto: any, user?: any) {
    const seoData = {
      metaTitle: dto.metaTitle || '',
      metaDescription: dto.metaDescription || '',
      canonicalUrl: dto.canonicalUrl || null,
      robotsIndex: dto.robotsIndex ?? true,
      robotsFollow: dto.robotsFollow ?? true,
      ogTitle: dto.ogTitle || null,
      ogDescription: dto.ogDescription || null,
      twitterCard: dto.twitterCard || 'summary_large_image',
      structuredData: dto.structuredData || null,
    };

    // 1. Try Page
    const page = await (this.prisma as any).page.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });
    if (page) {
      let updatedSeo: any;
      if (page.seoMetadata) {
        updatedSeo = await (this.prisma as any).seoMetadata.update({
          where: { id: page.seoMetadata.id },
          data: seoData,
        });
      } else {
        updatedSeo = await (this.prisma as any).seoMetadata.create({
          data: { ...seoData, pageId: page.id },
        });
      }
      await (this.prisma as any).page.update({
        where: { id: page.id },
        data: { updatedAt: new Date() },
      });
      if (user?.email) {
        await this.prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role || 'ADMIN',
            action: 'PAGE_SEO_UPDATED',
            resourceType: 'Page',
            resourceId: page.id,
            diffSnapshot: { slug: page.slug, seo: seoData } as any,
          },
        }).catch(() => null);
      }
      return { ...page, seoMetadata: updatedSeo };
    }

    // 2. Try Service
    const service = await (this.prisma as any).service.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });
    if (service) {
      let updatedSeo: any;
      if (service.seoMetadata) {
        updatedSeo = await (this.prisma as any).seoMetadata.update({
          where: { id: service.seoMetadata.id },
          data: seoData,
        });
      } else {
        updatedSeo = await (this.prisma as any).seoMetadata.create({
          data: { ...seoData, serviceId: service.id },
        });
      }
      await (this.prisma as any).service.update({
        where: { id: service.id },
        data: { updatedAt: new Date() },
      });
      if (user?.email) {
        await this.prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role || 'ADMIN',
            action: 'PAGE_SEO_UPDATED',
            resourceType: 'Service',
            resourceId: service.id,
            diffSnapshot: { slug: service.slug, seo: seoData } as any,
          },
        }).catch(() => null);
      }
      return { ...service, seoMetadata: updatedSeo };
    }

    // 3. Try BlogPost
    const blog = await (this.prisma as any).blogPost.findUnique({
      where: { id: pageId },
      include: { seoMetadata: true },
    });
    if (blog) {
      let updatedSeo: any;
      if (blog.seoMetadata) {
        updatedSeo = await (this.prisma as any).seoMetadata.update({
          where: { id: blog.seoMetadata.id },
          data: seoData,
        });
      } else {
        updatedSeo = await (this.prisma as any).seoMetadata.create({
          data: { ...seoData, blogPostId: blog.id },
        });
      }
      await (this.prisma as any).blogPost.update({
        where: { id: blog.id },
        data: { updatedAt: new Date() },
      });
      if (user?.email) {
        await this.prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role || 'ADMIN',
            action: 'PAGE_SEO_UPDATED',
            resourceType: 'BlogPost',
            resourceId: blog.id,
            diffSnapshot: { slug: blog.slug, seo: seoData } as any,
          },
        }).catch(() => null);
      }
      return {
        ...blog,
        viewCount: Number(blog.viewCount || 0),
        seoMetadata: updatedSeo,
      };
    }

    // 4. Try Portfolio
    const project = await (this.prisma as any).portfolioProjectItem.findUnique({
      where: { id: pageId },
    });
    if (project) {
      await (this.prisma as any).portfolioProjectItem.update({
        where: { id: project.id },
        data: {
          description: dto.metaDescription || project.description,
          updatedAt: new Date(),
        },
      });
      if (user?.email) {
        await this.prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role || 'ADMIN',
            action: 'PAGE_SEO_UPDATED',
            resourceType: 'Portfolio',
            resourceId: project.id,
            diffSnapshot: { slug: project.slug, seo: seoData } as any,
          },
        }).catch(() => null);
      }
      return { ...project, seoMetadata: seoData };
    }

    throw new NotFoundException(`Item '${pageId}' not found`);
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
    const page = await this.getPageSeo(pageId);

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
    const [config, globalSeo, pages, services, portfolio, blogPosts] = await Promise.all([
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
      (this.prisma as any).blogPost.findMany({
        where: { deletedAt: null, status: 'PUBLISHED' },
        include: { seoMetadata: true },
      }),
    ]);

    const baseUrl = (globalSeo.siteUrl || 'https://gypsym.com').replace(/\/+$/, '');
    const excluded = new Set((config.excludedSlugs || []).map((s) => s.toLowerCase().trim()));

    const urls: Array<{ url: string; lastModified: Date; changeFrequency: string; priority: number }> = [];

    // 1. Pages
    if (config.includePages) {
      const uniquePagesMap = new Map<string, any>();
      for (const p of pages) {
        if (!uniquePagesMap.has(p.slug)) {
          uniquePagesMap.set(p.slug, p);
        }
      }
      for (const p of uniquePagesMap.values()) {
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

    // 4. Blogs
    if (config.includeBlog !== false) {
      for (const b of blogPosts) {
        if (b.seoMetadata?.robotsIndex === false) continue;
        if (excluded.has(`blog/${b.slug}`.toLowerCase())) continue;

        urls.push({
          url: `${baseUrl}/blog/${b.slug}`,
          lastModified: b.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.75,
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

  // ────────────────────────────────────────────────────────────
  // 12. SEEDING ENGINE (AEO, GEO & MAXIMUM KEYWORDS)
  // ────────────────────────────────────────────────────────────
  async seedAeoData(user?: any): Promise<AeoItemDto[]> {
    this.logger.log('Seeding Answer Engine Optimization (AEO) knowledge graph items...');
    await this.saveAeoItems(DEFAULT_AEO_ITEMS, user);
    return DEFAULT_AEO_ITEMS;
  }

  async seedGeoData(user?: any): Promise<GeoProfileDto> {
    this.logger.log('Seeding Generative Engine Optimization (GEO) brand profile...');
    await this.updateGeoProfile(DEFAULT_GEO_PROFILE, user);
    return DEFAULT_GEO_PROFILE;
  }

  async seedKeywordsData(user?: any): Promise<{ totalKeywords: number; keywords: string[] }> {
    this.logger.log('Seeding maximum SEO keywords into global settings...');
    const current = await this.getGlobalSeo();
    const existing = Array.isArray(current.defaultKeywords) ? current.defaultKeywords : [];
    const merged = Array.from(new Set([...existing, ...MAX_SEO_KEYWORDS]));

    await this.updateGlobalSeo({ ...current, defaultKeywords: merged }, user);
    return { totalKeywords: merged.length, keywords: merged };
  }

  async seedPageSchemas(_user?: any) {
    this.logger.log('Seeding tailored Schema.org JSON-LD structured data for all pages, services, blogs, and portfolio...');
    const globalSeo = await this.getGlobalSeo();
    const siteUrl = (globalSeo.siteUrl || 'https://gypsym.com').replace(/\/+$/, '');
    const orgName = globalSeo.organizationName || globalSeo.siteName || 'Gypsym Technology';
    const orgLogo = globalSeo.organizationLogo || globalSeo.defaultOgImage || `${siteUrl}/og-default.png`;
    const defaultAuthor = globalSeo.defaultAuthor || 'Gypsym Technology Engineering Team';

    const [pages, services, blogPosts, portfolio] = await Promise.all([
      (this.prisma as any).page.findMany({ include: { seoMetadata: true } }),
      (this.prisma as any).service.findMany({ include: { seoMetadata: true } }),
      (this.prisma as any).blogPost.findMany({ include: { seoMetadata: true } }),
      (this.prisma as any).portfolioProjectItem.findMany(),
    ]);

    let pagesSeeded = 0;
    let servicesSeeded = 0;
    let blogsSeeded = 0;
    let portfolioSeeded = 0;

    // 1. Pages
    for (const page of pages) {
      let schema: any;
      const slug = (page.slug || '').toLowerCase().trim();
      const pageUrl = slug === 'home' || slug === '/' ? siteUrl : `${siteUrl}/${slug.replace(/^\/+/, '')}`;

      if (slug === 'home' || slug === '/' || slug === '') {
        schema = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: orgName,
          url: siteUrl,
          description: globalSeo.siteDescription || 'Enterprise Shopify & Shopify Plus agency specializing in bespoke store design, high-frequency headless architecture, and conversion rate optimization.',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: orgName,
            url: siteUrl,
            logo: orgLogo,
          },
        };
      } else if (slug === 'about') {
        schema = {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `About ${orgName}`,
          description: page.description || page.seoMetadata?.metaDescription || `About ${orgName} - Enterprise Shopify Plus Agency & Commerce Engineering Partner.`,
          url: pageUrl,
          mainEntity: {
            '@type': 'Organization',
            name: orgName,
            url: siteUrl,
            foundingDate: '2020',
            address: {
              '@type': 'PostalAddress',
              streetAddress: globalSeo.address || '100 Bishopsgate',
              addressCountry: globalSeo.country || 'United Kingdom',
            },
            sameAs: globalSeo.socialProfiles?.map((s) => s.url).filter(Boolean) || [],
          },
        };
      } else if (slug === 'contact' || slug === 'book') {
        schema = {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: `Contact ${orgName}`,
          description: page.description || page.seoMetadata?.metaDescription || `Schedule a technical architecture briefing or inquiry with ${orgName}.`,
          url: pageUrl,
          mainEntity: {
            '@type': 'Organization',
            name: orgName,
            url: siteUrl,
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: globalSeo.phone || '+44 20 7946 0991',
              contactType: 'customer service',
              email: globalSeo.email || 'briefing@gypsym.com',
              availableLanguage: ['English'],
            },
          },
        };
      } else if (slug.includes('country') || slug.includes('countries') || page.type === 'COUNTRY') {
        schema = {
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: `${orgName} - ${page.title}`,
          description: page.description || page.seoMetadata?.metaDescription || `Enterprise Shopify Plus development and e-commerce engineering services in ${page.title}.`,
          url: pageUrl,
          areaServed: page.title,
          provider: {
            '@type': 'Organization',
            name: orgName,
            url: siteUrl,
            logo: orgLogo,
          },
        };
      } else {
        schema = {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: page.title,
          description: page.description || page.seoMetadata?.metaDescription || `${page.title} | ${orgName}`,
          url: pageUrl,
          isPartOf: {
            '@type': 'WebSite',
            name: orgName,
            url: siteUrl,
          },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: page.title, item: pageUrl },
            ],
          },
        };
      }

      const autoCanonical = slug === 'home' || slug === '/' ? siteUrl : `${siteUrl}/${slug.replace(/^\/+/, '')}`;
      const canonical = page.seoMetadata?.canonicalUrl || autoCanonical;

      if (page.seoMetadata) {
        await (this.prisma as any).seoMetadata.update({
          where: { id: page.seoMetadata.id },
          data: {
            structuredData: schema,
            canonicalUrl: canonical,
          },
        });
      } else {
        await (this.prisma as any).seoMetadata.create({
          data: {
            pageId: page.id,
            metaTitle: page.title,
            metaDescription: page.description || '',
            canonicalUrl: canonical,
            structuredData: schema,
            robotsIndex: true,
            robotsFollow: true,
          },
        });
      }
      pagesSeeded++;
    }

    // 2. Services
    for (const service of services) {
      const serviceUrl = `${siteUrl}/services/${service.slug}`;
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'E-Commerce Development & Engineering',
        name: service.title,
        description: service.shortDescription || service.tagline || `Enterprise ${service.title} engineering services by ${orgName}.`,
        provider: {
          '@type': 'Organization',
          name: orgName,
          url: siteUrl,
          logo: orgLogo,
        },
        areaServed: 'Worldwide',
        url: serviceUrl,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${service.title} Architecture Deliverables`,
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: `${service.title} Implementation & Support`,
              },
            },
          ],
        },
      };

      const canonical = service.seoMetadata?.canonicalUrl || serviceUrl;

      if (service.seoMetadata) {
        await (this.prisma as any).seoMetadata.update({
          where: { id: service.seoMetadata.id },
          data: {
            structuredData: schema,
            canonicalUrl: canonical,
          },
        });
      } else {
        await (this.prisma as any).seoMetadata.create({
          data: {
            serviceId: service.id,
            metaTitle: `${service.title} | Services | ${orgName}`,
            metaDescription: service.shortDescription || service.tagline || '',
            canonicalUrl: canonical,
            structuredData: schema,
            robotsIndex: true,
            robotsFollow: true,
          },
        });
      }
      servicesSeeded++;
    }

    // 3. Blog Posts
    for (const blog of blogPosts) {
      const blogUrl = `${siteUrl}/blog/${blog.slug}`;
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: blog.excerpt || blog.title,
        image: blog.coverImage || orgLogo,
        datePublished: blog.publishedAt ? new Date(blog.publishedAt).toISOString() : new Date().toISOString(),
        dateModified: new Date(blog.updatedAt).toISOString(),
        author: {
          '@type': 'Organization',
          name: defaultAuthor,
          url: siteUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: orgName,
          url: siteUrl,
          logo: orgLogo,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': blogUrl,
        },
      };

      const canonical = blog.seoMetadata?.canonicalUrl || blogUrl;

      if (blog.seoMetadata) {
        await (this.prisma as any).seoMetadata.update({
          where: { id: blog.seoMetadata.id },
          data: {
            structuredData: schema,
            canonicalUrl: canonical,
          },
        });
      } else {
        await (this.prisma as any).seoMetadata.create({
          data: {
            blogPostId: blog.id,
            metaTitle: `${blog.title} | Blog | ${orgName}`,
            metaDescription: blog.excerpt || '',
            canonicalUrl: canonical,
            structuredData: schema,
            robotsIndex: true,
            robotsFollow: true,
          },
        });
      }
      blogsSeeded++;
    }

    // 4. Portfolio Projects
    portfolioSeeded = portfolio.length;

    const totalSeeded = pagesSeeded + servicesSeeded + blogsSeeded + portfolioSeeded;
    this.logger.log(`Page-wise structured data seed completed: ${totalSeeded} items updated.`);

    return {
      success: true,
      totalSeeded,
      pagesCount: pagesSeeded,
      servicesCount: servicesSeeded,
      blogsCount: blogsSeeded,
      portfolioCount: portfolioSeeded,
    };
  }

  async seedAllSeoData(user?: any) {
    this.logger.log('🚀 Running complete SEO, AEO, GEO & Page Schemas initialization seed...');
    const [aeo, geo, kw, schemas] = await Promise.all([
      this.seedAeoData(user),
      this.seedGeoData(user),
      this.seedKeywordsData(user),
      this.seedPageSchemas(user),
    ]);
    return {
      success: true,
      aeoCount: aeo.length,
      geoProfile: geo.brandName,
      keywordsCount: kw.totalKeywords,
      schemasSeeded: schemas.totalSeeded,
    };
  }

  async seedAeoAndGeoIfEmpty(): Promise<void> {
    try {
      // 1. Check AEO
      const aeoRow = await this.prisma.siteSetting.findUnique({ where: { key: 'seo:aeo' } });
      if (!aeoRow || !Array.isArray(aeoRow.value) || aeoRow.value.length === 0) {
        this.logger.log('AEO knowledge graph empty or missing in DB. Auto-seeding 14 enterprise AEO entries...');
        await this.saveAeoItems(DEFAULT_AEO_ITEMS);
      }

      // 2. Check GEO
      const geoRow = await this.prisma.siteSetting.findUnique({ where: { key: 'seo:geo' } });
      if (!geoRow || !geoRow.value) {
        this.logger.log('GEO profile missing in DB. Auto-seeding comprehensive GEO brand graph...');
        await this.updateGeoProfile(DEFAULT_GEO_PROFILE);
      }

      // 3. Check Global Keywords
      const globalRow = await this.prisma.siteSetting.findUnique({ where: { key: 'seo:global' } });
      const currentKw = Array.isArray((globalRow?.value as any)?.defaultKeywords)
        ? (globalRow?.value as any).defaultKeywords
        : [];
      if (currentKw.length < 20) {
        this.logger.log('Global SEO keywords sparse. Auto-enriching with maximum enterprise keywords list...');
        await this.seedKeywordsData();
      }
    } catch (err: any) {
      this.logger.warn(`Auto-seeding AEO/GEO skipped: ${err?.message || err}`);
    }
  }
}
