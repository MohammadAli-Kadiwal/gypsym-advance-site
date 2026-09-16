import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const GYPSYM_SERVICES = [
  {
    slug: 'e-commerce-solutions',
    title: 'E-commerce Solutions',
    tagline: 'Complete Shopify & Shopify Plus stores designed to sell — not just look pretty.',
    category: 'E-Commerce',
    shortDescription:
      'We build complete Shopify stores designed to sell — not just look pretty. From product pages to checkout optimization, every detail is handled so your store generates revenue from day one.',
    detailedContent:
      'At Gypsym, we engineer full-funnel Shopify and Shopify Plus storefronts that scale effortlessly. Whether you are launching your first flagship digital storefront or migrating an enterprise multi-million dollar catalog, our engineering team ensures lightning speed, bulletproof checkout funnels, seamless ERP/WMS synchronization, and localized multi-currency purchasing experiences.',
    displayOrder: 1,
    status: ContentStatus.PUBLISHED,
  },
  {
    slug: 'web-design-development',
    title: 'Web Design & Development',
    tagline: 'Custom, responsive websites that captivate visitors, load fast, and drive conversions.',
    category: 'Design & Engineering',
    shortDescription:
      'Your website is your storefront, salesperson, and brand ambassador — all in one. We design and develop sites that look incredible, load fast, and guide visitors toward buying.',
    detailedContent:
      'Digital flagship experiences built with bespoke UI/UX and ultra-clean Liquid/Hydrogen architectures. We avoid generic off-the-shelf templates in favor of tailored design systems in Figma translated into fast, responsive, and accessible code that elevates your brand perception and boosts user engagement across every viewport.',
    displayOrder: 2,
    status: ContentStatus.PUBLISHED,
  },
  {
    slug: 'search-engine-optimization',
    title: 'Search Engine Optimization',
    tagline: 'Technical SEO, structured data, and on-page strategy that ranks your store on Google.',
    category: 'Growth & Search',
    shortDescription:
      'Getting found on Google should not feel like a mystery. We handle technical SEO, content strategy, and ongoing optimization so your store shows up when ideal customers are searching.',
    detailedContent:
      'Our e-commerce SEO practice tackles technical bottlenecks head-on. From resolving Shopify-specific collection duplication and canonicalization quirks to deploying comprehensive JSON-LD product schemas, rich snippets, and international hreflang tags, we systematically increase your organic search visibility, high-intent traffic, and sustainable inbound revenue.',
    displayOrder: 3,
    status: ContentStatus.PUBLISHED,
  },
  {
    slug: 'website-maintenance',
    title: 'Website Maintenance',
    tagline: 'Proactive 24/7 SLA monitoring, emergency fixes, and ongoing performance retainers.',
    category: 'Operations & Retainers',
    shortDescription:
      'A website that goes down costs you money. We keep your store updated, secure, and performing at its best with proactive monitoring, regular updates, and fast issue resolution.',
    detailedContent:
      'Eliminate technical anxiety with Gypsym’s dedicated ongoing engineering retainers. You receive real-time uptime monitoring, staging-verified app and theme updates, sub-60-minute emergency escalation protocols, continuous Core Web Vitals maintenance, and direct access to senior Shopify developers via dedicated Slack.',
    displayOrder: 4,
    status: ContentStatus.PUBLISHED,
  },
  {
    slug: 'theme-customization',
    title: 'Theme Customization',
    tagline: 'Bespoke Shopify theme engineering tailored to your brand identity and conversion goals.',
    category: 'Design & Engineering',
    shortDescription:
      'Your brand deserves more than a template that looks like everyone else. We create custom Shopify themes that reflect your brand identity and are built to convert.',
    detailedContent:
      'Transform your existing Shopify OS 2.0 theme into a customized digital storefront. We build bespoke modular sections, dynamic block controls, interactive sticky cart drawers, custom variant pickers, and tailored PDP modules that empower your marketing team to launch new campaigns without needing continuous developer intervention.',
    displayOrder: 5,
    status: ContentStatus.PUBLISHED,
  },
  {
    slug: 'store-optimization',
    title: 'Store Optimization',
    tagline: 'Boost conversions, slash bounce rates, and accelerate page speed to maximize revenue.',
    category: 'Performance & CRO',
    shortDescription:
      'Slow page loads and confusing checkout flows kill your sales. We audit your store, identify bottlenecks, and implement fixes that boost speed, conversions, and average order value.',
    detailedContent:
      'Turn lost traffic into bottom-line profit. Our CRO and speed specialists conduct deep behavioral session audits, remove render-blocking third-party app bloat, optimize critical rendering paths to guarantee 90+ Core Web Vitals scores, and implement high-converting cart upsells and streamlined checkout touchpoints.',
    displayOrder: 6,
    status: ContentStatus.PUBLISHED,
  },
  {
    slug: 'store-setup',
    title: 'Store Setup',
    tagline: 'Turnkey Shopify store setup, configuration, and launch — executed right the first time.',
    category: 'Setup & Launch',
    shortDescription:
      'Getting your Shopify store up and running the right way matters. We handle setup, configuration, payment gateways, shipping rules, tax settings, and app integrations so you can focus on selling.',
    detailedContent:
      'Launch with complete confidence. As certified Shopify Partners, we manage every facet of your initial store onboarding: tax Nexus configuration, global shipping zones, payment gateways (Stripe, PayPal, Klarna, regional providers), product schema architecture, DNS setup, tracking pixels, and hands-on operational team training.',
    displayOrder: 7,
    status: ContentStatus.PUBLISHED,
  },
];

