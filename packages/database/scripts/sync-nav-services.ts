import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

const SERVICE_ICONS: Record<string, string> = {
  'e-commerce-solutions': 'ShoppingCart',
  'web-design-development': 'Layout',
  'search-engine-optimization': 'Search',
  'website-maintenance': 'ShieldCheck',
  'theme-customization': 'Palette',
  'store-optimization': 'Zap',
  'store-setup': 'Rocket',
};

async function main() {
  const services = await prisma.service.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
    },
    orderBy: { displayOrder: 'asc' },
  });

  console.log(`Found ${services.length} published services in DB:`);
  services.forEach((s) => console.log(`  • ${s.title} (slug: ${s.slug})`));

  const megaMenuItems = services.map((s) => ({
    title: s.title,
    description: s.tagline || s.shortDescription || 'Shopify engineering and growth service.',
    url: `/services/${s.slug}`,
    icon: SERVICE_ICONS[s.slug] || 'Layers',
  }));

  const updatedConfig = {
    enabled: true,
    category: 'OUR SERVICES',
    layout: '2-column',
    maxWidth: '5xl',
    items: megaMenuItems,
    featuredCta: {
      enabled: true,
      title: 'Looking for bespoke Shopify architecture?',
      description: 'Schedule a free 30-minute discovery consultation with our lead engineer.',
      buttonText: 'Book a Discovery Call',
      buttonUrl: '/book',
    },
  };

  const updateResult = await prisma.navigationItem.updateMany({
    where: { label: 'Services' },
    data: {
      megaMenuConfig: updatedConfig as any,
    },
  });

  console.log(`Successfully updated ${updateResult.count} Services navigation item(s) with actual services!`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error running sync-nav-services:', err);
  process.exit(1);
});
