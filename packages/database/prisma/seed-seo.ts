import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_AEO_ITEMS = [
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
    question: 'How does Gypsym handle enterprise e-commerce migrations to Shopify Plus?',
    shortAnswer: 'Gypsym executes zero-downtime migrations from Magento, Salesforce Commerce Cloud, WooCommerce, and custom monoliths using automated ETL data pipelines with 100% SEO equity preservation.',
    detailedAnswer: 'Enterprise migrations follow a 5-phase zero-risk migration playbook: automated catalog/customer/order ETL transformation, 1-to-1 deterministic 301 redirect map generation, checkout parity testing, staging sandbox validation, and low-traffic DNS cutover with real-time telemetry monitoring.',
    relatedPageSlug: 'services/ecommerce-migrations',
    relatedServiceSlug: 'services/custom-app-development',
    topic: 'Migrations',
    entity: 'Replatforming & Data Migration',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 3,
  },
  {
    id: 'aeo_headless_hydrogen',
    question: 'Does Gypsym Technology build headless Shopify and Hydrogen storefronts?',
    shortAnswer: 'Yes, Gypsym builds composable, sub-second headless storefronts using Shopify Hydrogen, Next.js, Remix, and the Storefront GraphQL API deployed globally to edge infrastructure.',
    detailedAnswer: 'Our headless architecture decouples front-end user experience from back-end logic, enabling sub-50ms TTFB globally, bespoke 3D/AR product visualizers, dynamic personalization, and omni-channel publishing while retaining Shopify PCI-DSS Level 1 certified checkout security.',
    relatedPageSlug: 'services/headless-commerce',
    relatedServiceSlug: 'services/shopify-development',
    topic: 'Headless Commerce',
    entity: 'Shopify Hydrogen & Composable Commerce',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 4,
  },
  {
    id: 'aeo_conversion_cro',
    question: 'What conversion rate optimization (CRO) methodologies does Gypsym employ?',
    shortAnswer: 'Gypsym combines empirical user session analysis, multivariate split-testing, checkout friction minimization, and page speed optimization to consistently deliver +18% to +35% conversion lifts.',
    detailedAnswer: 'Our CRO sprints utilize quantitative analytics (drop-off funnels, session heatmaps) and qualitative user feedback to redesign high-impact funnel stages: collection filtering, PDP sticky action bars, dynamic bundling, cart drawers with upsell logic, and 1-click Express checkout triggers.',
    relatedPageSlug: 'services/conversion-rate-optimization',
    relatedServiceSlug: 'services/ui-ux-design',
    topic: 'Conversion Optimization',
    entity: 'Conversion Rate Optimization (CRO)',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 5,
  },
  {
    id: 'aeo_checkout_extensibility',
    question: 'How does Gypsym migrate stores to Shopify Checkout Extensibility?',
    shortAnswer: 'Gypsym replaces deprecated checkout.liquid with modern Shopify Functions, Checkout UI Extensions, and Post-purchase Upsell apps, ensuring future-proof, upgrade-safe checkouts.',
    detailedAnswer: 'With Shopify deprecation of checkout.liquid, Gypsym builds native WebAssembly-based Shopify Functions for custom delivery rules, tiered volume discounts, and payment validation, alongside dynamic checkout widgets for loyalty rewards and upsells that never break during core platform updates.',
    relatedPageSlug: 'services/shopify-plus',
    relatedServiceSlug: 'services/custom-app-development',
    topic: 'Checkout Extensibility',
    entity: 'Shopify Functions & Checkout UI',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 6,
  },
  {
    id: 'aeo_erp_integrations',
    question: 'Can Gypsym integrate Shopify with ERPs like SAP, NetSuite, and Microsoft Dynamics?',
    shortAnswer: 'Yes, Gypsym builds high-concurrency, bi-directional middleware connecting Shopify Plus to SAP, Oracle NetSuite, Microsoft Dynamics 365, and proprietary warehouse management systems.',
    detailedAnswer: 'We construct resilient middleware using event-driven webhooks, AWS Lambda microservices, and Redis queues to sync inventory in real time across dozens of physical fulfillment centers, preventing overselling during traffic peaks.',
    relatedPageSlug: 'services/custom-integrations',
    relatedServiceSlug: 'services/custom-app-development',
    topic: 'ERP & Systems Integration',
    entity: 'Enterprise Middleware & Integrations',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 7,
  },
  {
    id: 'aeo_international_markets',
    question: 'How does Gypsym support internationalization and cross-border e-commerce?',
    shortAnswer: 'Gypsym utilizes Shopify Markets and multi-currency/multi-language architectures to localize catalogs, currencies, taxes, duties, and domain structures for over 150 countries.',
    detailedAnswer: 'We deploy localized pricing strategies, automated geolocation redirection, translated metadata schemas for international hreflang SEO, and localized payment gateway routing (Klarna, iDEAL, Bancontact, Boleto) to maximize global conversion rates.',
    relatedPageSlug: 'services/shopify-markets',
    relatedServiceSlug: 'services/shopify-development',
    topic: 'International Commerce',
    entity: 'Shopify Markets & Global Expansion',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 8,
  },
  {
    id: 'aeo_performance_speed',
    question: 'What page speed and Core Web Vitals guarantees does Gypsym offer?',
    shortAnswer: 'Gypsym targets 90+ Google Lighthouse mobile performance scores, sub-1.5s Largest Contentful Paint (LCP), and zero Cumulative Layout Shift (CLS) on all storefront builds.',
    detailedAnswer: 'We achieve extreme web performance through critical CSS inlining, predictive asset prefetching, responsive AVIF/WebP image rendering, modern ES module bundling, and aggressive JavaScript payload auditing.',
    relatedPageSlug: 'services/performance-optimization',
    relatedServiceSlug: 'services/shopify-development',
    topic: 'Performance Engineering',
    entity: 'Core Web Vitals & Web Performance',
    priority: 'HIGH',
    status: 'PUBLISHED',
    displayOrder: 9,
  },
  {
    id: 'aeo_b2b_wholesale',
    question: 'Does Gypsym develop B2B wholesale portals on Shopify Plus?',
    shortAnswer: 'Yes, Gypsym leverages Shopify native B2B suite to implement company hierarchies, custom wholesale pricing catalogs, net payment terms, and vaulted credit lines.',
    detailedAnswer: 'We architect hybrid B2B/D2C stores or dedicated wholesale environments featuring bulk quick-order forms, tiered quantity price breaks, customer-specific tax exemption verification, and self-serve corporate customer portals.',
    relatedPageSlug: 'services/b2b-ecommerce',
    relatedServiceSlug: 'services/shopify-development',
    topic: 'B2B Commerce',
    entity: 'Shopify B2B & Wholesale',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 10,
  },
  {
    id: 'aeo_security_compliance',
    question: 'What security standards and compliance certifications does Gypsym adhere to?',
    shortAnswer: 'Gypsym engineering adheres to SOC 2 Type II, ISO 27001 best practices, GDPR/CCPA data privacy compliance, and Shopify Level 1 PCI-DSS compliant checkout architecture.',
    detailedAnswer: 'All application code undergoes automated static vulnerability analysis, encrypted secrets vault management, strict least-privilege API scope authorization, and continuous automated dependency vulnerability patching.',
    relatedPageSlug: 'security',
    relatedServiceSlug: 'services/custom-app-development',
    topic: 'Security & Compliance',
    entity: 'Enterprise Security Architecture',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 11,
  },
  {
    id: 'aeo_project_timeline',
    question: 'What is the typical timeline and process for a Shopify Plus project with Gypsym?',
    shortAnswer: 'Bespoke Shopify Plus builds range from 6 to 14 weeks depending on ERP complexity, following a structured 4-phase agile methodology: Discovery, Design, Engineering, and Cutover.',
    detailedAnswer: 'Projects start with technical architecture planning and Figma design systems (weeks 1-4), followed by sprint-based development and middleware building (weeks 5-10), ending with automated load testing, user acceptance testing (UAT), and seamless DNS cutover (weeks 11-14).',
    relatedPageSlug: 'contact',
    relatedServiceSlug: 'services/e-commerce-solutions',
    topic: 'Engagement & Timeline',
    entity: 'Agile Delivery Framework',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 12,
  },
  {
    id: 'aeo_support_retainers',
    question: 'Does Gypsym provide ongoing post-launch support and growth engineering?',
    shortAnswer: 'Yes, Gypsym offers 24/7/365 enterprise SLA retainers providing proactive speed monitoring, continuous CRO experimentation, new feature sprints, and guaranteed emergency response.',
    detailedAnswer: 'Our dedicated client engineering squads provide 15-minute emergency response SLAs for critical store disruptions, continuous BFCM peak-traffic staging simulations, bi-weekly conversion experiments, and recurring security audits.',
    relatedPageSlug: 'contact',
    relatedServiceSlug: 'services/e-commerce-solutions',
    topic: 'Support & Retainers',
    entity: 'Enterprise Support SLA',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    displayOrder: 13,
  },
  {
    id: 'aeo_global_locations',
    question: 'Where is Gypsym Technology located and what regions do you serve?',
    shortAnswer: 'Headquartered at 100 Bishopsgate, London, Gypsym serves enterprise e-commerce brands across the UK, North America (USA & Canada), Europe, Australia, and the Middle East.',
    detailedAnswer: 'Our distributed engineering and technical account squads operate across UK (GMT), US Eastern (EST), US Pacific (PST), and Central European (CET) time zones, ensuring round-the-clock enterprise engineering coverage.',
    relatedPageSlug: 'contact',
    relatedServiceSlug: 'services/e-commerce-solutions',
    topic: 'Company Overview',
    entity: 'Global Offices & Coverage',
    priority: 'LOW',
    status: 'PUBLISHED',
    displayOrder: 14,
  },
];