async function run() {
  console.log('🔄 Starting clean and seed for Gypsym Services...');

  const newSlugs = GYPSYM_SERVICES.map((s) => s.slug);

  // 1. Find existing services not in the new official list
  const existingServices = await prisma.service.findMany({
    select: { id: true, slug: true, title: true },
  });

  const toRemove = existingServices.filter((s) => !newSlugs.includes(s.slug));

  if (toRemove.length > 0) {
    console.log(`🧹 Removing ${toRemove.length} obsolete placeholder services:`);
    for (const s of toRemove) {
      console.log(`   - Deleting: "${s.title}" (${s.slug})`);
      // Delete child relations if any
      await prisma.serviceTechnology.deleteMany({ where: { serviceId: s.id } }).catch(() => {});
      await prisma.serviceSolution.deleteMany({ where: { serviceId: s.id } }).catch(() => {});
      await prisma.service.delete({ where: { id: s.id } });
    }
    console.log('✅ Obsolete services removed.');
  } else {
    console.log('ℹ️ No obsolete services to delete.');
  }

  // 2. Upsert the 7 official services
  console.log(`🌱 Seeding ${GYPSYM_SERVICES.length} authentic services from gypsym.com:`);
  for (const s of GYPSYM_SERVICES) {
    const existing = await prisma.service.findFirst({
      where: { slug: s.slug, locale: 'en' },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          title: s.title,
          tagline: s.tagline,
          shortDescription: s.shortDescription,
          detailedContent: s.detailedContent,
          displayOrder: s.displayOrder,
          status: s.status,
          publishedAt: new Date(),
          deletedAt: null,
        },
      });
      console.log(`   ✓ Updated: "${s.title}" (${s.slug})`);
    } else {
      await prisma.service.create({
        data: {
          slug: s.slug,
          title: s.title,
          tagline: s.tagline,
          shortDescription: s.shortDescription,
          detailedContent: s.detailedContent,
          displayOrder: s.displayOrder,
          status: s.status,
          locale: 'en',
          publishedAt: new Date(),
        },
      });
      console.log(`   ✓ Created: "${s.title}" (${s.slug})`);
    }
  }

  const allActive = await prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: { displayOrder: 'asc' },
    select: { displayOrder: true, title: true, slug: true },
  });

  console.log('\n📊 Current Active Services in Database:');
  allActive.forEach((s) => console.log(`   ${s.displayOrder}. ${s.title} (/${s.slug})`));

  console.log('\n🎉 Gypsym services clean and seed complete!\n');
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error('❌ Error seeding services:', e);
  process.exit(1);
});
