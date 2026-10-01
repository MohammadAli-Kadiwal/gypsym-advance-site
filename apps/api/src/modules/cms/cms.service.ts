import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CmsService implements OnModuleInit {
  private clientsCache: { data: any[]; expiresAt: number } | null = null;
  private homepagePartnersCache: { data: any[]; expiresAt: number } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedFooterIfMissing();
  }

  async seedFooterIfMissing() {
    try {
      let footerSetting = await this.prisma.siteSetting.findUnique({ where: { key: 'footer_config' } });
      if (!footerSetting) {
        await this.seedInitialFooterConfig();
      } else {
        const val = footerSetting.value as any;
        if (!val?.keywords || !Array.isArray(val.keywords?.items) || val.keywords.items.length < 14) {
          const updated = {
            ...(val || {}),
            keywords: this.getDefaultKeywords(),
          };
          await this.prisma.siteSetting.update({
            where: { key: 'footer_config' },
            data: { value: updated },
          });
        }
      }
      const nav = await this.getNavigationByKey('footer').catch(() => null);
      if (!nav || !nav.items || nav.items.length === 0 || !nav.items.some((i: any) => i.children && i.children.length > 0)) {
        await this.seedInitialFooterNavigation();
      }
    } catch (err) {
      console.warn('Auto-seed footer skipped:', err);
    }
  }

  // 1. Services
  async getServices() {
    const services = await this.prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });

    const metaSettings = await this.prisma.siteSetting.findMany({
      where: { category: 'services_meta' },
    });
    const metaMap = new Map<string, any>();
    for (const item of metaSettings) {
      metaMap.set(item.key, item.value);
    }

    return services.map((s) => {
      const defaultMeta = this.getServiceMetadata(s.slug);
      const customMeta = metaMap.get(`service_meta_${s.id}`) || metaMap.get(`service_meta_${s.slug}`) || {};
      const mergedMeta = { ...defaultMeta, ...customMeta };
      return {
        id: s.id,
        slug: s.slug,
        title: s.title,
        tagline: s.tagline || mergedMeta.tagline || '',
        shortDescription: s.shortDescription,
        detailedContent: s.detailedContent || '',
        status: s.status,
        displayOrder: s.displayOrder,
        category: mergedMeta.category || 'Specialized Capability',
        iconName: mergedMeta.iconName || 'ShoppingBag',
        keyFeatures: mergedMeta.keyFeatures || [],
        deliverables: mergedMeta.deliverables || [],
        technologies: mergedMeta.technologies || [],
        process: mergedMeta.process || [],
        benefits: mergedMeta.benefits || [],
        faqs: mergedMeta.faqs || [],
        pricing: mergedMeta.pricing || [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });
  }

  async getServiceBySlug(slug: string) {
    const s = await this.prisma.service.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!s) throw new NotFoundException(`Service '${slug}' not found`);

    const customMetaRecord = await this.prisma.siteSetting.findFirst({
      where: {
        category: 'services_meta',
        key: { in: [`service_meta_${s.id}`, `service_meta_${s.slug}`] },
      },
    });

    const defaultMeta = this.getServiceMetadata(s.slug);
    const customMeta = (customMetaRecord?.value as Record<string, any>) || {};
    const mergedMeta = { ...defaultMeta, ...customMeta };

    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      tagline: s.tagline || mergedMeta.tagline || '',
      shortDescription: s.shortDescription,
      detailedContent: s.detailedContent || '',
      status: s.status,
      displayOrder: s.displayOrder,
      category: mergedMeta.category || 'Specialized Capability',
      iconName: mergedMeta.iconName || 'ShoppingBag',
      keyFeatures: mergedMeta.keyFeatures || [],
      deliverables: mergedMeta.deliverables || [],
      technologies: mergedMeta.technologies || [],
      process: mergedMeta.process || [],
      benefits: mergedMeta.benefits || [],
      faqs: mergedMeta.faqs || [],
      pricing: mergedMeta.pricing || [],
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  async createService(body: {
    title: string;
    slug?: string;
    tagline?: string;
    shortDescription?: string;
    detailedContent?: string;
    category?: string;
    iconName?: string;
    displayOrder?: number;
    status?: any;
    deliverables?: string[];
    technologies?: string[];
    keyFeatures?: string[];
    process?: any[];
    benefits?: any[];
    faqs?: any[];
    pricing?: any[];
  }): Promise<any> {
    const slugBase = (body.slug || body.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = slugBase || `service-${Date.now()}`;

    const existing = await this.prisma.service.findFirst({ where: { slug, deletedAt: null } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    let displayOrder = body.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const last = await this.prisma.service.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (last?.displayOrder ?? 0) + 1;
    }

    const service = await this.prisma.service.create({
      data: {
        slug: finalSlug,
        title: body.title,
        tagline: body.tagline || null,
        shortDescription: body.shortDescription || '',
        detailedContent: body.detailedContent || '',
        displayOrder,
        status: body.status || 'PUBLISHED',
      },
    });

    const metaValue = {
      category: body.category || 'Specialized Capability',
      iconName: body.iconName || 'ShoppingBag',
      keyFeatures: body.keyFeatures || [],
      deliverables: body.deliverables || [],
      technologies: body.technologies || [],
      process: body.process || [],
      benefits: body.benefits || [],
      faqs: body.faqs || [],
      pricing: body.pricing || [],
    };

    await this.prisma.siteSetting.upsert({
      where: { key: `service_meta_${service.id}` },
      update: { value: metaValue, updatedAt: new Date() },
      create: {
        category: 'services_meta',
        key: `service_meta_${service.id}`,
        value: metaValue,
        isPublic: true,
      },
    });

    return {
      ...service,
      ...metaValue,
    };
  }

  async updateService(
    id: string,
    body: {
      title?: string;
      slug?: string;
      tagline?: string;
      shortDescription?: string;
      detailedContent?: string;
      category?: string;
      iconName?: string;
      displayOrder?: number;
      status?: any;
      deliverables?: string[];
      technologies?: string[];
      keyFeatures?: string[];
      process?: any[];
      benefits?: any[];
      faqs?: any[];
      pricing?: any[];
    },
  ): Promise<any> {
    const existing = await this.prisma.service.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException(`Service '${id}' not found`);

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.detailedContent !== undefined) updateData.detailedContent = body.detailedContent;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await this.prisma.service.update({
      where: { id },
      data: updateData,
    });

    const existingMetaSetting = await this.prisma.siteSetting.findFirst({
      where: {
        category: 'services_meta',
        key: { in: [`service_meta_${id}`, `service_meta_${existing.slug}`] },
      },
    });

    const defaultMeta = this.getServiceMetadata(existing.slug);
    const existingMeta = (existingMetaSetting?.value as Record<string, any>) || defaultMeta;

    const newMeta = {
      ...existingMeta,
      ...(body.category !== undefined && { category: body.category }),
      ...(body.iconName !== undefined && { iconName: body.iconName }),
      ...(body.keyFeatures !== undefined && { keyFeatures: body.keyFeatures }),
      ...(body.deliverables !== undefined && { deliverables: body.deliverables }),
      ...(body.technologies !== undefined && { technologies: body.technologies }),
      ...(body.process !== undefined && { process: body.process }),
      ...(body.benefits !== undefined && { benefits: body.benefits }),
      ...(body.faqs !== undefined && { faqs: body.faqs }),
      ...(body.pricing !== undefined && { pricing: body.pricing }),
    };

    await this.prisma.siteSetting.upsert({
      where: { key: `service_meta_${id}` },
      update: { value: newMeta, updatedAt: new Date() },
      create: {
        category: 'services_meta',
        key: `service_meta_${id}`,
        value: newMeta,
        isPublic: true,
      },
    });

    return {
      ...updated,
      ...newMeta,
    };
  }

  async deleteService(id: string): Promise<void> {
    const existing = await this.prisma.service.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException(`Service '${id}' not found`);

    await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async reorderServices(items: Array<{ id: string; displayOrder: number }>): Promise<void> {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.service.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
  }

  async bulkUpdateServiceStatus(ids: string[], status: any): Promise<{ count: number }> {
    const result = await this.prisma.service.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { status },
    });
    return { count: result.count };
  }

  async bulkDeleteServices(ids: string[]): Promise<{ count: number }> {
    const result = await this.prisma.service.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
    return { count: result.count };
  }

  private getServiceMetadata(slug: string) {
    const metadata: Record<string, any> = {
      'e-commerce-solutions': {
        category: 'E-Commerce',
        tagline: 'Complete Shopify & Shopify Plus stores designed to sell — not just look pretty.',
        iconName: 'ShoppingBag',
        keyFeatures: [
          'Custom Liquid & Hydrogen Storefronts',
          'Payment Gateway & Multi-Currency Setup',
          'Automated ERP & Inventory Synchronization',
          'High-Velocity One-Click Checkout Optimization',
        ],
        deliverables: [
          'Full-Funnel Custom Shopify Architecture',
          'ERP / Warehouse Management System Integrations',
          'Friction-Free Cart Drawer & Upsell Engine',
          'Multi-Currency & International Tax Setup',
          'Post-Launch Hypercare & Admin Staff Training',
        ],
        technologies: ['Shopify Plus', 'Liquid', 'Hydrogen', 'GraphQL Admin API', 'Klaviyo', 'Stripe'],
        process: [
          {
            step: '01',
            title: 'Strategy & Catalog Architecture',
            description: 'We audit your product catalog, taxonomy, and commercial goals to map out a friction-free purchasing journey.',
          },
          {
            step: '02',
            title: 'Bespoke UI/UX & Wireframing',
            description: 'Designing high-converting mobile-first storefront prototypes in Figma aligned with brand typography and styling.',
          },
          {
            step: '03',
            title: 'Full-Stack Liquid Engineering',
            description: 'Clean, modular development with zero app bloat, integrating third-party logistics, payment gateways, and analytics.',
          },
          {
            step: '04',
            title: 'Launch & Zero-Downtime Migration',
            description: 'Rigorous cross-browser checkout testing, DNS switchover, and complete operational handover to your team.',
          },
        ],
        benefits: [
          {
            title: 'Maximum Conversion Velocity',
            description: 'Engineered checkout funnels designed to increase AOV and lower cart abandonment rates.',
          },
          {
            title: 'Global Scale Ready',
            description: 'Multi-currency, international taxation, and localized checkout flows for worldwide selling.',
          },
          {
            title: 'Seamless Inventory Sync',
            description: 'Automated real-time inventory and catalog management across channels with ERP connectors.',
          },
          {
            title: 'Sub-Second Load Times',
            description: 'Lightweight code architecture built strictly to exceed Google Core Web Vitals.',
          },
          {
            title: 'Mobile-First Experience',
            description: 'Designed specifically for the 78%+ of modern e-commerce shoppers purchasing on mobile viewports.',
          },
          {
            title: 'Bank-Grade Security',
            description: 'PCI-DSS Level 1 compliance and advanced fraud protection integration right out of the box.',
          },
        ],
        faqs: [
          {
            question: 'How long does a complete e-commerce build take?',
            answer: 'A standard custom Shopify build typically takes between 4 to 8 weeks depending on catalog complexity, custom section requirements, and external integrations.',
          },
          {
            question: 'Can you migrate our existing store from WooCommerce or Magento?',
            answer: 'Yes! We specialize in seamless zero-downtime data migrations including customer accounts, order history, catalog taxonomy, and 301 SEO redirects to preserve your rankings.',
          },
          {
            question: 'Which payment gateways do you configure?',
            answer: 'We configure Shopify Payments, Stripe, PayPal, Klarna, Afterpay, and regional gateways like Tamara and Tabby for the Gulf/Middle East markets.',
          },
          {
            question: 'What support is included after launch?',
            answer: 'Every build includes 30 to 90 days of dedicated hypercare where we monitor live transactions, fix any edge-case bugs, and provide 1-on-1 team training.',
          },
        ],
        pricing: [
          {
            name: 'Starter Store',
            description: 'For emerging D2C brands ready to launch a high-converting flagship store.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '4,999' },
              { currency: 'GBP', symbol: '£', amount: '3,999' },
              { currency: 'AED', symbol: 'AED ', amount: '18,500' },
            ],
            features: [
              'Custom Theme Setup & Styling',
              'Up to 50 Products Configured',
              'Payment & Shipping Setup',
              'Mobile Responsive Layout',
              'Basic SEO & Schema Markup',
              '14-Day Post-Launch Support',
            ],
          },
          {
            name: 'Growth Store',
            description: 'For scaling brands doing $500K-$2M seeking custom UI/UX and higher AOV.',
            isPopular: true,
            prices: [
              { currency: 'USD', symbol: '$', amount: '9,999' },
              { currency: 'GBP', symbol: '£', amount: '7,999' },
              { currency: 'AED', symbol: 'AED ', amount: '36,500' },
            ],
            features: [
              '100% Bespoke UI/UX Design in Figma',
              'Modular OS 2.0 Sections',
              'Custom Cart Drawer & Upsells',
              'ERP / Klaviyo Email Integration',
              'Core Web Vitals Optimization',
              '45-Day Dedicated Hypercare',
            ],
          },
          {
            name: 'Shopify Plus Enterprise',
            description: 'For high-volume brands ($2M-$20M+) requiring headless or multi-region architecture.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '24,999+' },
              { currency: 'GBP', symbol: '£', amount: '19,999+' },
              { currency: 'AED', symbol: 'AED ', amount: '91,500+' },
            ],
            features: [
              'Multi-Region & Multi-Currency Architecture',
              'Custom Checkout Extensibility Apps',
              'B2B Wholesale Portal Integration',
              'Dedicated Technical Account Manager',
              'Sub-Second Page Speed SLA',
              '90-Day VIP Dedicated Support',
            ],
          },
        ],
      },
      'web-design-development': {
        category: 'Design & Engineering',
        tagline: 'Custom, responsive websites that captivate visitors, load fast, and drive conversions.',
        iconName: 'Layout',
        keyFeatures: [
          'Bespoke Figma UI/UX Design System',
          'Liquid & Modern Component Architecture',
          'Strict ADA/WCAG Accessibility Compliance',
          'Cross-Browser & 4K Viewport Optimization',
        ],
        deliverables: [
          'Interactive High-Fidelity Figma Prototypes',
          'Production-Ready Modular Theme Files',
          'Responsive Breakpoints for Mobile, Tablet & Desktop',
          'Custom Interactive Micro-Animations',
          'Complete Asset Library & Design System Guide',
        ],
        technologies: ['Figma', 'Shopify Liquid', 'TailwindCSS', 'TypeScript', 'Next.js', 'Framer Motion'],
        process: [
          {
            step: '01',
            title: 'Creative Brief & User Discovery',
            description: 'Understanding your visual identity, customer personas, competitor landscape, and conversion objectives.',
          },
          {
            step: '02',
            title: 'Figma Prototyping & Design Approval',
            description: 'Crafting interactive prototypes with responsive layouts and bespoke typography for your direct feedback.',
          },
          {
            step: '03',
            title: 'Pixel-Perfect Frontend Build',
            description: 'Translating Figma designs into clean, modular Liquid code with silky-smooth micro-animations.',
          },
          {
            step: '04',
            title: 'Quality Assurance & Go-Live',
            description: 'Comprehensive cross-device validation, speed benchmarking, and final deployment.',
          },
        ],
        benefits: [
          {
            title: 'Distinctive Brand Authority',
            description: 'Stand out from cookie-cutter competitor sites with a tailor-made aesthetic that builds trust.',
          },
          {
            title: 'Flawless Across All Screens',
            description: 'Tested and perfected across iPhones, iPads, Androids, MacBooks, and ultra-wide desktop monitors.',
          },
          {
            title: 'High-Converting User Flows',
            description: 'Strategically positioned CTAs, intuitive navigation menus, and frictionless checkout touchpoints.',
          },
          {
            title: 'Zero Third-Party App Bloat',
            description: 'Native code replaces costly monthly apps, drastically boosting store speed and stability.',
          },
          {
            title: 'Drag-and-Drop Marketing Sections',
            description: 'Marketing teams can spin up new landing pages in minutes using custom OS 2.0 blocks.',
          },
          {
            title: 'Built-in SEO Semantics',
            description: 'Correct heading hierarchies, structured markup, and fast rendering that search engines reward.',
          },
        ],
        faqs: [
          {
            question: 'Do you use pre-made templates or design from scratch?',
            answer: 'Every web design project is 100% bespoke. We design completely custom in Figma before writing a single line of code.',
          },
          {
            question: 'Can my marketing team edit content easily without coding?',
            answer: 'Yes! We construct native Shopify OS 2.0 customizer sections, giving your team drag-and-drop control over copy, images, and layout options.',
          },
          {
            question: 'How do you ensure fast page speeds?',
            answer: 'We write lightweight vanilla CSS/JavaScript, optimize all media assets, and avoid jQuery or bloated plugins.',
          },
        ],
        pricing: [
          {
            name: 'Essential Design',
            description: 'Ideal for small brands wanting a fresh, premium redesign of core pages.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '3,999' },
              { currency: 'GBP', symbol: '£', amount: '3,199' },
              { currency: 'AED', symbol: 'AED ', amount: '14,500' },
            ],
            features: [
              'Homepage & 3 Inner Page Templates',
              'Figma Design Prototype',
              'Full Mobile Optimization',
              'Native Section Architecture',
              '14-Day Revision Window',
            ],
          },
          {
            name: 'Full Store Experience',
            description: 'Complete brand overhaul covering homepage, collections, PDPs, and custom landing pages.',
            isPopular: true,
            prices: [
              { currency: 'USD', symbol: '$', amount: '7,999' },
              { currency: 'GBP', symbol: '£', amount: '6,399' },
              { currency: 'AED', symbol: 'AED ', amount: '29,500' },
            ],
            features: [
              'Complete Store Design in Figma',
              'Custom PDP with Upsell Blocks',
              'Modular OS 2.0 Sections',
              'Custom Micro-Animations',
              'Speed Optimization Built-In',
              '30-Day Post-Launch Support',
            ],
          },
          {
            name: 'Flagship Digital Experience',
            description: 'Bespoke high-end digital design system with 3D elements and interactive storytelling.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '16,999+' },
              { currency: 'GBP', symbol: '£', amount: '13,500+' },
              { currency: 'AED', symbol: 'AED ', amount: '62,500+' },
            ],
            features: [
              'Comprehensive Brand Design System',
              'Interactive 3D / Scroll Animations',
              'Headless Hydrogen Architecture',
              'Dedicated Senior Art Director',
              'Unlimited Design Revisions',
              '60-Day Dedicated Support',
            ],
          },
        ],
      },
      'search-engine-optimization': {
        category: 'Growth & Search',
        tagline: 'Technical SEO, structured data, and on-page strategy that ranks your store on Google.',
        iconName: 'Search',
        keyFeatures: [
          'Comprehensive Technical SEO Audits',
          'Rich Product Schema (JSON-LD Markup)',
          'Canonicalization & Duplicate URL Fixes',
          'International Hreflang Configuration',
        ],
        deliverables: [
          'Full Technical SEO Audit & Issue Roadmap',
          'Complete JSON-LD Rich Snippet Integration',
          'Collection & Product Meta Tag Optimization',
          'Custom robots.txt and XML Sitemap Tuning',
          'Monthly Ranking & Organic Revenue Dashboard',
        ],
        technologies: ['Google Search Console', 'Ahrefs', 'Semrush', 'Screaming Frog', 'JSON-LD', 'GA4'],
        process: [
          {
            step: '01',
            title: 'Technical Crawl & Deep Audit',
            description: 'Identifying crawl anomalies, broken redirects, indexation bloat, and Shopify URL duplication issues.',
          },
          {
            step: '02',
            title: 'High-Intent Keyword Mapping',
            description: 'Pinpointing commercial keywords with high purchase intent that your direct competitors have overlooked.',
          },
          {
            step: '03',
            title: 'Code & Schema Implementation',
            description: 'Injecting custom JSON-LD schema, optimizing heading tags, and cleaning up theme code for faster indexing.',
          },
          {
            step: '04',
            title: 'Monitoring & Continuous Growth',
            description: 'Tracking rankings, impressions, organic click-through rates, and algorithmic updates continuously.',
          },
        ],
        benefits: [
          {
            title: 'Predictable Organic Revenue',
            description: 'Reduce heavy reliance on skyrocketing Facebook and Google CPC ad costs.',
          },
          {
            title: 'Rich Snippets in Search',
            description: 'Display star ratings, price, stock status, and delivery badges directly in search results.',
          },
          {
            title: 'Fix Shopify URL Quirks',
            description: 'Resolve the notorious /collections/.../products/ canonical duplication bug once and for all.',
          },
          {
            title: 'Global Organic Footprint',
            description: 'Capture international buyers with accurate geo-targeting and hreflang tag implementation.',
          },
          {
            title: 'Faster Google Indexing',
            description: 'Clean sitemaps and optimized crawl budget ensure new products get indexed within hours.',
          },
          {
            title: 'Transparent Reporting',
            description: 'Clear monthly dashboards detailing traffic growth, keyword progression, and attributable revenue.',
          },
        ],
        faqs: [
          {
            question: 'How long does it take to see SEO improvements?',
            answer: 'Technical fixes and schema markups frequently show indexation and CTR improvements within 3 to 6 weeks. Competitive keyword movements typically compound over 3 to 6 months.',
          },
          {
            question: 'Can you fix Shopify collection URL duplication?',
            answer: 'Yes! Shopify themes default to routing product pages through collections, causing canonical dilution. We rewrite theme link architecture to guarantee direct product URLs across the site.',
          },
          {
            question: 'Is SEO a one-time project or ongoing retainer?',
            answer: 'We offer both one-time technical overhaul packages and ongoing monthly optimization retainers to maintain competitive momentum.',
          },
        ],
        pricing: [
          {
            name: 'Technical Overhaul',
            description: 'One-time complete audit and code remediation of technical SEO and schema barriers.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '2,999' },
              { currency: 'GBP', symbol: '£', amount: '2,399' },
              { currency: 'AED', symbol: 'AED ', amount: '11,000' },
            ],
            features: [
              'Complete 100-Point Technical Audit',
              'JSON-LD Product Schema Implementation',
              'Duplicate Content & Canonical Fixes',
              'Sitemap & Robots.txt Customization',
              'Post-Implementation Verification Report',
            ],
          },
          {
            name: 'Monthly Growth Retainer',
            description: 'Ongoing technical SEO, content strategy, backlink monitoring, and monthly reporting.',
            isPopular: true,
            prices: [
              { currency: 'USD', symbol: '$', amount: '2,499', period: '/mo' },
              { currency: 'GBP', symbol: '£', amount: '1,999', period: '/mo' },
              { currency: 'AED', symbol: 'AED ', amount: '9,200', period: '/mo' },
            ],
            features: [
              'Continuous Keyword Optimization',
              'New Product & Collection SEO',
              'Monthly Crawl & Error Remediations',
              'Competitor SERP Surveillance',
              'Monthly Executive Video Report',
              'Dedicated SEO Strategist',
            ],
          },
          {
            name: 'Global Enterprise SEO',
            description: 'For multi-region brands operating across multiple storefronts and languages.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '5,999', period: '/mo' },
              { currency: 'GBP', symbol: '£', amount: '4,799', period: '/mo' },
              { currency: 'AED', symbol: 'AED ', amount: '22,000', period: '/mo' },
            ],
            features: [
              'Multi-Domain & Subfolder Hreflang Matrix',
              'International Keyword Research',
              'Custom Headless SEO Middleware',
              'Bi-Weekly Strategy Calls',
              'Quarterly Content Audits',
              'Priority Engineering Execution',
            ],
          },
        ],
      },
      'website-maintenance': {
        category: 'Operations & Retainers',
        tagline: 'Proactive 24/7 SLA monitoring, emergency fixes, and ongoing performance retainers.',
        iconName: 'ShieldCheck',
        keyFeatures: [
          '24/7 Real-Time Uptime & Heartbeat Monitoring',
          'Sub-60 Minute Emergency Escalation SLA',
          'Staging-Verified App & Theme Updates',
          'Dedicated Developer Access via Slack',
        ],
        deliverables: [
          'Monthly Health, Speed & Security Report',
          'Dedicated Staging Sandboxes for Pre-Release Testing',
          'Automated Daily Cloud Backups',
          'Security & PCI Compliance Monitoring',
          'Rollover Unused Development Hours',
        ],
        technologies: ['Shopify', 'GitHub', 'Datadog', 'UptimeRobot', 'Slack Connect', 'Trello/Jira'],
        process: [
          {
            step: '01',
            title: 'Onboarding & Codebase Audit',
            description: 'We audit your theme repository, identify legacy script bloat, and establish sandbox staging environments.',
          },
          {
            step: '02',
            title: 'Telemetrics & Heartbeat Setup',
            description: 'Configuring 24/7 checkout monitoring, SSL expiration checks, and automated alerting protocols.',
          },
          {
            step: '03',
            title: 'Continuous Proactive Maintenance',
            description: 'Regular app updates, security patch testing, and speed checks performed without disruption to live shoppers.',
          },
          {
            step: '04',
            title: 'Monthly Feature Iterations',
            description: 'Allocating retainer hours to build new promotional banners, A/B tests, and conversion improvements.',
          },
        ],
        benefits: [
          {
            title: 'Zero Downtime Revenue Loss',
            description: 'Immediate intervention the moment a third-party app or payment gateway misbehaves.',
          },
          {
            title: 'Direct Slack Access',
            description: 'Skip frustrating ticket queues and communicate directly with senior Shopify engineers.',
          },
          {
            title: 'Safe Staging Deployments',
            description: 'Never test code directly on live customers; every change is verified on private staging themes.',
          },
          {
            title: 'Hours Rollover',
            description: 'Unused monthly hours carry over so you get 100% of the value you pay for.',
          },
          {
            title: 'Security Assurance',
            description: 'Continuous monitoring against script injection, unauthorized app permissions, and API exploits.',
          },
          {
            title: 'Stress-Free Scaling',
            description: 'High-demand events like Black Friday / Cyber Monday are fully monitored with engineers on standby.',
          },
        ],
        faqs: [
          {
            question: 'What is your response time for emergency issues?',
            answer: 'Critical checkout or site-down emergencies are escalated immediately with a guaranteed response time under 60 minutes, 24/7/365.',
          },
          {
            question: 'Can we use retainer hours for new feature development?',
            answer: 'Absolutely! Retainer hours can be used for bug fixes, app installations, custom sections, page redesigns, or speed enhancements.',
          },
          {
            question: 'Do unused hours expire?',
            answer: 'No. Unused retainer hours roll over to the subsequent month, giving you the flexibility to tackle larger projects when ready.',
          },
        ],
        pricing: [
          {
            name: 'Essential Care',
            description: 'Core monitoring and maintenance for established single-market Shopify stores.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '1,499', period: '/mo' },
              { currency: 'GBP', symbol: '£', amount: '1,199', period: '/mo' },
              { currency: 'AED', symbol: 'AED ', amount: '5,500', period: '/mo' },
            ],
            features: [
              '10 Dev Hours / Month',
              '24/7 Uptime & Heartbeat Monitoring',
              'Sub-2-Hour Emergency Response',
              'Staging Environment Setup',
              'Monthly Speed & Health Audit',
              'Shared Slack Channel',
            ],
          },
          {
            name: 'Pro Retainer',
            description: 'For growing D2C brands wanting regular UX updates, A/B testing, and fast turnarounds.',
            isPopular: true,
            prices: [
              { currency: 'USD', symbol: '$', amount: '2,999', period: '/mo' },
              { currency: 'GBP', symbol: '£', amount: '2,399', period: '/mo' },
              { currency: 'AED', symbol: 'AED ', amount: '11,000', period: '/mo' },
            ],
            features: [
              '25 Dev Hours / Month',
              'Sub-60 Minute Emergency SLA',
              'Dedicated Lead Shopify Developer',
              'Continuous Speed Optimization',
              'A/B Testing Implementation',
              'Hours Rollover Included',
            ],
          },
          {
            name: 'Enterprise Dedicated',
            description: 'Full-service engineering team extension for high-scale Shopify Plus stores.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '5,999', period: '/mo' },
              { currency: 'GBP', symbol: '£', amount: '4,799', period: '/mo' },
              { currency: 'AED', symbol: 'AED ', amount: '22,000', period: '/mo' },
            ],
            features: [
              '60 Dev Hours / Month',
              '24/7 Priority Emergency Coverage',
              'Dedicated Technical Project Manager',
              'BFCM / Flash Sale Live Standby',
              'Custom Private App Maintenance',
              'Weekly Sprint Planning Calls',
            ],
          },
        ],
      },
      'theme-customization': {
        category: 'Design & Engineering',
        tagline: 'Bespoke Shopify theme engineering tailored to your brand identity and conversion goals.',
        iconName: 'Sliders',
        keyFeatures: [
          'Native Shopify OS 2.0 Section Architecture',
          'Dynamic In-Cart Upsells & Bundle Builders',
          'Tailored Product Detail Page (PDP) Layouts',
          'Clean, Vanilla Code without App Subscriptions',
        ],
        deliverables: [
          'Custom Modular Theme Sections with Full Admin Controls',
          'Sticky Add-to-Cart & Slide-Out Cart Drawer',
          'Custom Swatch & Variant Selector Modules',
          'Social Proof & Review Integration Blocks',
          '1-on-1 Admin Training for Marketing Team',
        ],
        technologies: ['Shopify Liquid', 'Theme App Extensions', 'CSS Modules', 'JavaScript ES6+', 'Figma'],
        process: [
          {
            step: '01',
            title: 'Theme Audit & Scoping',
            description: 'Analyzing your current theme architecture, identifying limitations, and planning required custom components.',
          },
          {
            step: '02',
            title: 'Design & Interaction Specification',
            description: 'Designing bespoke modules and interactions in Figma to match your visual guidelines.',
          },
          {
            step: '03',
            title: 'Modular Liquid Development',
            description: 'Writing performant, modular Liquid sections equipped with customizer settings for effortless editing.',
          },
          {
            step: '04',
            title: 'Testing & Preview Handover',
            description: 'Verifying on preview themes across mobile and desktop before seamless publishing.',
          },
        ],
        benefits: [
          {
            title: 'Replace Monthly App Fees',
            description: 'Native code replaces costly monthly apps for sticky carts, swatches, and badges, saving thousands annually.',
          },
          {
            title: 'Tailored to Your Identity',
            description: 'Break free from rigid templates with sections customized to your exact creative direction.',
          },
          {
            title: 'Higher Conversion on PDPs',
            description: 'Custom product tabs, size guides, countdown timers, and trust badges designed to eliminate hesitation.',
          },
          {
            title: 'Effortless Marketing Management',
            description: 'Your marketing team can drag, reorder, and tweak content without writing a single line of HTML.',
          },
          {
            title: 'Zero Negative Speed Impact',
            description: 'Ultra-lightweight native code ensures your store maintains top speed ratings.',
          },
          {
            title: 'Future-Proof Compatibility',
            description: 'Strict adherence to modern Shopify standards guarantees themes remain stable through updates.',
          },
        ],
        faqs: [
          {
            question: 'Can you customize our existing theme without starting from scratch?',
            answer: 'Yes! Most of our customization clients retain their existing base theme while we design and code high-impact custom sections.',
          },
          {
            question: 'Will our changes affect live customers during development?',
            answer: 'Never. All customization work is developed on an unpublished preview theme until you have reviewed and approved every detail.',
          },
          {
            question: 'Can we configure the new sections in the Shopify customizer?',
            answer: 'Yes, every custom section includes rich schema settings allowing your team to update headings, colors, images, and layout options directly.',
          },
        ],
        pricing: [
          {
            name: 'Single Feature Sprint',
            description: 'Quick implementation of a specific custom feature (e.g., custom cart drawer or bundle builder).',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '1,499' },
              { currency: 'GBP', symbol: '£', amount: '1,199' },
              { currency: 'AED', symbol: 'AED ', amount: '5,500' },
            ],
            features: [
              '1 Custom Feature or Section',
              'Full Shopify Customizer Controls',
              'Desktop & Mobile Optimization',
              'Staging Preview Review',
              '7-Day Revision Window',
            ],
          },
          {
            name: 'PDP Overhaul Pack',
            description: 'Complete redesign and custom build of your product detail and collection pages.',
            isPopular: true,
            prices: [
              { currency: 'USD', symbol: '$', amount: '3,999' },
              { currency: 'GBP', symbol: '£', amount: '3,199' },
              { currency: 'AED', symbol: 'AED ', amount: '14,500' },
            ],
            features: [
              '3 Bespoke Modular Sections',
              'Custom Sticky Add-to-Cart',
              'Dynamic Swatches & Size Guides',
              'In-Cart Upsell & Cross-Sell Drawer',
              'Core Web Vitals Check',
              '14-Day Post-Launch Support',
            ],
          },
          {
            name: 'Full Theme Transformation',
            description: 'Comprehensive transformation of your entire storefront into a bespoke digital flagship.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '7,999' },
              { currency: 'GBP', symbol: '£', amount: '6,399' },
              { currency: 'AED', symbol: 'AED ', amount: '29,500' },
            ],
            features: [
              'Up to 8 Custom Modular Sections',
              'Global Brand Typography & Styling',
              'Bespoke Header & Mega-Menu',
              'Slide-Out Quick View & Cart Drawer',
              'Full Native App Replacement',
              '30-Day Post-Launch Support',
            ],
          },
        ],
      },
      'store-optimization': {
        category: 'Performance & CRO',
        tagline: 'Boost conversions, slash bounce rates, and accelerate page speed to maximize revenue.',
        iconName: 'Zap',
        keyFeatures: [
          'Conversion Rate Optimization (CRO) Funnel Audits',
          'Google Core Web Vitals 90+ Score Guarantee',
          'Unused Script & Heavy App Purge',
          'Checkout Friction Removal & Cart Optimization',
        ],
        deliverables: [
          'Full Behavioral CRO & Speed Benchmark Report',
          'Critical Rendering Path Code Optimization',
          'Elimination of Render-Blocking JavaScript',
          'Optimized Image & Font Delivery Setup',
          'Before-and-After Performance & Conversion Verification',
        ],
        technologies: ['Google Lighthouse', 'PageSpeed Insights', 'Hotjar', 'Microsoft Clarity', 'WebP/AVIF', 'GA4'],
        process: [
          {
            step: '01',
            title: 'Diagnostic Audit & Heatmap Analysis',
            description: 'We analyze page drop-offs, user session replays, and Core Web Vitals scores to pinpoint revenue leaks.',
          },
          {
            step: '02',
            title: 'Prioritized Action Blueprint',
            description: 'Formulating a tactical remediation plan targeting high-impact speed gains and checkout friction removal.',
          },
          {
            step: '03',
            title: 'Deep Code Refactoring',
            description: 'Purging dead app code, deferring non-critical scripts, pre-loading critical fonts, and minifying payloads.',
          },
          {
            step: '04',
            title: 'Validation & Conversion Tracking',
            description: 'Benchmarking on Google Lighthouse and real-world field metrics to document measurable ROI and conversion lift.',
          },
        ],
        benefits: [
          {
            title: 'Lower Customer Acquisition Cost (CAC)',
            description: 'Converting a higher percentage of visitors multiplies the return on every ad dollar spent.',
          },
          {
            title: '90+ Google PageSpeed Scores',
            description: 'Passing Google Core Web Vitals earns search ranking boosts and lower bounce rates.',
          },
          {
            title: 'Frictionless Mobile Checkout',
            description: 'Eliminate frustrating layout shifts (CLS) and input delays on touch devices.',
          },
          {
            title: 'Higher Average Order Value',
            description: 'Deploy smart in-cart cross-sells, free shipping thresholds, and volume discount tiers.',
          },
          {
            title: 'Clean Codebase',
            description: 'Remove ghost scripts left behind by uninstalled apps that secretly drag your store down.',
          },
          {
            title: 'Data-Backed Conversions',
            description: 'Every recommendation is proven through real user recordings, heatmaps, and funnel analytics.',
          },
        ],
        faqs: [
          {
            question: 'How much faster will our store get?',
            answer: 'Most stores we optimize see page load times decrease by 40% to 70%, with mobile PageSpeed scores jumping from the 20s–40s into the 85–95+ range.',
          },
          {
            question: 'Will speed optimization break our tracking pixels or apps?',
            answer: 'Never. We safely defer and asynchronously load marketing pixels (Meta, TikTok, Google) so they record every event accurately without blocking visual page rendering.',
          },
          {
            question: 'Is your score guarantee based on lab data or real users?',
            answer: 'Both! We optimize for Google Lighthouse lab scores and real-world Chrome User Experience (CrUX) field data to pass Core Web Vitals.',
          },
        ],
        pricing: [
          {
            name: 'Speed Sprint',
            description: 'Targeted Core Web Vitals remediation focused on mobile page speed acceleration.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '1,999' },
              { currency: 'GBP', symbol: '£', amount: '1,599' },
              { currency: 'AED', symbol: 'AED ', amount: '7,500' },
            ],
            features: [
              'Core Web Vitals Optimization',
              'Dead Script & App Purge',
              'Font & Media Preloading',
              'JavaScript Deferral & Minification',
              'Before/After Performance Report',
            ],
          },
          {
            name: 'Speed + CRO Engine',
            description: 'Comprehensive speed overhaul combined with full conversion funnel optimization.',
            isPopular: true,
            prices: [
              { currency: 'USD', symbol: '$', amount: '4,499' },
              { currency: 'GBP', symbol: '£', amount: '3,599' },
              { currency: 'AED', symbol: 'AED ', amount: '16,500' },
            ],
            features: [
              'Everything in Speed Sprint',
              'Full Heatmap & Session Replay Audit',
              'Checkout & Cart Drawer Optimization',
              'Mobile Friction & UX Enhancement',
              'Free Shipping Threshold Bar',
              '30-Day Conversion Monitoring',
            ],
          },
          {
            name: 'Continuous Growth Retainer',
            description: 'Ongoing speed maintenance, monthly A/B experiments, and conversion rate maximization.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '3,499', period: '/mo' },
              { currency: 'GBP', symbol: '£', amount: '2,799', period: '/mo' },
              { currency: 'AED', symbol: 'AED ', amount: '12,900', period: '/mo' },
            ],
            features: [
              'Continuous Performance Monitoring',
              'Monthly A/B Test Implementation',
              'PDP & Cart Conversion Iterations',
              'Dedicated CRO Specialist',
              'Bi-Weekly Results Review Call',
              'Guaranteed Core Web Vitals Compliance',
            ],
          },
        ],
      },
      'store-setup': {
        category: 'Setup & Launch',
        tagline: 'Turnkey Shopify store setup, configuration, and launch — executed right the first time.',
        iconName: 'Rocket',
        keyFeatures: [
          'Turnkey Shopify Store & Account Configuration',
          'Global Payment Gateway & Payout Setup',
          'Shipping Zones, Rates & Tax Nexus Matrix',
          'Product Catalog Hierarchy & Collection Setup',
        ],
        deliverables: [
          'Complete, Launch-Ready Shopify Store',
          'Standard Legal Pages (Privacy, Terms, Refunds)',
          'Branded Order Notification Emails',
          'Google Analytics 4 & Meta Pixel Integration',
          '1-on-1 Operational Handoff & Training Call',
        ],
        technologies: ['Shopify', 'Stripe', 'PayPal', 'Klaviyo', 'Google Merchant Center', 'Meta Business'],
        process: [
          {
            step: '01',
            title: 'Onboarding & Asset Collection',
            description: 'Gathering your brand assets, catalog spreadsheets, payment documentation, and shipping requirements.',
          },
          {
            step: '02',
            title: 'Platform Architecture & Settings',
            description: 'Configuring Shopify admin settings, tax Nexus rules, shipping zones, and currency configurations.',
          },
          {
            step: '03',
            title: 'Catalog & Payment Integrations',
            description: 'Structuring product categories, importing SKUs, connecting gateways, and wiring up customer accounts.',
          },
          {
            step: '04',
            title: 'Test Orders & Official Launch',
            description: 'Executing end-to-end test transactions, connecting custom domain, and handing over the keys.',
          },
        ],
        benefits: [
          {
            title: 'Fast-Track Go-to-Market',
            description: 'Go from concept to a live, payment-ready store in as little as 10 to 14 business days.',
          },
          {
            title: 'Eliminate Technical Headaches',
            description: 'No wrestling with complex tax calculations, DNS records, or payment gateway verification.',
          },
          {
            title: 'Clean Data Taxonomy',
            description: 'Correct collection structures and product tags prevent operational friction as you scale.',
          },
          {
            title: 'Professional Customer Touchpoints',
            description: 'Branded email confirmations, packing slips, and order tracking notifications.',
          },
          {
            title: '100% Account Ownership',
            description: 'You own every account, asset, and integration directly with no agency hostage situations.',
          },
          {
            title: 'Hands-On Admin Training',
            description: 'We teach your team how to fulfill orders, manage inventory, and launch new products with ease.',
          },
        ],
        faqs: [
          {
            question: 'How fast can our store go live?',
            answer: 'Turnkey store setup is typically completed within 10 to 14 business days once all catalog data and branding assets are received.',
          },
          {
            question: 'Do we need an active paid Shopify subscription to start?',
            answer: 'No. As official Shopify Partners, we build your store on a development account with unlimited trial time, so you only pay Shopify once you are ready to launch.',
          },
          {
            question: 'What happens after the store is launched?',
            answer: 'We provide 14 to 30 days of post-launch hypercare to assist with live orders and operational questions, plus options for ongoing maintenance retainers.',
          },
        ],
        pricing: [
          {
            name: 'Quick Launch',
            description: 'Essential turnkey setup for new merchants with a curated catalog ready to start selling.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '2,499' },
              { currency: 'GBP', symbol: '£', amount: '1,999' },
              { currency: 'AED', symbol: 'AED ', amount: '9,200' },
            ],
            features: [
              'Complete Shopify Account Setup',
              'Up to 25 Products Configured',
              'Payment & Shipping Setup',
              'Standard Legal & Policy Pages',
              'Custom Domain DNS Connection',
              '14-Day Post-Launch Support',
            ],
          },
          {
            name: 'Turnkey Flagship Setup',
            description: 'Comprehensive setup including advanced shipping rules, review apps, and email marketing.',
            isPopular: true,
            prices: [
              { currency: 'USD', symbol: '$', amount: '4,999' },
              { currency: 'GBP', symbol: '£', amount: '3,999' },
              { currency: 'AED', symbol: 'AED ', amount: '18,500' },
            ],
            features: [
              'Complete Store & Theme Setup',
              'Up to 100 Products Configured',
              'Advanced Shipping Zones & Tax Rules',
              'Klaviyo Email Template Integration',
              'Product Reviews & Trust Badges',
              '1-on-1 Admin Training Session',
              '30-Day Dedicated Support',
            ],
          },
          {
            name: 'Multi-Channel Enterprise',
            description: 'For brands launching with complex catalogs, wholesale B2B channels, or marketplace sync.',
            isPopular: false,
            prices: [
              { currency: 'USD', symbol: '$', amount: '9,999+' },
              { currency: 'GBP', symbol: '£', amount: '7,999+' },
              { currency: 'AED', symbol: 'AED ', amount: '36,500+' },
            ],
            features: [
              'Unlimited Catalog SKU Migration',
              'Amazon / eBay / TikTok Shop Sync',
              'B2B Customer Tiers & Pricing',
              'Multi-Warehouse Inventory Routing',
              'Custom Notification Workflows',
              '60-Day Post-Launch Support',
            ],
          },
        ],
      },
    };

    return metadata[slug] || {
      category: 'E-Commerce',
      tagline: '',
      iconName: 'Layers',
      keyFeatures: [
        'Enterprise Shopify Architecture',
        'Custom Liquid & Headless Stack',
        'High-Speed Core Web Vitals SLA',
        'Dedicated Senior Engineer Execution',
      ],
      deliverables: [
        'Production-Ready Shopify Theme Files',
        'Custom Admin Settings & Modular Sections',
        'Quality Assurance & Speed Benchmarking Report',
      ],
      technologies: ['Shopify Plus', 'Liquid', 'TypeScript', 'TailwindCSS'],
      process: [],
      benefits: [],
      faqs: [],
      pricing: [],
    };
  }

  // 2. Solutions
  async getSolutions() {
    const solutions = await this.prisma.solution.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });

    return solutions.map((sol) => ({
      id: sol.id,
      slug: sol.slug,
      title: sol.title,
      industry: 'Global Financial Infrastructure & Critical Systems',
      summary: sol.summary,
      challenge: 'Legacy core bottlenecks, batch window failures, and geographic single points of failure.',
      solution: 'Distributed state consensus mesh, microsecond streaming settlement, and multi-region failover.',
      roi: '99.999% Availability & 85% reduction in transactional latency',
      compliance: ['PCI DSS v4.0 Level 1', 'SOC 2 Type II', 'ISO/IEC 27001:2022'],
    }));
  }

  async getSolutionBySlug(slug: string) {
    const sol = await this.prisma.solution.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!sol) throw new NotFoundException(`Solution '${slug}' not found`);

    return {
      id: sol.id,
      slug: sol.slug,
      title: sol.title,
      industry: 'Global Financial Infrastructure & Critical Systems',
      summary: sol.summary,
      challenge: 'Legacy core bottlenecks, batch window failures, and geographic single points of failure.',
      solution: 'Distributed state consensus mesh, microsecond streaming settlement, and multi-region failover.',
      roi: '99.999% Availability & 85% reduction in transactional latency',
      compliance: ['PCI DSS v4.0 Level 1', 'SOC 2 Type II', 'ISO/IEC 27001:2022'],
    };
  }

  // 3. Case Studies
  async getCaseStudies() {
    const items = await this.prisma.caseStudy.findMany({
      where: { deletedAt: null },
      include: {
        client: {
          include: { industry: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((cs) => ({
      id: cs.id,
      slug: cs.slug,
      title: cs.title,
      client: cs.client?.name || 'Apex Global Financial Group',
      clientTier: cs.client?.tier || 'STRATEGIC',
      industry: cs.client?.industry?.name || 'Financial Services',
      summary: cs.summary,
      challenge: cs.challengeStatement,
      solution: cs.solutionStatement,
      impactMetrics: (cs.impactMetrics as any[]) || [
        { metric: '99.999%', label: 'Availability', description: 'Zero downtime achieved during 24 months of continuous operations' },
        { metric: '$18B/day', label: 'Volume Processed', description: 'Across 14 global financial settlement nodes' },
        { metric: '1.8ms', label: 'End-to-End Latency', description: 'Down from 8 hours batch clearance' },
      ],
      clientQuote: {
        quote: 'Gypsym Technology engineered our mission-critical distributed clearing core with zero downtime. Their technical depth in distributed consensus and deterministic recovery is unprecedented.',
        author: 'Dr. Elena Rostova',
        role: 'Chief Information Officer, Apex Global Financial Group',
      },
    }));
  }

  async getCaseStudyBySlug(slug: string) {
    const cs = await this.prisma.caseStudy.findFirst({
      where: { slug, deletedAt: null },
      include: {
        client: {
          include: { industry: true },
        },
      },
    });
    if (!cs) throw new NotFoundException(`Case study '${slug}' not found`);

    return {
      id: cs.id,
      slug: cs.slug,
      title: cs.title,
      client: cs.client?.name || 'Apex Global Financial Group',
      clientTier: cs.client?.tier || 'STRATEGIC',
      industry: cs.client?.industry?.name || 'Financial Services',
      summary: cs.summary,
      challenge: cs.challengeStatement,
      solution: cs.solutionStatement,
      impactMetrics: (cs.impactMetrics as any[]) || [
        { metric: '99.999%', label: 'Availability', description: 'Zero downtime achieved during 24 months of continuous operations' },
        { metric: '$18B/day', label: 'Volume Processed', description: 'Across 14 global financial settlement nodes' },
        { metric: '1.8ms', label: 'End-to-End Latency', description: 'Down from 8 hours batch clearance' },
      ],
      clientQuote: {
        quote: 'Gypsym Technology engineered our mission-critical distributed clearing core with zero downtime.',
        author: 'Dr. Elena Rostova',
        role: 'Chief Information Officer, Apex Global Financial Group',
      },
    };
  }

  // 4. Blog Posts & Editorial
  async getBlogCategories(): Promise<any[]> {
    const categories = await this.prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { deletedAt: null, status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      postCount: c._count.posts,
    }));
  }

  async getBlogPosts(query?: { category?: string; search?: string; limit?: number }): Promise<any[]> {
    const where: any = {
      deletedAt: null,
      status: 'PUBLISHED',
    };

    if (query?.category && query.category !== 'all') {
      where.OR = [
        { category: { slug: query.category } },
        { category: { name: { contains: query.category, mode: 'insensitive' } } },
      ];
    }

    if (query?.search && query.search.trim()) {
      const term = query.search.trim();
      where.AND = [
        {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { excerpt: { contains: term, mode: 'insensitive' } },
            { tags: { some: { tag: { name: { contains: term, mode: 'insensitive' } } } } },
          ],
        },
      ];
    }

    const posts = await this.prisma.blogPost.findMany({
      where,
      include: {
        author: true,
        category: true,
        featuredImage: true,
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: query?.limit ? Number(query.limit) : undefined,
    });

    const authorSetting = await this.getAuthorSettings().catch(() => null);
    return posts.map((p) => this.formatBlogPostSummary(p, authorSetting));
  }

  async getBlogPostBySlug(slug: string): Promise<any> {
    const p = await this.prisma.blogPost.findFirst({
      where: { slug, deletedAt: null },
      include: {
        author: true,
        category: true,
        featuredImage: true,
        tags: {
          include: { tag: true },
        },
      },
    });
    if (!p) throw new NotFoundException(`Blog post '${slug}' not found`);

    // Increment view count asynchronously
    this.prisma.blogPost
      .update({
        where: { id: p.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    // Fetch up to 3 related posts in the same category or latest
    const relatedRaw = await this.prisma.blogPost.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        id: { not: p.id },
        ...(p.categoryId ? { categoryId: p.categoryId } : {}),
      },
      include: {
        category: true,
        featuredImage: true,
        author: true,
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    const authorSetting = await this.getAuthorSettings().catch(() => null);
    const related = relatedRaw.map((r) => this.formatBlogPostSummary(r, authorSetting));

    return {
      ...this.formatBlogPostSummary(p, authorSetting),
      bodyContent: p.bodyContent,
      related,
    };
  }

  private formatBlogPostSummary(p: any, authorSetting?: any) {
    const authorName = authorSetting?.name || (p.author ? `${p.author.firstName} ${p.author.lastName}`.trim() : 'MohammadAli Kadiwal');
    const authorRole = authorSetting?.role || 'Chief Technology Officer & Lead Architect';
    const authorAvatar = authorSetting?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
    const authorBio = authorSetting?.bio || 'Leading high-concurrency cloud architectures and distributed microservices.';
    const authorSocials = authorSetting?.socials || {};

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      status: p.status,
      category: p.category
        ? {
            id: p.category.id,
            name: p.category.name,
            slug: p.category.slug,
          }
        : { id: '', name: 'General', slug: 'general' },
      author: {
        name: authorName,
        role: authorRole,
        avatar: authorAvatar,
        bio: authorBio,
        socials: authorSocials,
      },
      featuredImage: p.featuredImage
        ? {
            url: p.featuredImage.storageKey,
            alt: p.featuredImage.altText || p.title,
          }
        : null,
      coverImage:
        p.featuredImage?.storageKey ||
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
      readTimeMinutes: p.readTimeMinutes || 8,
      readTime: `${p.readTimeMinutes || 8} min read`,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : p.createdAt.toISOString(),
      publishedDate: p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : p.createdAt.toISOString().split('T')[0],
      viewCount: Number(p.viewCount || 0),
      tags: p.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
    };
  }

  // Admin CMS endpoints
  async getCmsBlogPosts(query?: { search?: string; status?: string }): Promise<any[]> {
    const where: any = { deletedAt: null };
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ];
    }

    const posts = await this.prisma.blogPost.findMany({
      where,
      include: {
        author: true,
        category: true,
        featuredImage: true,
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const authorSetting = await this.getAuthorSettings().catch(() => null);
    return posts.map((p) => this.formatBlogPostSummary(p, authorSetting));
  }

  async createBlogPost(dto: any, authorId?: string): Promise<any> {
    const defaultAuthor = await this.prisma.user.findFirst();
    const resolvedAuthorId = authorId || dto.authorId || defaultAuthor?.id;

    // Resolve or find category
    let categoryId = dto.categoryId;
    if (!categoryId && dto.category) {
      const cat = await this.prisma.blogCategory.findFirst({
        where: { OR: [{ slug: dto.category }, { name: dto.category }] },
      });
      if (cat) categoryId = cat.id;
    }
    if (!categoryId) {
      const firstCat = await this.prisma.blogCategory.findFirst();
      categoryId = firstCat?.id;
    }

    // Resolve cover image
    let featuredImageId = dto.featuredImageId;
    if (dto.coverImage && !featuredImageId) {
      const media = await this.prisma.media.upsert({
        where: { storageKey: dto.coverImage },
        update: { altText: dto.title },
        create: {
          originalFilename: `${dto.slug || 'blog'}-cover.jpg`,
          storageKey: dto.coverImage,
          mimeType: 'image/jpeg',
          fileSizeBytes: BigInt(200000),
          altText: dto.title,
        },
      });
      featuredImageId = media.id;
    }

    const slug = (dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

    const post = await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt || '',
        bodyContent: dto.bodyContent || {
          sections: [{ heading: 'Introduction', paragraphs: [dto.content || dto.excerpt || ''] }],
        },
        readTimeMinutes: Number(dto.readTimeMinutes) || 8,
        status: dto.status || 'PUBLISHED',
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
        authorId: resolvedAuthorId,
        categoryId,
        featuredImageId,
      },
      include: {
        author: true,
        category: true,
        featuredImage: true,
        tags: { include: { tag: true } },
      },
    });

    return this.formatBlogPostSummary(post);
  }

  async updateBlogPost(id: string, dto: any): Promise<any> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Blog post with ID ${id} not found`);

    let featuredImageId = dto.featuredImageId;
    if (dto.coverImage && (!featuredImageId || dto.coverImage !== existing.featuredImageId)) {
      const media = await this.prisma.media.upsert({
        where: { storageKey: dto.coverImage },
        update: { altText: dto.title || existing.title },
        create: {
          originalFilename: `${existing.slug}-cover.jpg`,
          storageKey: dto.coverImage,
          mimeType: 'image/jpeg',
          fileSizeBytes: BigInt(200000),
          altText: dto.title || existing.title,
        },
      });
      featuredImageId = media.id;
    }

    let categoryId = dto.categoryId;
    if (!categoryId && dto.category) {
      const cat = await this.prisma.blogCategory.findFirst({
        where: { OR: [{ slug: dto.category }, { name: dto.category }] },
      });
      if (cat) categoryId = cat.id;
    }

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.slug ? { slug: dto.slug } : {}),
        ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
        ...(dto.bodyContent !== undefined ? { bodyContent: dto.bodyContent } : {}),
        ...(dto.readTimeMinutes ? { readTimeMinutes: Number(dto.readTimeMinutes) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.status === 'PUBLISHED' && !existing.publishedAt ? { publishedAt: new Date() } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(featuredImageId ? { featuredImageId } : {}),
      },
      include: {
        author: true,
        category: true,
        featuredImage: true,
        tags: { include: { tag: true } },
      },
    });

    return this.formatBlogPostSummary(updated);
  }

  async deleteBlogPost(id: string): Promise<{ success: boolean }> {
    await this.prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async bulkUpdateBlogPostStatus(ids: string[], status: any): Promise<{ count: number }> {
    const updateData: any = { status };
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }
    const result = await this.prisma.blogPost.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: updateData,
    });
    return { count: result.count };
  }

  async bulkDeleteBlogPosts(ids: string[]): Promise<{ count: number }> {
    const result = await this.prisma.blogPost.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
    return { count: result.count };
  }

  // ─── Author Profile Settings ────────────────────────────────────────────────
  async getAuthorSettings(): Promise<any> {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'editorial:author' },
    });
    if (setting?.value) {
      return setting.value;
    }
    return {
      name: 'MohammadAli Kadiwal',
      role: 'Chief Technology Officer & Lead Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Leading high-concurrency cloud architectures, Next.js commerce ecosystems, and distributed microservices with over a decade of hands-on production engineering.',
      extendedBio: 'MohammadAli Kadiwal is the Chief Technology Officer and Lead Solutions Architect at Gypsym Technology. Specializing in cloud infrastructure, headless e-commerce, and high-performance engineering, he oversees technical strategy and system architectures across enterprise client deployments globally.',
      email: 'author@gypsym.com',
      phone: '+1 (555) 019-2834',
      location: 'Dubai, UAE & San Francisco, CA',
      website: 'https://gypsym.com',
      socials: {
        linkedin: 'https://linkedin.com/company/gypsym',
        twitter: 'https://twitter.com/gypsym',
        github: 'https://github.com/gypsym',
        website: 'https://gypsym.com',
      },
      expertise: ['Cloud Architecture', 'Next.js & React', 'Distributed Systems', 'Headless Commerce', 'Cybersecurity', 'AI & GEO Integration'],
      credentials: ['AWS Certified Solutions Architect - Professional', 'Google Cloud Certified Professional Cloud Architect', 'Kubernetes CKA', 'Shopify Plus Partner'],
    };
  }

  async updateAuthorSettings(dto: any, userId?: string): Promise<any> {
    const setting = await this.prisma.siteSetting.upsert({
      where: { key: 'editorial:author' },
      create: {
        key: 'editorial:author',
        category: 'editorial',
        isPublic: true,
        value: dto,
        updatedBy: userId || null,
      },
      update: {
        value: dto,
        updatedBy: userId || null,
      },
    });
    return setting.value;
  }

  // 5. Jobs / Careers
  async getJobs() {
    const jobs = await this.prisma.job.findMany({
      where: { deletedAt: null },
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((j) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      department: j.department?.name || 'Cloud & Distributed Systems',
      location: j.locationName || 'North America / EMEA (Remote)',
      type: j.employmentType === 'FULL_TIME' ? 'Full-time' : 'Contract',
      experience: j.experienceLevel || 'Principal',
      salaryRange: j.salaryRangeDisplay || '$240,000 - $310,000 USD + Equity',
      overview: j.overview,
      responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [],
    }));
  }

  async getJobBySlug(slug: string) {
    const j = await this.prisma.job.findFirst({
      where: { slug, deletedAt: null },
      include: { department: true },
    });
    if (!j) throw new NotFoundException(`Job '${slug}' not found`);

    return {
      id: j.id,
      slug: j.slug,
      title: j.title,
      department: j.department?.name || 'Cloud & Distributed Systems',
      location: j.locationName || 'North America / EMEA (Remote)',
      type: j.employmentType === 'FULL_TIME' ? 'Full-time' : 'Contract',
      experience: j.experienceLevel || 'Principal',
      salaryRange: j.salaryRangeDisplay || '$240,000 - $310,000 USD + Equity',
      overview: j.overview,
      responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [],
    };
  }

  // 6. Team
  async getTeam() {
    const members = await this.prisma.teamMember.findMany({
      where: { isActive: true },
      include: { department: true },
      orderBy: { displayOrder: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      slug: m.slug,
      name: `${m.firstName} ${m.lastName}`,
      role: m.roleTitle,
      department: m.department?.name || 'Executive Leadership',
      bio: m.bio || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      socialLinks: {
        linkedin: m.linkedinUrl || 'https://linkedin.com/company/gypsym',
        twitter: m.twitterUrl || 'https://twitter.com/gypsymtech',
        github: m.githubUrl || 'https://github.com/gypsym',
      },
    }));
  }

  // 7. Dynamic Brand Settings
  async getBrandSettings(): Promise<any> {
    const brand = await this.prisma.brandSetting.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
      include: {
        logoLight: true,
        logoDark: true,
        favicon: true,
      },
    });

    if (!brand) {
      throw new NotFoundException('Active brand settings not found in database');
    }

    return {
      id: brand.id,
      companyName: brand.companyName,
      colors: brand.colors,
      typography: brand.typography,
      socialLinks: brand.socialLinks,
      logoLight: this.logoUrlFromMedia(brand.logoLight) || brand.logoLight?.storageKey || null,
      logoDark: this.logoUrlFromMedia(brand.logoDark) || brand.logoDark?.storageKey || null,
      favicon: this.logoUrlFromMedia(brand.favicon) || brand.favicon?.storageKey || null,
    };
  }

  async updateBrandSettings(body: {
    companyName?: string;
    logoLightUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string;
    colors?: any;
    typography?: any;
    socialLinks?: any;
  }): Promise<any> {
    const active = await this.prisma.brandSetting.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    const getMediaId = async (url?: string, name = 'brand-asset') => {
      if (!url) return undefined;
      const media = await this.prisma.media.create({
        data: {
          originalFilename: `${name}-${Date.now()}`,
          mimeType: url.includes('svg') ? 'image/svg+xml' : 'image/png',
          fileSizeBytes: BigInt(url.length),
          storageKey: `brand/${name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          variants: { original: url, lg: url, md: url },
        },
      });
      return media.id;
    };

    const logoLightId = body.logoLightUrl !== undefined ? await getMediaId(body.logoLightUrl, 'logo-light') : undefined;
    const logoDarkId = body.logoDarkUrl !== undefined ? await getMediaId(body.logoDarkUrl, 'logo-dark') : undefined;
    const faviconId = body.faviconUrl !== undefined ? await getMediaId(body.faviconUrl, 'favicon') : undefined;

    if (active) {
      await this.prisma.brandSetting.update({
        where: { id: active.id },
        data: {
          ...(body.companyName ? { companyName: body.companyName } : {}),
          ...(logoLightId !== undefined ? { logoLightId } : {}),
          ...(logoDarkId !== undefined ? { logoDarkId } : {}),
          ...(faviconId !== undefined ? { faviconId } : {}),
          ...(body.colors ? { colors: body.colors } : {}),
          ...(body.typography ? { typography: body.typography } : {}),
          ...(body.socialLinks !== undefined ? { socialLinks: body.socialLinks } : {}),
        },
      });
    } else {
      await this.prisma.brandSetting.create({
        data: {
          companyName: body.companyName || 'Gypsym Technology',
          logoLightId: logoLightId || null,
          logoDarkId: logoDarkId || null,
          faviconId: faviconId || null,
          colors: body.colors || {},
          typography: body.typography || {},
          socialLinks: body.socialLinks || [],
          isActive: true,
        },
      });
    }

    if (body.faviconUrl) {
      try {
        const seoGlobal = await this.prisma.siteSetting.findUnique({ where: { key: 'seo:global' } });
        if (seoGlobal && typeof seoGlobal.value === 'object') {
          await this.prisma.siteSetting.update({
            where: { key: 'seo:global' },
            data: {
              value: {
                ...(seoGlobal.value as Record<string, any>),
                favicon: body.faviconUrl,
              },
            },
          });
        }
      } catch {
        // Non-critical sync failure
      }
    }

    return this.getBrandSettings();
  }

  // 7.1 Dedicated Social Profiles Management
  async getSocialLinks(): Promise<any[]> {
    const brand = await this.prisma.brandSetting.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
      select: { socialLinks: true },
    });
    return Array.isArray(brand?.socialLinks) ? (brand.socialLinks as any[]) : [];
  }

  async updateSocialLinks(socialLinks: any[]): Promise<any[]> {
    const active = await this.prisma.brandSetting.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });
    if (active) {
      await this.prisma.brandSetting.update({
        where: { id: active.id },
        data: {
          socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
        },
      });
    } else {
      await this.prisma.brandSetting.create({
        data: {
          companyName: 'Gypsym Technology',
          colors: {},
          typography: {},
          socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
          isActive: true,
        },
      });
    }
    return this.getSocialLinks();
  }

  // 8. Site Settings
  async getSiteSettings(): Promise<Record<string, any>> {
    const settings = await this.prisma.siteSetting.findMany({
      where: { isPublic: true },
    });

    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async getSeoSettings(): Promise<any> {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'seo:defaults' },
    });

    const defaults = {
      metaTitleTemplate: '%s | Gypsym Technology',
      defaultTitle: 'Gypsym Technology | Engineering the Global Enterprise',
      defaultDescription:
        'Gypsym Technology partners with Fortune 100 leaders to architect zero-downtime cloud cores, sovereign AI ecosystems, and high-frequency distributed ledgers.',
      defaultKeywords: [
        'enterprise cloud architecture',
        'distributed systems',
        'sovereign AI',
        'zero trust cybersecurity',
        'core banking modernization',
      ],
      canonicalBaseUrl: 'https://gypsym.com',
      ogDefaultImage: 'https://gypsym.com/og-default.png',
      twitterCard: 'summary_large_image',
      twitterHandle: '@gypsymtech',
      robotsIndex: true,
      robotsFollow: true,
      googleVerification: '',
      bingVerification: '',
      yandexVerification: '',
      baiduVerification: '',
    };

    if (!setting) {
      return defaults;
    }

    return {
      ...defaults,
      ...(typeof setting.value === 'object' && setting.value !== null ? setting.value : {}),
    };
  }

  async updateSeoSettings(data: any): Promise<any> {
    return this.updateSiteSetting('seo:defaults', data, 'seo', true);
  }

  // 8.1 Custom Scripts & Analytics (Google Analytics, GTM, Meta Pixel, Custom Head/Body Code)
  async getScriptSettings(): Promise<any> {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'scripts:configuration' },
    });

    const defaults = {
      googleAnalytics: {
        enabled: true,
        measurementId: 'G-74X9KLV28P',
      },
      googleTagManager: {
        enabled: false,
        containerId: '',
      },
      facebookPixel: {
        enabled: false,
        pixelId: '',
      },
      headerScripts: '',
      footerScripts: '',
    };

    if (!setting) {
      return defaults;
    }

    return {
      ...defaults,
      ...(typeof setting.value === 'object' && setting.value !== null ? setting.value : {}),
    };
  }

  async updateScriptSettings(data: any): Promise<any> {
    return this.updateSiteSetting('scripts:configuration', data, 'integrations', true);
  }


  // 9. Dynamic Pages & Sections
  async getAllPages(): Promise<any[]> {
    let pages = await this.prisma.page.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
        },
        seoMetadata: {
          include: {
            ogImage: { select: { variants: true } },
          },
        },
      },
    });

    // Ensure core legal and compliance pages are present in database
    const coreLegalPages = [
      {
        slug: 'privacy',
        title: 'Privacy Policy',
        description: 'Enterprise data protection, GDPR compliance, and global data sovereignty commitments.',
      },
      {
        slug: 'terms',
        title: 'Terms of Service',
        description: 'Master service terms, enterprise architecture SLAs, and commercial engagement covenants.',
      },
      {
        slug: 'trust/certifications',
        title: 'Security & Certifications',
        description: 'Independent ISO 27001 audits, SOC 2 Type II attestation, and zero-trust security controls.',
      },
      {
        slug: 'cookies',
        title: 'Cookie Declaration',
        description: 'Tracking governance, telemetry consent disclosures, and browser cookie preferences.',
      },
    ];

    for (const item of coreLegalPages) {
      if (!pages.some((p) => p.slug === item.slug)) {
        try {
          const created = await this.prisma.page.create({
            data: {
              title: item.title,
              slug: item.slug,
              description: item.description,
              layoutType: 'DEFAULT',
              status: 'PUBLISHED',
              publishedAt: new Date(),
            },
            include: {
              sections: true,
              seoMetadata: {
                include: { ogImage: { select: { variants: true } } },
              },
            },
          });
          pages.push(created);
        } catch {}
      }
    }

    // Deduplicate pages by slug to ensure clean management list
    const uniqueBySlug = new Map<string, any>();
    for (const p of pages) {
      if (!uniqueBySlug.has(p.slug)) {
        uniqueBySlug.set(p.slug, p);
      }
    }
    pages = Array.from(uniqueBySlug.values());

    return pages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      description: page.description,
      layoutType: page.layoutType,
      status: page.status,
      locale: page.locale,
      sectionsCount: page.sections.length,
      publishedAt: page.publishedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      sections: page.sections,
      seoMetadata: page.seoMetadata
        ? {
            metaTitle: page.seoMetadata.metaTitle,
            metaDescription: page.seoMetadata.metaDescription,
            canonicalUrl: page.seoMetadata.canonicalUrl,
            ogTitle: page.seoMetadata.ogTitle,
            ogDescription: page.seoMetadata.ogDescription,
            ogImageUrl: page.seoMetadata.ogImage
              ? this.logoUrlFromMedia(page.seoMetadata.ogImage)
              : ((page.seoMetadata.structuredData as any)?.ogImageUrl || null),
            noIndex: !page.seoMetadata.robotsIndex,
            robotsIndex: page.seoMetadata.robotsIndex,
            robotsFollow: page.seoMetadata.robotsFollow,
            twitterCard: page.seoMetadata.twitterCard,
          }
        : null,
    }));
  }

  async createPage(body: {
    title: string;
    slug?: string;
    description?: string;
    layoutType?: any;
    status?: any;
    seoMetadata?: any;
  }): Promise<any> {
    const slugBase = (body.slug || body.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = slugBase || `page-${Date.now()}`;

    const existing = await this.prisma.page.findFirst({
      where: { slug, deletedAt: null },
    });
    if (existing) {
      throw new Error(`A page with slug '/${slug}' already exists.`);
    }

    const page = await this.prisma.page.create({
      data: {
        title: body.title,
        slug,
        description: body.description || null,
        layoutType: body.layoutType || 'DEFAULT',
        status: body.status || 'PUBLISHED',
      },
    });

    if (body.seoMetadata) {
      await this.prisma.seoMetadata.create({
        data: {
          pageId: page.id,
          metaTitle: body.seoMetadata.metaTitle || body.title,
          metaDescription: body.seoMetadata.metaDescription || body.description || '',
          canonicalUrl: body.seoMetadata.canonicalUrl || null,
          ogTitle: body.seoMetadata.ogTitle || body.seoMetadata.metaTitle || body.title,
          ogDescription: body.seoMetadata.ogDescription || body.seoMetadata.metaDescription || body.description || '',
          robotsIndex: body.seoMetadata.noIndex ? false : true,
          robotsFollow: body.seoMetadata.noIndex ? false : true,
        },
      });
    }

    return this.getPageBySlug(page.slug);
  }

  async updatePage(slug: string, body: any): Promise<any> {
    const page = await this.prisma.page.findFirst({
      where: { slug, deletedAt: null },
      include: { seoMetadata: true },
    });
    if (!page) {
      throw new NotFoundException(`Page '${slug}' not found`);
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.layoutType !== undefined) updateData.layoutType = body.layoutType;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.slug !== undefined && body.slug !== page.slug) {
      if (page.slug === 'home') {
        throw new Error("Cannot change URL slug of the root 'home' landing page.");
      }
      const existingSlug = await this.prisma.page.findFirst({
        where: { slug: body.slug, deletedAt: null },
      });
      if (existingSlug && existingSlug.id !== page.id) {
        throw new Error(`A page with slug '/${body.slug}' already exists.`);
      }
      updateData.slug = body.slug;
    }

    const updated = await this.prisma.page.update({
      where: { id: page.id },
      data: updateData,
    });

    if (body.seoMetadata) {
      const seo = body.seoMetadata;
      const robotsIndex =
        seo.robotsIndex !== undefined
          ? Boolean(seo.robotsIndex)
          : seo.noIndex !== undefined
          ? !seo.noIndex
          : undefined;
      const robotsFollow =
        seo.robotsFollow !== undefined
          ? Boolean(seo.robotsFollow)
          : seo.noIndex !== undefined
          ? !seo.noIndex
          : undefined;

      const existingStructured =
        page.seoMetadata && typeof page.seoMetadata.structuredData === 'object' && page.seoMetadata.structuredData !== null
          ? (page.seoMetadata.structuredData as Record<string, any>)
          : {};

      const updatedStructured = {
        ...existingStructured,
        ...(seo.ogImageUrl !== undefined ? { ogImageUrl: seo.ogImageUrl } : {}),
      };

      if (page.seoMetadata) {
        await this.prisma.seoMetadata.update({
          where: { id: page.seoMetadata.id },
          data: {
            metaTitle: seo.metaTitle ?? page.seoMetadata.metaTitle,
            metaDescription: seo.metaDescription ?? page.seoMetadata.metaDescription,
            canonicalUrl: seo.canonicalUrl !== undefined ? seo.canonicalUrl : page.seoMetadata.canonicalUrl,
            ogTitle: seo.ogTitle ?? page.seoMetadata.ogTitle,
            ogDescription: seo.ogDescription ?? page.seoMetadata.ogDescription,
            robotsIndex: robotsIndex !== undefined ? robotsIndex : page.seoMetadata.robotsIndex,
            robotsFollow: robotsFollow !== undefined ? robotsFollow : page.seoMetadata.robotsFollow,
            twitterCard: seo.twitterCard ?? page.seoMetadata.twitterCard,
            structuredData: updatedStructured,
          },
        });
      } else {
        await this.prisma.seoMetadata.create({
          data: {
            pageId: page.id,
            metaTitle: seo.metaTitle || page.title,
            metaDescription: seo.metaDescription || page.description || '',
            canonicalUrl: seo.canonicalUrl || null,
            ogTitle: seo.ogTitle || page.title,
            ogDescription: seo.ogDescription || page.description || '',
            robotsIndex: robotsIndex !== undefined ? robotsIndex : true,
            robotsFollow: robotsFollow !== undefined ? robotsFollow : true,
            twitterCard: seo.twitterCard || 'summary_large_image',
            structuredData: updatedStructured,
          },
        });
      }
    }

    return this.getPageBySlug(updated.slug);
  }

  async deletePage(slug: string): Promise<void> {
    if (slug === 'home' || slug === 'services' || slug === 'portfolio' || slug === 'contact' || slug === 'book') {
      throw new Error(`The core system page '/${slug}' is protected and cannot be deleted.`);
    }

    const page = await this.prisma.page.findFirst({
      where: { slug },
    });
    if (!page) {
      throw new NotFoundException(`Page '${slug}' not found`);
    }

    await this.prisma.page.delete({
      where: { id: page.id },
    });
  }

  async getPageBySlug(slug: string): Promise<any> {
    const slugAliases: Record<string, string> = {
      'our-work': 'portfolio',
      'us': 'united-states',
      'united-kingdom': 'uk',
      'uae': 'united-arab-emirates',
      'sa': 'saudi-arabia',
      'au': 'australia',
      'om': 'oman',
    };
    const targetSlug = slugAliases[slug.toLowerCase()] || slug;
    const page = await this.prisma.page.findFirst({
      where: {
        slug: targetSlug,
        deletedAt: null,
      },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        seoMetadata: true,
      },
    });

    if (!page) {
      throw new NotFoundException(`Page '${slug}' not found`);
    }

    // Load live dependencies concurrently
    const [liveClients, livePartners, livePortfolioProjects, siteSettingsRow, brandSettingsRow] = await Promise.all([
      this.getClients(),
      this.getPartners({ status: 'PUBLISHED', showOnHomepage: true }),
      (this.prisma as any).portfolioProjectItem.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: { category: true },
      }),
      this.prisma.siteSetting.findUnique({ where: { key: 'site_settings' } }).catch(() => null),
      this.prisma.brandSetting.findFirst({ where: { isActive: true } }).catch(() => null),
    ]);

    // Country pages: Hero(1) Verified Results(2) Portfolio(3) Delivery(4) Client Love(5) Clients & Partners(6) Direct Engagement(7) Enterprise Architecture CTA(8)
    const isCountryPage = page.layoutType === 'LANDING' && targetSlug !== 'home';

    // Fetch all required home sections in one query
    let homeVerifiedResultsSection: any = null;
    let homePortfolioSection: any = null;
    let homeDeliverySection: any = null;
    let homeClientLoveSection: any = null;
    let homeClientsPartnersSection: any = null;
    let homeDirectEngagementSection: any = null;
    let homeEnterpriseSection: any = null;
    if (isCountryPage) {
      try {
        const homePage = await (this.prisma as any).page.findFirst({
          where: { slug: 'home', deletedAt: null },
          include: {
            sections: {
              where: {
                isActive: true,
              },
              orderBy: { displayOrder: 'asc' },
            },
          },
        });

        for (const s of homePage?.sections ?? []) {
          const cType = (s.componentType || '').toUpperCase();
          const sId = (s.sectionIdentifier || '').toLowerCase();

          if (!homeVerifiedResultsSection && (
            cType === 'VERIFIED_RESULTS' || cType === 'METRICS_BANNER' || sId === 'verified-results-metrics'
          )) {
            homeVerifiedResultsSection = { ...s, id: `home-inherited-${s.id}`, pageId: page.id, displayOrder: 2 };
          }
          if (!homePortfolioSection && (
            sId === 'portfolio-showcase' || sId === 'portfolio' || sId === 'our-work' ||
            cType === 'PORTFOLIO' || cType === 'OUR_WORK' || cType === 'PORTFOLIO_SHOWCASE'
          )) {
            homePortfolioSection = { ...s, id: `home-inherited-${s.id}`, pageId: page.id, displayOrder: 3 };
          }
          if (!homeDeliverySection && (
            cType === 'DELIVERY_PROCESS' || cType === 'TABBED_SOLUTIONS' || sId === 'delivery-process'
          )) {
            homeDeliverySection = { ...s, id: `home-inherited-${s.id}`, pageId: page.id, displayOrder: 4 };
          }
          if (!homeClientLoveSection && (
            cType === 'CLIENT_TESTIMONIALS' || cType === 'TESTIMONIAL_SLIDER' || sId === 'client-testimonials'
          )) {
            homeClientLoveSection = { ...s, id: `home-inherited-${s.id}`, pageId: page.id, displayOrder: 5 };
          }
          if (!homeClientsPartnersSection && (
            cType === 'LOGO_CLOUD' || sId === 'clients-trusted-by' || sId === 'clients-partners' || sId === 'clients-and-partners' ||
            cType === 'CLIENTS_PARTNERS' || cType === 'CLIENTS_AND_PARTNERS' || cType === 'CLIENTS_TRUSTED_BY' ||
            cType === 'TRUSTED_BY' || cType === 'CLIENTS' || cType === 'BRAND_LOGOS'
          )) {
            homeClientsPartnersSection = { ...s, id: `home-inherited-${s.id}`, pageId: page.id, displayOrder: 6 };
          }
          if (!homeDirectEngagementSection && (
            cType === 'CONTACT' || sId === 'contact-inquiry' || sId === 'contact' ||
            cType === 'CONTACT_INQUIRY' || cType === 'CONTACT_US' || cType === 'INQUIRY'
          )) {
            homeDirectEngagementSection = { ...s, id: `home-inherited-${s.id}`, pageId: page.id, displayOrder: 7 };
          }
          if (!homeEnterpriseSection && (
            cType === 'CTA' || sId === 'homepage-cta' || sId === 'cta-banner' || sId === 'cta' ||
            cType === 'CTA_BANNER' || cType === 'CALL_TO_ACTION' || cType === 'HOMEPAGE_CTA'
          )) {
            homeEnterpriseSection = { ...s, id: `home-inherited-${s.id}`, pageId: page.id, displayOrder: 8 };
          }
        }
      } catch (err) {
        // silent — country page still renders with whatever sections resolved
      }
    }

    // Build section list: [Hero, Verified Results, Portfolio, Delivery, Client Love, Clients & Partners, Direct Engagement, Enterprise Architecture CTA]
    // For all other pages: use sections as-is from DB
    const rawSections: any[] = isCountryPage
      ? [
          ...page.sections
            .filter((s: any) => (s.componentType || '').toUpperCase() === 'HERO')
            .map((s: any) => ({ ...s, displayOrder: 1 })),
          ...(homeVerifiedResultsSection  ? [homeVerifiedResultsSection]  : []),
          ...(homePortfolioSection        ? [homePortfolioSection]        : []),
          ...(homeDeliverySection         ? [homeDeliverySection]         : []),
          ...(homeClientLoveSection       ? [homeClientLoveSection]       : []),
          ...(homeClientsPartnersSection  ? [homeClientsPartnersSection]  : []),
          ...(homeDirectEngagementSection ? [homeDirectEngagementSection] : []),
          ...(homeEnterpriseSection       ? [homeEnterpriseSection]       : []),
        ]
      : page.sections;



    const sections = rawSections.map((section: any) => {
      const cType = (section.componentType || '').toUpperCase();
      const sId = (section.sectionIdentifier || '').toLowerCase();

      // 1. Hero client strip
      if (cType === 'HERO') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        const clientStrip = payload.clientStrip || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            clientStrip: {
              ...clientStrip,
              enabled: clientStrip.enabled ?? true,
              title: clientStrip.title || 'The agency behind ..',
              clients: liveClients
                .filter((c: any) => c.logoUrl && !c.logoUrl.includes('apex-bank-logo'))
                .map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  logoUrl: c.logoUrl ?? '',
                  websiteUrl: c.websiteUrl ?? '',
                })),
            },
          },
        };
      }

      // 2. Dedicated Clients / Trusted By section (LOGO_CLOUD)
      if (
        cType === 'LOGO_CLOUD' &&
        (sId === 'clients-trusted-by' ||
          sId === 'trusted-by' ||
          sId === 'clients-partners' ||
          sId === 'clients-and-partners' ||
          sId === 'clients')
      ) {
        const payload = (section.contentPayload as Record<string, any>) || {};

        // Show all active live clients by default from Clients module
        const seenNames = new Set<string>();
        const seenLogos = new Set<string>();

        const allClients = liveClients
          .filter((c: any) => {
            if (!c.logoUrl) return false;
            if (c.logoUrl.includes('apex-bank-logo')) return false;
            const n = (c.name || '').trim().toLowerCase();
            const l = (c.logoUrl || '').trim();
            if (seenNames.has(n) || seenLogos.has(l)) return false;
            seenNames.add(n);
            seenLogos.add(l);
            return true;
          })
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            logoUrl: c.logoUrl,
            websiteUrl: c.websiteUrl ?? null,
            tier: c.tier,
            displayOrder: c.displayOrder,
          }));

        return {
          ...section,
          contentPayload: {
            ...payload,
            clients: allClients,
          },
        };
      }

      // 3. Dedicated Partners section (PARTNERS or sectionIdentifier: homepage-partners / our-partners / partners)
      if (cType === 'PARTNERS' || sId === 'homepage-partners' || sId === 'our-partners' || sId === 'partners') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            // Sourced automatically from Partners module (no selector allowed)
            partners: livePartners,
          },
        };
      }

      // 3b. Dedicated Portfolio / Our Work section (PORTFOLIO / OUR_WORK / FEATURE_GRID with portfolio-showcase / our-work-portfolio)
      if (
        cType === 'PORTFOLIO' ||
        cType === 'OUR_WORK' ||
        sId === 'portfolio-showcase' ||
        sId === 'our-work-portfolio' ||
        sId === 'portfolio' ||
        sId === 'our-work'
      ) {
        const payload = (section.contentPayload as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            projects: livePortfolioProjects.map((p: any) => ({
              id: p.id,
              orderNumber: p.orderNumber,
              title: p.title,
              slug: p.slug,
              client: p.client,
              category: p.category?.name || '',
              categorySlug: p.category?.slug || '',
              categoryId: p.categoryId,
              description: p.description,
              imageUrl: p.imageUrl,
              altText: p.altText || p.title,
              projectUrl: p.projectUrl || `/portfolio/${p.slug}`,
              tags: p.tags,
              metrics: p.metrics,
              displayOrder: p.displayOrder,
            })),
          },
        };
      }

      // 4. Dedicated Contact / Inquiry section
      if (cType === 'CONTACT' || sId === 'contact-inquiry' || sId === 'contact') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        const siteVal = (siteSettingsRow?.value as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            globalContactDetails: {
              email: siteVal.primaryEmail || 'briefing@gypsym.com',
              phone: siteVal.primaryPhone || '+44 20 7946 0991',
              address: siteVal.headquarters || '100 Bishopsgate, London EC2N 4AG, United Kingdom',
              socialLinks: brandSettingsRow?.socialLinks || [],
            },
          },
        };
      }

      // 5. Dedicated CTA section
      if (cType === 'CTA' || sId === 'cta' || sId === 'cta-banner' || sId === 'homepage-cta') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
          },
        };
      }

      return section;
    });

    return { ...page, sections };
  }


  // 10. Dynamic Navigation
  async getNavigationByKey(key: string): Promise<any> {
    const nav = await this.prisma.navigation.findUnique({
      where: { key },
      include: {
        items: {
          where: { isActive: true, parentId: null },
          orderBy: { displayOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!nav) {
      throw new NotFoundException(`Navigation '${key}' not found in database`);
    }

    return nav;
  }

  // 11. Consolidated Dynamic Header
  async getHeaderData(): Promise<any> {
    const [branding, navigation, headerSetting] = await Promise.all([
      this.getBrandSettings().catch(() => null),
      this.getNavigationByKey('header').catch(() => null),
      this.prisma.siteSetting
        .findUnique({ where: { key: 'header_config' } })
        .then((s) => s?.value || null),
    ]);

    return {
      branding,
      navigation,
      config: headerSetting,
    };
  }

  // 11b. Consolidated Dynamic Footer
  async getFooterData(): Promise<any> {
    let [branding, navigation, footerSetting, contactSetting, entitySetting] = await Promise.all([
      this.getBrandSettings().catch(() => null),
      this.getNavigationByKey('footer').catch(() => null),
      this.prisma.siteSetting
        .findUnique({ where: { key: 'footer_config' } })
        .then((s) => s?.value || null),
      this.prisma.siteSetting
        .findUnique({ where: { key: 'general:contact' } })
        .then((s) => s?.value || null),
      this.prisma.siteSetting
        .findUnique({ where: { key: 'general:entity' } })
        .then((s) => s?.value || null),
    ]);

    if (!footerSetting) {
      footerSetting = await this.seedInitialFooterConfig();
    } else {
      const fsVal = footerSetting as any;
      if (!fsVal?.keywords || !Array.isArray(fsVal.keywords?.items) || fsVal.keywords.items.length < 14) {
        fsVal.keywords = this.getDefaultKeywords();
        await this.prisma.siteSetting.update({
          where: { key: 'footer_config' },
          data: { value: fsVal },
        });
        footerSetting = fsVal;
      }
    }

    if (!navigation || !navigation.items || navigation.items.length === 0 || !navigation.items.some((i: any) => i.children && i.children.length > 0)) {
      navigation = await this.seedInitialFooterNavigation();
    }

    return {
      branding,
      navigation,
      config: footerSetting,
      contact: contactSetting,
      entity: entitySetting,
    };
  }

  async getAdminFooterData(): Promise<any> {
    const [footerData, pages] = await Promise.all([
      this.getFooterData(),
      this.getAllPages().catch(() => []),
    ]);

    return {
      ...footerData,
      pages: (pages || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        url: p.slug === 'home' || p.slug === '/' ? '/' : `/${p.slug}`,
      })),
    };
  }

  async updateFooterData(payload: { config?: any; navigation?: any; contact?: any }): Promise<any> {
    if (payload.config) {
      await this.prisma.siteSetting.upsert({
        where: { key: 'footer_config' },
        create: {
          key: 'footer_config',
          category: 'system',
          value: payload.config,
          isPublic: true,
        },
        update: {
          value: payload.config,
        },
      });
    }

    if (payload.navigation?.items && Array.isArray(payload.navigation.items)) {
      await this.updateNavigation('footer', payload.navigation.items);
    }

    if (payload.contact) {
      await this.prisma.siteSetting.upsert({
        where: { key: 'general:contact' },
        create: {
          key: 'general:contact',
          category: 'system',
          value: payload.contact,
          isPublic: true,
        },
        update: {
          value: payload.contact,
        },
      });
    }

    return this.getFooterData();
  }

  private async seedInitialFooterConfig(): Promise<any> {
    const initialConfig = {
      enabled: true,
      layout: {
        containerWidth: 'wide',
        borderRadius: 'extra-large',
        sectionSpacing: 'spacious',
      },
      appearance: {
        themeMode: 'inherit',
        surfaceColor: '#07090e',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        glowEffect: true,
      },
      brand: {
        description: 'Engineering the next era of high-frequency commerce, resilient cloud systems, and sovereign AI for visionary global brands.',
        logoVariant: 'default',
        customLogoUrl: '',
      },
      contact: {
        enabled: true,
        showEmail: true,
        showPhone: true,
        showAddress: true,
        emailOverride: '',
        phoneOverride: '',
        addressOverride: '',
        badgeText: 'Global Engineering Office',
      },
      regions: [
        {
          id: 'region-us',
          name: 'United States',
          code: 'US',
          label: 'North America',
          displayOrder: 1,
          isActive: true,
          links: [
            { id: 'l-us-1', label: 'Enterprise Architects & Tech Leads', url: '/services', isExternal: false, isActive: true, displayOrder: 1 },
            { id: 'l-us-2', label: 'Cloud Migration & Core Engineering', url: '/solutions', isExternal: false, isActive: true, displayOrder: 2 },
            { id: 'l-us-3', label: 'Delaware Corporate Advisory', url: '/about', isExternal: false, isActive: true, displayOrder: 3 },
            { id: 'l-us-4', label: 'High-Volume Storefront Audits', url: '/portfolio', isExternal: false, isActive: true, displayOrder: 4 },
          ],
        },
        {
          id: 'region-uk',
          name: 'United Kingdom',
          code: 'GB',
          label: 'Europe & EMEA',
          displayOrder: 2,
          isActive: true,
          links: [
            { id: 'l-uk-1', label: 'Fintech & Storefront Engineering', url: '/services', isExternal: false, isActive: true, displayOrder: 1 },
            { id: 'l-uk-2', label: 'Cross-Border VAT & EU Compliance', url: '/trust/certifications', isExternal: false, isActive: true, displayOrder: 2 },
            { id: 'l-uk-3', label: 'Dedicated Senior Engineering Squad', url: '/book', isExternal: false, isActive: true, displayOrder: 3 },
          ],
        },
        {
          id: 'region-au',
          name: 'Australia',
          code: 'AU',
          label: 'Asia-Pacific',
          displayOrder: 3,
          isActive: true,
          links: [
            { id: 'l-au-1', label: 'Sovereign Cloud & AI Architecture', url: '/solutions', isExternal: false, isActive: true, displayOrder: 1 },
            { id: 'l-au-2', label: 'Sydney Delivery & Client Advisory', url: '/contact', isExternal: false, isActive: true, displayOrder: 2 },
            { id: 'l-au-3', label: 'Sub-Second Mobile Acceleration', url: '/services', isExternal: false, isActive: true, displayOrder: 3 },
          ],
        },
        {
          id: 'region-de',
          name: 'Germany',
          code: 'DE',
          label: 'Central Europe',
          displayOrder: 4,
          isActive: true,
          links: [
            { id: 'l-de-1', label: 'Industrial & D2C Commerce Systems', url: '/portfolio', isExternal: false, isActive: true, displayOrder: 1 },
            { id: 'l-de-2', label: 'GDPR & Data Sovereignty Audits', url: '/trust/certifications', isExternal: false, isActive: true, displayOrder: 2 },
            { id: 'l-de-3', label: 'Automated Catalog Synchronization', url: '/solutions', isExternal: false, isActive: true, displayOrder: 3 },
          ],
        },
      ],
      largeBrandMark: {
        enabled: true,
        type: 'wordmark_text',
        textOverride: '',
        size: 'large',
        opacity: 0.12,
        alignment: 'center',
      },
      badges: [
        {
          id: 'badge-shopify',
          title: 'Shopify Plus Partner',
          imageUrl: '',
          url: 'https://shopify.com',
          displayOrder: 1,
          isActive: true,
        },
        {
          id: 'badge-iso',
          title: 'ISO 27001 Certified Standard',
          imageUrl: '',
          url: '/trust/certifications',
          displayOrder: 2,
          isActive: true,
        },
        {
          id: 'badge-soc2',
          title: 'SOC 2 Type II Audited',
          imageUrl: '',
          url: '/trust/certifications',
          displayOrder: 3,
          isActive: true,
        },
      ],
      legalLinks: [
        { id: 'leg-1', label: 'Privacy Policy', url: '/privacy', isExternal: false, displayOrder: 1, isActive: true },
        { id: 'leg-2', label: 'Terms of Service', url: '/terms', isExternal: false, displayOrder: 2, isActive: true },
        { id: 'leg-3', label: 'Security & Certifications', url: '/trust/certifications', isExternal: false, displayOrder: 3, isActive: true },
        { id: 'leg-4', label: 'Cookie Declaration', url: '/cookies', isExternal: false, displayOrder: 4, isActive: true },
        { id: 'leg-5', label: 'Sitemap', url: '/sitemap.xml', isExternal: false, displayOrder: 5, isActive: true },
      ],
      copyright: {
        template: '© {year} {brand}. All rights reserved.',
      },
      cta: {
        enabled: false,
        eyebrow: 'PARTNER WITH US',
        title: 'Ready to build the next-generation enterprise?',
        description: 'Schedule a dedicated architecture session with our principal engineers.',
        buttonLabel: "Let's Talk",
        buttonUrl: '/book',
      },
      keywords: this.getDefaultKeywords(),
    };

    const setting = await this.prisma.siteSetting.upsert({
      where: { key: 'footer_config' },
      create: {
        key: 'footer_config',
        category: 'system',
        value: initialConfig,
        isPublic: true,
      },
      update: {
        value: initialConfig,
      },
    });

    return setting.value;
  }

  private getDefaultKeywords() {
    return {
      enabled: true,
      title: 'Trending Capabilities & Searchable Directory',
      searchable: true,
      items: [
        { id: 'kw-1', label: 'Shopify Plus Flagship Development', url: '/services', displayOrder: 1, isActive: true },
        { id: 'kw-2', label: 'Headless Commerce & Hydrogen', url: '/services', displayOrder: 2, isActive: true },
        { id: 'kw-3', label: 'Checkout Extensibility', url: '/services', displayOrder: 3, isActive: true },
        { id: 'kw-4', label: 'ERP & NetSuite Integration', url: '/solutions', displayOrder: 4, isActive: true },
        { id: 'kw-5', label: 'Next.js High-Performance Frontend', url: '/services', displayOrder: 5, isActive: true },
        { id: 'kw-6', label: 'Sub-Second Core Web Vitals', url: '/services', displayOrder: 6, isActive: true },
        { id: 'kw-7', label: 'Zero-Downtime Data Migration', url: '/services', displayOrder: 7, isActive: true },
        { id: 'kw-8', label: 'Custom Shopify App Engineering', url: '/services', displayOrder: 8, isActive: true },
        { id: 'kw-9', label: 'B2B Wholesale & Multi-Currency', url: '/solutions', displayOrder: 9, isActive: true },
        { id: 'kw-10', label: 'Conversion Rate Optimization (CRO)', url: '/solutions', displayOrder: 10, isActive: true },
        { id: 'kw-11', label: 'Algolia & AI Enterprise Search', url: '/solutions', displayOrder: 11, isActive: true },
        { id: 'kw-12', label: 'Omnichannel Retail Architecture', url: '/solutions', displayOrder: 12, isActive: true },
        { id: 'kw-13', label: 'Klaviyo & Retention Pipelines', url: '/services', displayOrder: 13, isActive: true },
        { id: 'kw-14', label: 'POS Terminal Synchronization', url: '/solutions', displayOrder: 14, isActive: true },
        { id: 'kw-15', label: 'ISO 27001 & SOC 2 Compliance', url: '/trust/certifications', displayOrder: 15, isActive: true },
        { id: 'kw-16', label: 'Liquid OS 2.0 Architecture', url: '/services', displayOrder: 16, isActive: true },
        { id: 'kw-17', label: 'Sanity CMS & Headless Content', url: '/services', displayOrder: 17, isActive: true },
        { id: 'kw-18', label: 'Global Edge CDN Delivery', url: '/solutions', displayOrder: 18, isActive: true },
      ],
    };
  }

  private async seedInitialFooterNavigation(): Promise<any> {
    let nav = await this.prisma.navigation.findUnique({ where: { key: 'footer' } });
    if (!nav) {
      nav = await this.prisma.navigation.create({
        data: {
          key: 'footer',
          title: 'Global Footer Directory',
          isActive: true,
        },
      });
    }

    const items = [
      {
        label: 'Pages & Exploration',
        url: '/services',
        displayOrder: 1,
        children: [
          { label: 'Home Storefront', url: '/', displayOrder: 1, isExternal: false },
          { label: 'Selected Works', url: '/portfolio', displayOrder: 2, isExternal: false },
          { label: 'Core Services', url: '/services', displayOrder: 3, isExternal: false },
          { label: 'Engineering Publications', url: '/blog', displayOrder: 4, isExternal: false },
          { label: 'Schedule Consultation', url: '/book', displayOrder: 5, isExternal: false },
        ],
      },
      {
        label: 'Services & Practice',
        url: '/services',
        displayOrder: 2,
        children: [
          { label: 'Shopify Plus Flagship Development', url: '/services', displayOrder: 1, isExternal: false },
          { label: 'Headless Liquid & Hydrogen', url: '/services', displayOrder: 2, isExternal: false },
          { label: 'ERP & Zero-Downtime Data Migration', url: '/services', displayOrder: 3, isExternal: false },
          { label: 'Checkout Extensibility & Apps', url: '/services', displayOrder: 4, isExternal: false },
          { label: 'Sub-Second Performance & CWV', url: '/services', displayOrder: 5, isExternal: false },
        ],
      },
      {
        label: 'Enterprise Solutions',
        url: '/solutions',
        displayOrder: 3,
        children: [
          { label: 'B2B Wholesale Portals', url: '/solutions', displayOrder: 1, isExternal: false },
          { label: 'Multi-Currency Global Checkout', url: '/solutions', displayOrder: 2, isExternal: false },
          { label: 'Conversion Rate Architecture', url: '/solutions', displayOrder: 3, isExternal: false },
          { label: 'Catalog Automation & Sync', url: '/solutions', displayOrder: 4, isExternal: false },
        ],
      },
      {
        label: 'Company & Advisory',
        url: '/about',
        displayOrder: 4,
        children: [
          { label: 'About Gypsym', url: '/about', displayOrder: 1, isExternal: false },
          { label: 'Security & Certifications', url: '/trust/certifications', displayOrder: 2, isExternal: false },
          { label: 'Enterprise Contact', url: '/contact', displayOrder: 3, isExternal: false },
          { label: 'Client Advisory Briefing', url: '/book', displayOrder: 4, isExternal: false },
        ],
      },
    ];

    await this.updateNavigation('footer', items);
    return this.getNavigationByKey('footer');
  }

  // 12. CMS Updates (Admin Endpoints)
  async updateSiteSetting(
    key: string,
    value: any,
    category: string = 'system',
    isPublic: boolean = true
  ): Promise<any> {
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: {
        key,
        category,
        value,
        isPublic,
      },
      update: {
        value,
        isPublic,
      },
    });
  }

  async updateNavigation(key: string, items: any[]): Promise<any> {
    const nav = await this.prisma.navigation.findUnique({
      where: { key },
    });
    if (!nav) throw new NotFoundException(`Navigation '${key}' not found`);

    await this.prisma.$transaction(async (tx) => {
      await tx.navigationItem.deleteMany({
        where: { navigationId: nav.id },
      });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const createdParent = await tx.navigationItem.create({
          data: {
            navigationId: nav.id,
            label: item.label,
            url: item.url || item.href || '#',
            icon: item.icon || null,
            badgeText: item.badgeText || null,
            isExternal: item.isExternal || false,
            displayOrder: item.displayOrder ?? i,
            megaMenuConfig: item.megaMenuConfig || null,
            isActive: item.isActive ?? true,
          },
        });

        if (item.children && Array.isArray(item.children)) {
          for (let j = 0; j < item.children.length; j++) {
            const child = item.children[j];
            await tx.navigationItem.create({
              data: {
                navigationId: nav.id,
                parentId: createdParent.id,
                label: child.label,
                url: child.url || child.href || '#',
                icon: child.icon || null,
                badgeText: child.badgeText || null,
                isExternal: child.isExternal || false,
                displayOrder: child.displayOrder ?? j,
                isActive: child.isActive ?? true,
              },
            });
          }
        }
      }
    });

    return this.getNavigationByKey(key);
  }

  async updateSection(id: string, payload: any): Promise<any> {
    const section = await this.prisma.pageSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundException(`Section '${id}' not found`);

    return this.prisma.pageSection.update({
      where: { id },
      data: {
        ...(payload.contentPayload !== undefined ? { contentPayload: payload.contentPayload } : {}),
        ...(payload.stylesOverride !== undefined ? { stylesOverride: payload.stylesOverride } : {}),
        ...(payload.displayOrder !== undefined ? { displayOrder: payload.displayOrder } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      },
    });
  }

  async createSection(slug: string, payload: any): Promise<any> {
    const page = await this.prisma.page.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!page) throw new NotFoundException(`Page '${slug}' not found`);

    return this.prisma.pageSection.create({
      data: {
        pageId: page.id,
        sectionIdentifier: payload.sectionIdentifier || `sec-${Date.now()}`,
        componentType: payload.componentType,
        displayOrder: payload.displayOrder ?? 0,
        contentPayload: payload.contentPayload || {},
        stylesOverride: payload.stylesOverride || null,
        isActive: payload.isActive ?? true,
      },
    });
  }

  async deleteSection(id: string): Promise<any> {
    return this.prisma.pageSection.delete({ where: { id } });
  }

  // ── Clients ──────────────────────────────────────────────────────────────────

  /** Extract the logo URL we stored in media.variants.original */
  private logoUrlFromMedia(media: { variants: any } | null): string | null {
    if (!media?.variants) return null;
    const v = media.variants as Record<string, string>;
    return v.original ?? v.lg ?? v.md ?? null;
  }

  async getClients(): Promise<any[]> {
    if (this.clientsCache && Date.now() < this.clientsCache.expiresAt) {
      return this.clientsCache.data;
    }
    const clients = await this.prisma.client.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        logoLight: { select: { variants: true } },
      },
    });
    const mapped = clients.map((c) => ({
      id: c.id,
      name: c.name,
      logoUrl: this.logoUrlFromMedia(c.logoLight),
      websiteUrl: c.websiteUrl ?? null,
      tier: c.tier,
      isFeatured: c.isFeatured,
      displayOrder: c.displayOrder,
      isActive: true,
      createdAt: c.createdAt,
    }));
    this.clientsCache = { data: mapped, expiresAt: Date.now() + 60000 };
    return mapped;
  }

  async createClient(body: {
    name: string;
    logoUrl?: string;
    websiteUrl?: string;
  }): Promise<any> {
    this.clientsCache = null;
    // Persist logoUrl in media.variants JSON so it survives without S3 upload
    const mediaRow = await this.prisma.media.create({
      data: {
        originalFilename: `${body.name.toLowerCase().replace(/\s+/g, '-')}-logo`,
        mimeType: 'image/svg+xml',
        fileSizeBytes: BigInt(0),
        storageKey: `clients/logo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        altText: `${body.name} logo`,
        variants: body.logoUrl ? { original: body.logoUrl } : {},
      },
    });

    const lastClient = await this.prisma.client.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const nextOrder = (lastClient?.displayOrder ?? 0) + 10;

    const slug =
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now();

    const client = await this.prisma.client.create({
      data: {
        slug,
        name: body.name,
        logoLightId: mediaRow.id,
        logoDarkId: mediaRow.id,
        websiteUrl: body.websiteUrl || null,
        displayOrder: nextOrder,
      },
      include: { logoLight: { select: { variants: true } } },
    });

    return {
      id: client.id,
      name: client.name,
      logoUrl: this.logoUrlFromMedia(client.logoLight),
      websiteUrl: client.websiteUrl ?? null,
      tier: client.tier,
      isFeatured: client.isFeatured,
      displayOrder: client.displayOrder,
      isActive: true,
      createdAt: client.createdAt,
    };
  }

  async updateClient(
    id: string,
    body: { name?: string; logoUrl?: string; websiteUrl?: string },
  ): Promise<any> {
    const existing = await this.prisma.client.findUnique({
      where: { id },
      select: { logoLightId: true },
    });
    if (!existing) throw new NotFoundException(`Client '${id}' not found`);

    // Update logo URL stored in variants JSON
    if (body.logoUrl !== undefined) {
      await this.prisma.media.update({
        where: { id: existing.logoLightId },
        data: { variants: { original: body.logoUrl } },
      });
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
      },
      include: { logoLight: { select: { variants: true } } },
    });

    return {
      id: client.id,
      name: client.name,
      logoUrl: this.logoUrlFromMedia(client.logoLight),
      websiteUrl: client.websiteUrl ?? null,
      tier: client.tier,
      isFeatured: client.isFeatured,
      displayOrder: client.displayOrder,
      isActive: true,
      createdAt: client.createdAt,
    };
  }

  async deleteClient(id: string): Promise<void> {
    const existing = await this.prisma.client.findUnique({
      where: { id },
      select: { logoLightId: true, logoDarkId: true },
    });
    if (!existing) throw new NotFoundException(`Client '${id}' not found`);
    await this.prisma.client.delete({ where: { id } });
    const mediaIds = [...new Set([existing.logoLightId, existing.logoDarkId])];
    await this.prisma.media.deleteMany({ where: { id: { in: mediaIds } } });
  }

  // ── Partners ──────────────────────────────────────────────────────────────────

  async getPartners(filters?: {
    status?: string;
    showOnHomepage?: boolean | string;
    partnerType?: string;
    search?: string;
  }): Promise<any[]> {
    const isHomepageDefault =
      filters?.status === 'PUBLISHED' &&
      (filters?.showOnHomepage === true || filters?.showOnHomepage === 'true') &&
      !filters?.partnerType &&
      !filters?.search;

    if (isHomepageDefault && this.homepagePartnersCache && Date.now() < this.homepagePartnersCache.expiresAt) {
      return this.homepagePartnersCache.data;
    }

    const where: any = {};

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters?.showOnHomepage !== undefined && filters.showOnHomepage !== 'ALL') {
      where.showOnHomepage = filters.showOnHomepage === true || filters.showOnHomepage === 'true';
    }
    if (filters?.partnerType && filters.partnerType !== 'ALL') {
      where.partnerType = filters.partnerType;
    }
    if (filters?.search && filters.search.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: 'insensitive' } },
        { shortDescription: { contains: filters.search.trim(), mode: 'insensitive' } },
        { partnerType: { contains: filters.search.trim(), mode: 'insensitive' } },
        { industry: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }

    const partners = await this.prisma.partner.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });

    const mapped = partners.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tier: p.tier,
      logoUrl: this.logoUrlFromMedia(p.logo),
      logoDarkUrl: this.logoUrlFromMedia(p.logoDark),
      partnershipOverview: p.partnershipOverview,
      shortDescription: p.shortDescription,
      description: p.description,
      websiteUrl: p.websiteUrl ?? null,
      partnerType: p.partnerType ?? null,
      industry: p.industry ?? null,
      displayOrder: p.displayOrder,
      status: p.status,
      showOnHomepage: p.showOnHomepage,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    if (isHomepageDefault) {
      this.homepagePartnersCache = { data: mapped, expiresAt: Date.now() + 60000 };
    }

    return mapped;
  }

  async getPartnerById(id: string): Promise<any> {
    const p = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });
    if (!p) throw new NotFoundException(`Partner '${id}' not found`);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tier: p.tier,
      logoUrl: this.logoUrlFromMedia(p.logo),
      logoDarkUrl: this.logoUrlFromMedia(p.logoDark),
      partnershipOverview: p.partnershipOverview,
      shortDescription: p.shortDescription,
      description: p.description,
      websiteUrl: p.websiteUrl ?? null,
      partnerType: p.partnerType ?? null,
      industry: p.industry ?? null,
      displayOrder: p.displayOrder,
      status: p.status,
      showOnHomepage: p.showOnHomepage,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async createPartner(body: {
    name: string;
    slug?: string;
    tier?: any;
    logoUrl?: string;
    logoDarkUrl?: string;
    shortDescription?: string;
    description?: string;
    websiteUrl?: string;
    partnerType?: string;
    industry?: string;
    displayOrder?: number;
    status?: any;
    showOnHomepage?: boolean;
  }): Promise<any> {
    const slugBase = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = slugBase || `partner-${Date.now()}`;

    // Ensure unique slug
    const existingSlug = await this.prisma.partner.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    // Create logo Media record
    const logoMedia = await this.prisma.media.create({
      data: {
        originalFilename: `${body.name.toLowerCase().replace(/\s+/g, '-')}-logo`,
        mimeType: 'image/svg+xml',
        fileSizeBytes: BigInt(0),
        storageKey: `partners/logo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        altText: `${body.name} logo`,
        variants: body.logoUrl ? { original: body.logoUrl } : {},
      },
    });

    // Create dark logo Media record if provided
    let logoDarkMediaId: string | null = null;
    if (body.logoDarkUrl) {
      const darkMedia = await this.prisma.media.create({
        data: {
          originalFilename: `${body.name.toLowerCase().replace(/\s+/g, '-')}-logo-dark`,
          mimeType: 'image/svg+xml',
          fileSizeBytes: BigInt(0),
          storageKey: `partners/logo-dark-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          altText: `${body.name} dark logo`,
          variants: { original: body.logoDarkUrl },
        },
      });
      logoDarkMediaId = darkMedia.id;
    }

    let displayOrder = body.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const lastPartner = await this.prisma.partner.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (lastPartner?.displayOrder ?? 0) + 1;
    }

    const partner = await this.prisma.partner.create({
      data: {
        slug: finalSlug,
        name: body.name,
        tier: body.tier || 'TECHNOLOGY',
        logoId: logoMedia.id,
        logoDarkId: logoDarkMediaId,
        shortDescription: body.shortDescription || null,
        description: body.description || null,
        websiteUrl: body.websiteUrl || null,
        partnerType: body.partnerType || null,
        industry: body.industry || null,
        displayOrder,
        status: body.status || 'PUBLISHED',
        showOnHomepage: body.showOnHomepage ?? true,
      },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });

    return {
      id: partner.id,
      slug: partner.slug,
      name: partner.name,
      tier: partner.tier,
      logoUrl: this.logoUrlFromMedia(partner.logo),
      logoDarkUrl: this.logoUrlFromMedia(partner.logoDark),
      shortDescription: partner.shortDescription,
      description: partner.description,
      websiteUrl: partner.websiteUrl ?? null,
      partnerType: partner.partnerType ?? null,
      industry: partner.industry ?? null,
      displayOrder: partner.displayOrder,
      status: partner.status,
      showOnHomepage: partner.showOnHomepage,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }

  async updatePartner(
    id: string,
    body: {
      name?: string;
      slug?: string;
      tier?: any;
      logoUrl?: string;
      logoDarkUrl?: string;
      shortDescription?: string;
      description?: string;
      websiteUrl?: string;
      partnerType?: string;
      industry?: string;
      displayOrder?: number;
      status?: any;
      showOnHomepage?: boolean;
    },
  ): Promise<any> {
    const existing = await this.prisma.partner.findUnique({
      where: { id },
      select: { id: true, logoId: true, logoDarkId: true },
    });
    if (!existing) throw new NotFoundException(`Partner '${id}' not found`);

    // Update logo media
    if (body.logoUrl !== undefined) {
      if (existing.logoId) {
        await this.prisma.media.update({
          where: { id: existing.logoId },
          data: { variants: { original: body.logoUrl } },
        });
      }
    }

    // Update or create logoDark media
    let logoDarkId = existing.logoDarkId;
    if (body.logoDarkUrl !== undefined) {
      if (body.logoDarkUrl) {
        if (existing.logoDarkId) {
          await this.prisma.media.update({
            where: { id: existing.logoDarkId },
            data: { variants: { original: body.logoDarkUrl } },
          });
        } else {
          const darkMedia = await this.prisma.media.create({
            data: {
              originalFilename: `partner-dark-logo-${id}`,
              mimeType: 'image/svg+xml',
              fileSizeBytes: BigInt(0),
              storageKey: `partners/logo-dark-${Date.now()}`,
              variants: { original: body.logoDarkUrl },
            },
          });
          logoDarkId = darkMedia.id;
        }
      } else if (existing.logoDarkId) {
        logoDarkId = null;
      }
    }

    const partner = await this.prisma.partner.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.tier !== undefined && { tier: body.tier }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
        ...(body.partnerType !== undefined && { partnerType: body.partnerType }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.showOnHomepage !== undefined && { showOnHomepage: body.showOnHomepage }),
        ...(logoDarkId !== existing.logoDarkId && { logoDarkId }),
      },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });

    return {
      id: partner.id,
      slug: partner.slug,
      name: partner.name,
      tier: partner.tier,
      logoUrl: this.logoUrlFromMedia(partner.logo),
      logoDarkUrl: this.logoUrlFromMedia(partner.logoDark),
      shortDescription: partner.shortDescription,
      description: partner.description,
      websiteUrl: partner.websiteUrl ?? null,
      partnerType: partner.partnerType ?? null,
      industry: partner.industry ?? null,
      displayOrder: partner.displayOrder,
      status: partner.status,
      showOnHomepage: partner.showOnHomepage,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }

  async deletePartner(id: string): Promise<void> {
    this.homepagePartnersCache = null;
    const existing = await this.prisma.partner.findUnique({
      where: { id },
      select: { logoId: true, logoDarkId: true },
    });
    if (!existing) throw new NotFoundException(`Partner '${id}' not found`);

    await this.prisma.partner.delete({ where: { id } });

    const mediaIds = [existing.logoId, existing.logoDarkId].filter(Boolean) as string[];
    if (mediaIds.length > 0) {
      await this.prisma.media.deleteMany({ where: { id: { in: mediaIds } } }).catch(() => {});
    }
  }

  async reorderPartners(items: Array<{ id: string; displayOrder: number }>): Promise<void> {
    this.homepagePartnersCache = null;
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.partner.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
  }

  async updatePartnerHomepageVisibility(id: string, showOnHomepage: boolean): Promise<any> {
    this.homepagePartnersCache = null;
    return this.prisma.partner.update({
      where: { id },
      data: { showOnHomepage },
      select: { id: true, name: true, showOnHomepage: true },
    });
  }

  async bulkUpdatePartnerStatus(ids: string[], status: any): Promise<{ count: number }> {
    this.homepagePartnersCache = null;
    return this.prisma.partner.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  async bulkDeletePartners(ids: string[]): Promise<{ count: number }> {
    this.homepagePartnersCache = null;
    const existing = await this.prisma.partner.findMany({
      where: { id: { in: ids } },
      select: { logoId: true, logoDarkId: true },
    });
    const mediaIds = existing.flatMap((e) => [e.logoId, e.logoDarkId]).filter(Boolean) as string[];

    const result = await this.prisma.partner.deleteMany({
      where: { id: { in: ids } },
    });

    if (mediaIds.length > 0) {
      await this.prisma.media.deleteMany({ where: { id: { in: mediaIds } } }).catch(() => {});
    }

    return result;
  }
}