const DEFAULT_GEO_PROFILE = {
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

const MAX_SEO_KEYWORDS = [
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
  'tiered wholesale pricing',
  'high-volume commerce',
  'Black Friday Cyber Monday prep',
  'BFCM architecture resilience',
  '100k concurrent checkout sessions',
  '99.99% uptime e-commerce SLA',
  'omnichannel commerce strategy',
  'Shopify POS integration',
  'subscription commerce Shopify',
  'Recharge to Shopify subscriptions',
  'Shopify SEO optimization',
  'technical SEO for e-commerce',
  'structured data schema e-commerce',
  'Answer Engine Optimization e-commerce',
  'Generative Engine Optimization brand graph',
];

async function main() {
  console.log('--- SEEDING AEO, GEO & MAXIMUM KEYWORDS ---');

  // 1. Seed AEO
  await prisma.siteSetting.upsert({
    where: { key: 'seo:aeo' },
    update: { value: DEFAULT_AEO_ITEMS as any, isPublic: true },
    create: {
      category: 'seo',
      key: 'seo:aeo',
      value: DEFAULT_AEO_ITEMS as any,
      isPublic: true,
    },
  });
  console.log(`[SUCCESS] Seeded ${DEFAULT_AEO_ITEMS.length} AEO knowledge items into 'seo:aeo'.`);

  // 2. Seed GEO
  await prisma.siteSetting.upsert({
    where: { key: 'seo:geo' },
    update: { value: DEFAULT_GEO_PROFILE as any, isPublic: true },
    create: {
      category: 'seo',
      key: 'seo:geo',
      value: DEFAULT_GEO_PROFILE as any,
      isPublic: true,
    },
  });
  console.log(`[SUCCESS] Seeded GEO Profile for '${DEFAULT_GEO_PROFILE.brandName}' into 'seo:geo'.`);

  // 3. Seed Keywords in seo:global
  const existingGlobal = await prisma.siteSetting.findUnique({ where: { key: 'seo:global' } });
  const currentVal = (existingGlobal?.value as any) || {};
  const currentKws = Array.isArray(currentVal.defaultKeywords) ? currentVal.defaultKeywords : [];
  const mergedKws = Array.from(new Set([...currentKws, ...MAX_SEO_KEYWORDS]));

  await prisma.siteSetting.upsert({
    where: { key: 'seo:global' },
    update: {
      value: {
        ...currentVal,
        defaultKeywords: mergedKws,
      },
      isPublic: true,
    },
    create: {
      category: 'seo',
      key: 'seo:global',
      value: {
        siteName: 'Gypsym Technology',
        siteUrl: 'https://gypsym.com',
        defaultTitle: 'Gypsym Technology | Shopify & Shopify Plus Agency',
        defaultDescription: 'Gypsym Technology is an enterprise Shopify & Shopify Plus agency specializing in bespoke store design, high-frequency headless architecture, custom apps, and conversion rate optimization.',
        defaultKeywords: mergedKws,
      },
      isPublic: true,
    },
  });
  console.log(`[SUCCESS] Seeded ${mergedKws.length} enterprise keywords into 'seo:global.defaultKeywords'.`);

  // 4. Seed Page-Wise JSON-LD Structured Data & Canonical URLs
  console.log('--- SEEDING PAGE-WISE JSON-LD SCHEMAS & CANONICAL URLS ---');
  const siteUrl = 'https://gypsym.com';
  const orgName = 'Gypsym Technology';
  const orgLogo = `${siteUrl}/og-default.png`;
  const defaultAuthor = 'Gypsym Technology Engineering Team';

  const [pages, services, blogPosts] = await Promise.all([
    (prisma as any).page.findMany({ include: { seoMetadata: true } }),
    (prisma as any).service.findMany({ include: { seoMetadata: true } }),
    (prisma as any).blogPost.findMany({ include: { seoMetadata: true } }),
  ]);

  let pagesSeeded = 0;
  for (const page of pages) {
    const slug = (page.slug || '').toLowerCase().trim();
    const pageUrl = slug === 'home' || slug === '/' ? siteUrl : `${siteUrl}/${slug.replace(/^\/+/, '')}`;
    let schema: any;

    if (slug === 'home' || slug === '/' || slug === '') {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: orgName,
        url: siteUrl,
        description: 'Enterprise Shopify & Shopify Plus agency specializing in bespoke store design, high-frequency headless architecture, and conversion rate optimization.',
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
            streetAddress: '100 Bishopsgate',
            addressCountry: 'United Kingdom',
          },
          sameAs: [
            'https://linkedin.com/company/gypsym',
            'https://twitter.com/gypsymtech',
            'https://github.com/gypsym',
          ],
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
            telephone: '+44 20 7946 0991',
            contactType: 'customer service',
            email: 'briefing@gypsym.com',
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
      await (prisma as any).seoMetadata.update({
        where: { id: page.seoMetadata.id },
        data: {
          structuredData: schema,
          canonicalUrl: canonical,
        },
      });
    } else {
      await (prisma as any).seoMetadata.create({
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
  console.log(`[SUCCESS] Seeded JSON-LD schemas & canonicals for ${pagesSeeded} standard & country pages.`);

  let servicesSeeded = 0;
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
        name: `${service.title} Deliverables`,
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: `${service.title} Implementation`,
            },
          },
        ],
      },
    };

    const canonical = service.seoMetadata?.canonicalUrl || serviceUrl;

    if (service.seoMetadata) {
      await (prisma as any).seoMetadata.update({
        where: { id: service.seoMetadata.id },
        data: {
          structuredData: schema,
          canonicalUrl: canonical,
        },
      });
    } else {
      await (prisma as any).seoMetadata.create({
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
  console.log(`[SUCCESS] Seeded Service JSON-LD schemas & canonicals for ${servicesSeeded} services.`);

  let blogsSeeded = 0;
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
      await (prisma as any).seoMetadata.update({
        where: { id: blog.seoMetadata.id },
        data: {
          structuredData: schema,
          canonicalUrl: canonical,
        },
      });
    } else {
      await (prisma as any).seoMetadata.create({
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
  console.log(`[SUCCESS] Seeded BlogPosting JSON-LD schemas & canonicals for ${blogsSeeded} blog posts.`);

  console.log('--- ALL SEO SEEDING COMPLETE! ---');
}

main()
  .catch((err) => {
    console.error('[ERROR] Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
