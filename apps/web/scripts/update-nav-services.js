const { PrismaClient } = require('@gypsym/database');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: 'asc' },
  });

  console.log(`Found ${services.length} published services:`);
  services.forEach(s => console.log(` - ${s.title} (${s.slug})`));

  const navItems = await prisma.navigationItem.findMany({
    where: { label: 'Services' },
  });

  console.log(`Found ${navItems.length} Services navigation items`);

  const megaMenuItems = services.map(s => ({
    title: s.title,
    description: s.tagline || s.shortDescription || 'Shopify development & engineering service.',
    url: `/services/${s.slug}`,
    icon: s.iconName || 'Layers',
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

  for (const item of navItems) {
    await prisma.navigationItem.update({
      where: { id: item.id },
      data: {
        megaMenuConfig: updatedConfig,
      },
    });
    console.log(`Updated navigation item ${item.id} with ${megaMenuItems.length} actual services!`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
