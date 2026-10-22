const path = require('path');
const fs = require('fs');

// Try loading .env if process.env.DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

const { PrismaClient } = require('../packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

const portfolioCategories = [
  {
    name: 'Fashion & Lifestyle',
    slug: 'fashion-lifestyle',
    description: 'Modern apparel, luxury fashion brands, streetwear, footwear, and designer lifestyle platforms.',
    displayOrder: 1,
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Cosmetics, organic skincare, haircare, wellness aesthetics, and premium personal grooming brands.',
    displayOrder: 2,
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Nutrition supplements, fitness gear, mental well-being products, and holistic health stores.',
    displayOrder: 3,
  },
  {
    name: 'Electronics & Technology',
    slug: 'electronics-technology',
    description: 'Consumer electronics, smart hardware, high-performance computing gadgets, and tech accessories.',
    displayOrder: 4,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Interior decor, contemporary furniture, kitchen essentials, architectural lighting, and home furnishings.',
    displayOrder: 5,
  },
  {
    name: 'Jewellery & Accessories',
    slug: 'jewellery-accessories',
    description: 'Fine jewelry, handcrafted ornaments, watches, bespoke eyewear, and luxury wearable accessories.',
    displayOrder: 6,
  },
  {
    name: 'Arts, Crafts & Specialty Products',
    slug: 'arts-crafts-specialty-products',
    description: 'Artisanal creations, bespoke handmade crafts, collectibles, stationery, and niche specialty merchandise.',
    displayOrder: 7,
  },
];

async function seed() {
  console.log('🌱 Seeding Portfolio Categories...');
  for (const cat of portfolioCategories) {
    const record = await prisma.portfolioCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
        status: 'PUBLISHED',
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        status: 'PUBLISHED',
      },
    });
    console.log(` ✓ [${record.displayOrder}] ${record.name} (${record.slug}) -> ID: ${record.id}`);
  }
  console.log('✅ Done seeding all 7 portfolio categories!');
}

seed()
  .catch((err) => {
    console.error('❌ Error seeding portfolio categories:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
