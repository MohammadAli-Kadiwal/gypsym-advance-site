import { PrismaClient, ComponentType, PageLayoutType, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CountryDefinition {
  countryName: string;
  slug: string;
  flag: string;
  currency: string;
  region: string;
  headlineSegments: Array<{ value: string; type: 'text' | 'italic' | 'highlight' }>;
  titleHighlight: string;
  heroDescription: string;
  bgImage: string;
  portfolioTitle: string;
  clientsTitle: string;
  contactTitle: string;
  contactDescription: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
}

const COUNTRIES: CountryDefinition[] = [
  {
    countryName: 'United States',
    slug: 'united-states',
    flag: '🇺🇸',
    currency: 'USD',
    region: 'North America',
    headlineSegments: [
      { value: 'Enterprise Shopify Plus Engineering for the ', type: 'text' },
      { value: 'United States', type: 'italic' },
    ],
    titleHighlight: 'United States',
    heroDescription:
      'Partnering with high-growth American D2C powerhouses and enterprise brands across New York, San Francisco, and Los Angeles to engineer resilient, high-conversion commerce infrastructure.',
    bgImage: '/images/countries/united-states.jpg',
    portfolioTitle: 'Scalable Commerce Platforms Engineered for the US Market',
    clientsTitle: 'Trusted by High-Growth American Brands & Global Giants',
    contactTitle: 'Initiate a US Architectural Consultation',
    contactDescription:
      'Connect directly with our North America solutions desk. We evaluate scale bottlenecks, headless commerce transitions, and ERP/CRM integrations under strict NDA.',
    seoMetaTitle: 'Shopify Plus Agency & Enterprise Commerce Architects | United States',
    seoMetaDescription:
      'Premier Shopify Plus engineering and headless commerce agency for US enterprise brands. Sub-second performance, bespoke architecture, and 24/7 SLA.',
  },
  {
    countryName: 'United Kingdom',
    slug: 'uk',
    flag: '🇬🇧',
    currency: 'GBP',
    region: 'Europe / UK',
    headlineSegments: [
      { value: 'Premier Shopify Plus Architects for the ', type: 'text' },
      { value: 'United Kingdom', type: 'italic' },
    ],
    titleHighlight: 'United Kingdom',
    heroDescription:
      'Delivering bespoke headless architectures, sub-second edge speeds, and conversion-engineered flagships for Britain’s most ambitious luxury, retail, and direct-to-consumer enterprises.',
    bgImage: '/images/countries/united-kingdom.jpg',
    portfolioTitle: 'Flagship Digital Stores Engineered for the UK & Europe',
    clientsTitle: 'Trusted Across London, Manchester & Nationwide',
    contactTitle: 'Initiate a UK Architectural Consultation',
    contactDescription:
      'Engage with our London-aligned engineering desk. We conduct comprehensive technical audits, multi-market architectures, and Liquid customizer modernization under NDA.',
    seoMetaTitle: 'Shopify Plus Agency UK | London Enterprise E-Commerce Developers',
    seoMetaDescription:
      'Award-winning Shopify Plus & headless agency in the UK. We design, code, and optimize high-revenue commerce engines for leading British retailers.',
  },
  {
    countryName: 'Saudi Arabia',
    slug: 'saudi-arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    region: 'Middle East / GCC',
    headlineSegments: [
      { value: 'Next-Gen Enterprise Commerce for ', type: 'text' },
      { value: 'Saudi Arabia', type: 'italic' },
      { value: ' & Vision 2030', type: 'text' },
    ],
    titleHighlight: 'Saudi Arabia',
    heroDescription:
      'Accelerating Saudi enterprise retail transformation across Riyadh, Jeddah, and the Kingdom with hyper-localized bilingual Shopify Plus architecture, Mada payment flows, and sovereign cloud reliability.',
    bgImage: '/images/countries/saudi-arabia.jpg',
    portfolioTitle: 'Pioneering Digital Retail Platforms Built for Saudi Arabia',
    clientsTitle: 'Trusted by Visionary Saudi Enterprises & GCC Leaders',
    contactTitle: 'Initiate a Kingdom of Saudi Arabia Briefing',
    contactDescription:
      'Engage with our GCC technical practice. We build enterprise Shopify Plus solutions tailored for Saudi consumer habits, ZATCA e-invoicing compliance, and localized checkout.',
    seoMetaTitle: 'Shopify Plus Partner Saudi Arabia | Enterprise E-Commerce Riyadh & Jeddah',
    seoMetaDescription:
      'Elite Shopify Plus agency for Saudi Arabia. Bilingual Arabic-English storefronts, Mada/Tamara/Tabby integrations, and sovereign digital performance.',
  },
  {
    countryName: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    flag: '🇦🇪',
    currency: 'AED',
    region: 'Middle East / GCC',
    headlineSegments: [
      { value: 'Elite Shopify Plus & Headless Commerce for the ', type: 'text' },
      { value: 'United Arab Emirates', type: 'italic' },
    ],
    titleHighlight: 'United Arab Emirates',
    heroDescription:
      'Powering visionary luxury, retail, and omnichannel enterprises in Dubai and Abu Dhabi with uncompromising system resilience, sub-50ms edge latency, and multi-currency intelligence.',
    bgImage: '/images/countries/united-arab-emirates.jpg',
    portfolioTitle: 'Luxury & Omnichannel Digital Architecture for the UAE',
    clientsTitle: 'Trusted by Prominent UAE Brands & Regional Conglomerates',
    contactTitle: 'Initiate a UAE Architectural Consultation',
    contactDescription:
      'Consult with our Dubai-aligned digital architects on high-load flash sales, luxury brand aesthetics, and headless commerce infrastructure under strict confidentiality.',
    seoMetaTitle: 'Shopify Plus Agency Dubai & UAE | Headless Commerce Developers',
    seoMetaDescription:
      'Top-tier Shopify Plus and e-commerce architecture firm in Dubai, UAE. Omnichannel commerce, high-converting luxury store designs, and GCC localized checkout.',
  },
  {
    countryName: 'Australia',
    slug: 'australia',
    flag: '🇦🇺',
    currency: 'AUD',
    region: 'Asia Pacific / Oceania',
    headlineSegments: [
      { value: 'Scale-Driven Shopify Plus Engineering for ', type: 'text' },
      { value: 'Australia', type: 'italic' },
      { value: ' & APAC', type: 'text' },
    ],
    titleHighlight: 'Australia',
    heroDescription:
      'Building world-class e-commerce engines for Australia’s fastest-growing retail leaders across Sydney and Melbourne, optimized for high peak volume, omnichannel, and cross-border trade.',
    bgImage: '/images/countries/australia.jpg',
    portfolioTitle: 'High-Performance E-Commerce Platforms Engineered for Australia',
    clientsTitle: 'Trusted by High-Growth Australian Retailers & Global Brands',
    contactTitle: 'Initiate an Australian Commerce Briefing',
    contactDescription:
      'Engage with our APAC technical engineering group. We evaluate logistics integrations, multi-store setups, and high-conversion storefront architectures under NDA.',
    seoMetaTitle: 'Shopify Plus Agency Australia | Sydney & Melbourne Commerce Experts',
    seoMetaDescription:
      'Specialist Shopify Plus architects in Australia. Delivering ultra-fast headless solutions, custom Liquid sections, and scalable retail engineering.',
  },
  {
    countryName: 'Oman',
    slug: 'oman',
    flag: '🇴🇲',
    currency: 'OMR',
    region: 'Middle East / GCC',
    headlineSegments: [
      { value: 'Enterprise Commerce Modernization for the ', type: 'text' },
      { value: 'Sultanate of Oman', type: 'italic' },
    ],
    titleHighlight: 'Sultanate of Oman',
    heroDescription:
      'Empowering leading Omani commercial conglomerates and digital brands in Muscat with advanced Shopify Plus infrastructure, seamless payment integrations, and enterprise SLAs.',
    bgImage: '/images/countries/oman.jpg',
    portfolioTitle: 'Modern Commerce Infrastructure Engineered for Oman',
    clientsTitle: 'Trusted by Leading Omani Brands & GCC Enterprises',
    contactTitle: 'Initiate an Oman Commerce Briefing',
    contactDescription:
      'Connect with our enterprise technical desk. We build localized bilingual experiences, Thawani/OmanNet payment gateways, and custom Shopify Plus stores under NDA.',
    seoMetaTitle: 'Shopify Plus Partner Oman | Muscat Enterprise Digital Commerce',
    seoMetaDescription:
      'Premier Shopify Plus engineering and headless e-commerce partner for Oman. Localized bilingual storefronts, sovereign cloud resilience, and enterprise support.',
  },
];

async function seedCountry(def: CountryDefinition) {
  console.log(`\nSeeding country page: ${def.countryName} (/${def.slug})...`);

  // Delete any existing pages with this slug to avoid duplicates
  const existingPages = await prisma.page.findMany({ where: { slug: def.slug } });
  for (const ep of existingPages) {
    await prisma.pageSection.deleteMany({ where: { pageId: ep.id } });
    await prisma.seoMetadata.deleteMany({ where: { pageId: ep.id } });
    await prisma.page.delete({ where: { id: ep.id } });
  }

  // Create clean new Page record
  const page = await prisma.page.create({
    data: {
      slug: def.slug,
      title: `${def.countryName} | Gypsym Technology`,
      description: def.heroDescription,
      layoutType: PageLayoutType.LANDING,
      status: ContentStatus.PUBLISHED,
      locale: 'en',
      publishedAt: new Date(),
    },
  });

  // Upsert SEO Metadata
  await prisma.seoMetadata.upsert({
    where: { pageId: page.id },
    update: {
      metaTitle: def.seoMetaTitle,
      metaDescription: def.seoMetaDescription,
      ogTitle: def.seoMetaTitle,
      ogDescription: def.seoMetaDescription,
      canonicalUrl: `https://gypsym.com/${def.slug}`,
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      page: { connect: { id: page.id } },
      metaTitle: def.seoMetaTitle,
      metaDescription: def.seoMetaDescription,
      ogTitle: def.seoMetaTitle,
      ogDescription: def.seoMetaDescription,
      canonicalUrl: `https://gypsym.com/${def.slug}`,
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  // Remove existing sections to re-create cleanly in guaranteed 1-8 sequence
  await prisma.pageSection.deleteMany({
    where: { pageId: page.id },
  });

  // Define the 8 sections requested by user:
  // 1. Hero
  // 2. Portfolio component
  // 3. VERIFIED RESULTS component
  // 4. CLIENTS & PARTNERS component
  // 5. DELIVERY METHODOLOGY
  // 6. CLIENT LOVE
  // 7. DIRECT ENGAGEMENT
  // 8. ENTERPRISE ARCHITECTURE

  const sectionsToCreate = [
    // 1. Hero Section
    {
      sectionIdentifier: 'hero-banner',
      componentType: ComponentType.HERO,
      displayOrder: 1,
      isActive: true,
      contentPayload: {
        country: {
          name: def.countryName,
          flag: def.flag,
          currency: def.currency,
          region: def.region,
        },
        headline: {
          segments: def.headlineSegments,
          hasInlineVideo: false,
        },
        titleHighlight: def.titleHighlight,
        description: {
          content: def.heroDescription,
          enabled: true,
        },
        primaryCta: {
          label: 'Schedule an Architectural Briefing',
          url: '#contact-inquiry',
          enabled: true,
        },
        backgroundMedia: {
          desktopImageUrl: def.bgImage,
          mobileImageUrl: def.bgImage,
          overlayColor: '#000000',
          overlayOpacity: 0.38,
          focalPoint: 'center',
        },
        clientStrip: {
          enabled: true,
          title: `Trusted by enterprise brands in ${def.countryName} & worldwide ..`,
        },
      },
    },

    // 2. Portfolio Component
    {
      sectionIdentifier: 'portfolio-showcase',
      componentType: ComponentType.FEATURE_GRID,
      displayOrder: 2,
      isActive: true,
      contentPayload: {
        eyebrow: 'FLAGSHIP DEPLOYMENTS',
        title: def.portfolioTitle,
        titleHighlight: def.countryName,
        description:
          'Explore mission-critical Shopify Plus and headless implementations delivering sub-second checkout speeds, international currency routing, and 99.99% peak uptime.',
        viewAllButtonEnabled: true,
        viewAllButtonLabel: 'View All Production Case Studies',
        viewAllButtonUrl: '/portfolio',
      },
    },

    // 3. Verified Results Component
    {
      sectionIdentifier: 'verified-results-metrics',
      componentType: ComponentType.METRICS_BANNER,
      displayOrder: 3,
      isActive: true,
      contentPayload: {
        eyebrow: 'VERIFIED RESULTS',
        headline: {
          segments: [
            { text: 'Architectural Performance at ' },
            { text: 'Uncompromising Scale', type: 'highlight' },
          ],
        },
        metrics: [
          {
            value: '+318%',
            label: 'YoY Volume Surge Handled',
            description: 'Engineered for Black Friday and flash-sale spikes with zero latency degradation.',
          },
          {
            value: '42ms',
            label: 'Average Global Edge TTFB',
            description: 'Edge-distributed storefront caching delivering instantaneous browsing across all regions.',
          },
          {
            value: '$1.4B+',
            label: 'Annual GMV Powered',
            description: 'High-volume transaction throughput across localized multi-currency checkouts.',
          },
          {
            value: '99.99%',
            label: 'Core Infrastructure SLA',
            description: 'Deterministic uptime backed by enterprise architectural governance and 24/7 monitoring.',
          },
        ],
      },
    },

    // 4. Clients & Partners Component
    {
      sectionIdentifier: 'clients-partners',
      componentType: ComponentType.LOGO_CLOUD,
      displayOrder: 4,
      isActive: true,
      contentPayload: {
        eyebrow: 'CLIENTS & PARTNERS',
        title: def.clientsTitle,
        titleHighlight: 'Industry Leaders',
        description:
          'From high-growth innovators to tier-1 enterprise conglomerates, leading brands rely on Gypsym for resilient digital infrastructure.',
        layout: {
          displayMode: 'cards',
          showMetricsBar: true,
          desktopRows: [6, 4],
          logoStyle: 'original',
          logoSize: 'medium',
        },
        animation: {
          hoverEffect: true,
        },
      },
    },

    // 5. Delivery Methodology Component
    {
      sectionIdentifier: 'delivery-process',
      componentType: ComponentType.TABBED_SOLUTIONS,
      displayOrder: 5,
      isActive: true,
      contentPayload: {
        eyebrow: 'DELIVERY METHODOLOGY',
        title: 'Our Enterprise Engineering Lifecycle',
        titleHighlight: 'Engineering Lifecycle',
        description:
          'Four disciplined phases ensuring zero-downtime migrations, bespoke Liquid customizer components, and rapid time-to-value.',
        tabs: [
          {
            id: 'phase-1',
            number: '01',
            tabTitle: 'Architecture & Technical Audit',
            heading: 'Deep-Dive Technical Systems Discovery',
            summary:
              'We conduct rigorous source-code audits, database profiling, app inventory reduction, and high-load stress modeling before writing a single line of production code.',
            highlights: [
              'Third-party app latency impact analysis',
              'Checkout bottleneck & checkout extensibility audit',
              'Core Web Vitals & critical rendering path profiling',
              'ERP, WMS, and CRM bidirectional data pipeline mapping',
            ],
            badgeText: 'Discovery Phase',
          },
          {
            id: 'phase-2',
            number: '02',
            tabTitle: 'Custom Liquid & Headless Build',
            heading: 'Modular Component Architecture',
            summary:
              'We craft clean, dependency-free Liquid sections for Shopify OS 2.0 with full customizer parity, and headless Next.js frontends when composable scale is paramount.',
            highlights: [
              'Zero unneeded external JavaScript libraries',
              'Atomic CSS tailored to custom brand design systems',
              'Shopify Functions for custom discount and checkout logic',
              'Fully typed schemas and regression-tested releases',
            ],
            badgeText: 'Engineering Phase',
          },
          {
            id: 'phase-3',
            number: '03',
            tabTitle: 'Conversion Rate Optimization (CRO)',
            heading: 'Data-Driven High-Velocity Experimentation',
            summary:
              'Continuous A/B testing infrastructure embedded directly into the theme, optimizing checkout velocity, average order value (AOV), and customer lifetime value.',
            highlights: [
              'Frictionless one-click upsells and slide-out carts',
              'Personalized predictive search with instantaneous suggestions',
              'Sub-50ms product detail page navigation',
              'Multi-currency and multi-language localized geolocation',
            ],
            badgeText: 'Optimization Phase',
          },
          {
            id: 'phase-4',
            number: '04',
            tabTitle: 'Continuous Retainer & 24/7 SLA',
            heading: 'Long-Term Enterprise Scaling Partnership',
            summary:
              'Dedicated senior architects and engineers standing behind your platform 24/7 with guaranteed SLAs, flash-sale war rooms, and proactive monthly sprints.',
            highlights: [
              '15-minute emergency SLA response for mission-critical issues',
              'Quarterly roadmap planning with CTO office',
              'Continuous automated synthetic browser testing',
              'Dedicated Slack connect channel with principal engineers',
            ],
            badgeText: 'Scale & Retainer',
          },
        ],
      },
    },

    // 6. Client Love Component
    {
      sectionIdentifier: 'client-testimonials',
      componentType: ComponentType.TESTIMONIAL_SLIDER,
      displayOrder: 6,
      isActive: true,
      contentPayload: {
        eyebrow: 'CLIENT LOVE',
        title: 'Endorsed by Technical Founders & Enterprise Leaders',
        titleHighlight: 'Enterprise Leaders',
        description:
          'Direct feedback from founders and engineering directors whose mission-critical commerce platforms we architect and scale.',
        autoplay: true,
        autoplayInterval: 6000,
        showRating: true,
      },
    },

    // 7. Direct Engagement Component
    {
      sectionIdentifier: 'contact-inquiry',
      componentType: ComponentType.CONTACT,
      displayOrder: 7,
      isActive: true,
      contentPayload: {
        eyebrow: 'DIRECT ENGAGEMENT',
        title: def.contactTitle,
        titleHighlight: def.contactTitle.split(' ')[0] || 'Initiate',
        description: def.contactDescription,
        contactInfo: {
          useGlobalDefaults: true,
        },
        supportCard: {
          enabled: true,
          title: `Rapid Architecture Assessment (${def.countryName})`,
          description:
            'Qualifying enterprise projects receive a complimentary 45-minute technical roadmap briefing with our CTO office.',
          ctaLabel: 'Book Priority Session',
          ctaUrl: '#inquiry-form',
        },
        form: {
          formTitle: `Direct Engineering Inquiry - ${def.countryName}`,
          formSubtitle: 'Connect with a principal architect within 24 business hours.',
          submitButtonText: 'Submit Inquiry',
          privacyNote: 'Protected by enterprise NDA standards. No solicitation.',
          successTitle: 'Inquiry Transmitted',
          successMessage:
            'Thank you. Our international engineering desk has received your briefing and will review specifications shortly.',
          fields: [
            {
              id: 'f-name',
              name: 'fullName',
              label: 'Full Name',
              type: 'text',
              placeholder: 'Dr. Evelyn Reed',
              required: true,
              width: 'full',
            },
            {
              id: 'f-email',
              name: 'email',
              label: 'Work Email',
              type: 'email',
              placeholder: 'evelyn@enterprise.com',
              required: true,
              width: 'full',
            },
            {
              id: 'f-company',
              name: 'companyName',
              label: 'Company Name',
              type: 'text',
              placeholder: 'Apex Cloud Systems',
              required: false,
              width: 'half',
            },
            {
              id: 'f-budget',
              name: 'budgetRange',
              label: 'Estimated Budget',
              type: 'select',
              placeholder: 'Select investment tier',
              options: ['$25k - $50k', '$50k - $100k', '$100k - $250k', '$250k+'],
              required: false,
              width: 'half',
            },
            {
              id: 'f-project',
              name: 'projectScope',
              label: 'Project Scope & Requirements',
              type: 'textarea',
              placeholder: `Detail your platform goals, timelines, and architectural constraints in ${def.countryName}...`,
              required: true,
              width: 'full',
            },
          ],
        },
      },
    },

    // 8. Enterprise Architecture Component (Last Section)
    {
      sectionIdentifier: 'homepage-cta',
      componentType: ComponentType.CTA,
      displayOrder: 8,
      isActive: true,
      contentPayload: {
        eyebrow: 'ENTERPRISE ARCHITECTURE',
        title: `Ready to Accelerate Your Digital Transformation in ${def.countryName}?`,
        titleHighlight: 'Transformation',
        description:
          'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure engineered for uncompromising scale.',
        primaryButton: {
          label: 'Schedule an Architectural Briefing',
          url: '#contact-inquiry',
          variant: 'glow',
          target: '_self',
        },
        secondaryButton: {
          enabled: true,
          label: 'Explore Technology Radar',
          url: '/services',
          variant: 'outline',
          target: '_self',
        },
        appearance: {
          backgroundType: 'gradient',
          overlayOpacity: 40,
          enableGlow: true,
        },
        layout: {
          alignment: 'center',
          containerWidth: 'contained',
          borderRadius: '2xl',
        },
      },
    },
  ];

  for (const s of sectionsToCreate) {
    await prisma.pageSection.create({
      data: {
        pageId: page.id,
        sectionIdentifier: s.sectionIdentifier,
        componentType: s.componentType,
        displayOrder: s.displayOrder,
        contentPayload: s.contentPayload,
        isActive: s.isActive,
      },
    });
  }

  console.log(`✓ Seeded ${sectionsToCreate.length} sections for ${def.countryName} (/${def.slug})`);
}

async function main() {
  console.log('--- STARTING COUNTRY PAGES SEEDING ---');
  for (const c of COUNTRIES) {
    await seedCountry(c);
  }
  console.log('\n--- ALL 6 COUNTRY PAGES SEEDED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
