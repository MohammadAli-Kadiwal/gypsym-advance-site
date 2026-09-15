import { PrismaClient, ContentStatus, ComponentType } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const prisma = new PrismaClient();

const CATEGORIES_DATA = [
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    description: 'High-converting fashion apparel, streetwear, luxury attire, and accessories on Shopify Plus.',
    displayOrder: 1,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Beauty & Cosmetics',
    slug: 'beauty-cosmetics',
    description: 'Direct-to-consumer skincare, organic beauty formulations, and luxury fragrances.',
    displayOrder: 2,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Nutraceuticals, wellness supplements, holistic care, and subscription replenishment engines.',
    displayOrder: 3,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Ergonomic home essentials, handcrafted spiritual decor, and luxury interior furnishings.',
    displayOrder: 4,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    description: 'Modern ambient lighting, smart consumer hardware, and technical lifestyle accessories.',
    displayOrder: 5,
    status: ContentStatus.PUBLISHED,
  },
];

const PROJECTS_DATA = [
  {
    orderNumber: '01',
    title: 'RioRabbit Luxury Perfumes & Eyewear',
    slug: 'riorabbit-luxury',
    client: 'RioRabbit',
    categorySlug: 'beauty-cosmetics',
    description:
      'Bespoke Shopify Plus storefront with dynamic sensory fragrance notes visualizer, custom bundle builder, and sub-second checkout.',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
    altText: 'RioRabbit luxury perfume and fragrance showcase storefront',
    projectUrl: 'https://riorabbit.com',
    tags: ['Shopify Plus', 'Liquid', 'Bundle Builder', 'TailwindCSS'],
    metrics: '+142% Conversion · 0.7s LCP',
    displayOrder: 1,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '02',
    title: 'Ayaasa Organic Skincare & Botanicals',
    slug: 'ayaasa-skincare',
    client: 'Ayaasa Botanicals',
    categorySlug: 'beauty-cosmetics',
    description:
      'Clean Ayurvedic skincare flagship with custom skin diagnostic quiz, localized international currencies, and ReCharge subscription integration.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
    altText: 'Ayaasa organic skincare and serum collection',
    projectUrl: 'https://ayaasa.com',
    tags: ['Shopify Plus', 'ReCharge', 'Skin Quiz API', 'Headless UX'],
    metrics: '+68% AOV · 99 Performance Score',
    displayOrder: 2,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '03',
    title: 'Alziba Cares Premium Personal Care',
    slug: 'alziba-cares',
    client: 'Alziba Cares',
    categorySlug: 'beauty-cosmetics',
    description:
      'High-velocity D2C personal care catalog engineered for high mobile conversion with instant 1-click cart drawer and smart cross-sells.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    altText: 'Alziba Cares personal care and body wash collection',
    projectUrl: 'https://alzibacares.com',
    tags: ['Shopify 2.0', 'Custom Drawer Cart', 'Klaviyo', 'Mobile First'],
    metrics: '+54% Mobile Conversion · 0.6s Load',
    displayOrder: 3,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '04',
    title: 'Crafken Ergonomic Living & Posture Support',
    slug: 'crafken-ergonomics',
    client: 'Crafken Living',
    categorySlug: 'home-living',
    description:
      'Engineered orthopedic memory foam seat cushions and posture living store with 3D product interactive viewer and custom post-purchase upsells.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop',
    altText: 'Crafken ergonomic living cushion and workspace setup',
    projectUrl: 'https://crafken.com',
    tags: ['Shopify Plus', '3D Model Viewer', 'Post-Purchase Upsell'],
    metrics: '+85% Repeat Purchases · $4.2M GMV',
    displayOrder: 4,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '05',
    title: 'Clutch & Gear Motorcycle Riding Essentials',
    slug: 'clutch-and-gear',
    client: 'Clutch & Gear',
    categorySlug: 'fashion-apparel',
    description:
      'High-durability technical riding gear, helmets, and moto-lifestyle apparel with dynamic vehicle year/make/model fitment filter.',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop',
    altText: 'Clutch and Gear motorcycle riding jacket and helmet',
    projectUrl: 'https://clutchandgear.com',
    tags: ['Shopify 2.0', 'Fitment Filter', 'Liquid', 'Instant Search'],
    metrics: '+118% Search-to-Checkout Rate',
    displayOrder: 5,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '06',
    title: 'Esvar Stonecraft Heritage Murti & Sacred Décor',
    slug: 'esvar-stonecraft',
    client: 'Esvar Stonecraft',
    categorySlug: 'home-living',
    description:
      'Artisanal temple marble idols and spiritual home artifacts with custom freight calculation, high-res zoom, and white-glove delivery scheduling.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    altText: 'Esvar Stonecraft artisanal marble temple sculptures and home artifacts',
    projectUrl: 'https://esvarstonecraft.com',
    tags: ['Shopify Plus', 'Heavy Freight API', 'Custom Zoom', 'High Ticket'],
    metrics: '$1,850 Avg Order Value · Zero Drop-off',
    displayOrder: 6,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '07',
    title: 'The Curen Functional Bio-Nutraceuticals',
    slug: 'the-curen-wellness',
    client: 'The Curen Laboratories',
    categorySlug: 'health-wellness',
    description:
      'Clinical-grade nutraceutical flagship featuring recurring subscription perks, certificate of analysis verification, and automated replenishment.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
    altText: 'The Curen functional wellness bottles and packaging',
    projectUrl: 'https://thecuren.com',
    tags: ['Shopify Plus', 'Subscriptions', 'ReCharge', 'Nutra CRO'],
    metrics: '+72% Subscription Adoption Rate',
    displayOrder: 7,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '08',
    title: 'GPLife Active Herbal Nutrition',
    slug: 'gplife-wellness',
    client: 'GPLife Health',
    categorySlug: 'health-wellness',
    description:
      'Fast, mobile-optimized herbal supplement e-store with personalized vitality bundles, ingredient transparency tool, and TikTok Shop sync.',
    imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=1200&auto=format&fit=crop',
    altText: 'GPLife herbal health supplements and active lifestyle products',
    projectUrl: 'https://gplifewellness.com',
    tags: ['Shopify 2.0', 'TikTok Shop Integration', 'Bundle Builder'],
    metrics: '+164% Social Traffic Conversion',
    displayOrder: 8,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '09',
    title: 'Lamper Store Smart Ambient Lighting',
    slug: 'lamper-smart-lighting',
    client: 'Lamper Tech',
    categorySlug: 'electronics-gadgets',
    description:
      'Minimalist smart architectural ambient lamps storefront with interactive lighting room simulator, video product showcases, and instant Apple Pay.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop',
    altText: 'Lamper smart ambient lighting fixture in modern room',
    projectUrl: 'https://lamper.store',
    tags: ['Shopify Plus', 'Video Streaming', 'Room Simulator', 'Apple Pay'],
    metrics: '0.55s LCP · +48% Mobile Checkout',
    displayOrder: 9,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '10',
    title: 'Aura Couture Minimalist D2C Apparel',
    slug: 'aura-couture-fashion',
    client: 'Aura Luxury Group',
    categorySlug: 'fashion-apparel',
    description:
      'Luxury ready-to-wear fashion storefront featuring editorial lookbooks, predictive size recommendation, and seamless international checkout.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    altText: 'Aura Couture modern minimalist luxury fashion collection',
    projectUrl: 'https://auracouture.in',
    tags: ['Shopify Plus', 'Lookbook Interactive', 'Shopify Markets'],
    metrics: '+92% International Sales · $6.5M GMV',
    displayOrder: 10,
    status: ContentStatus.PUBLISHED,
  },
];

async function main() {
  console.log('🚀 Seeding Shopify Agency Portfolio Categories & 10 Projects...');

  // 1. Seed Categories
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES_DATA) {
    const upserted = await prisma.portfolioCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
        status: cat.status,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        status: cat.status,
      },
    });
    categoryMap.set(cat.slug, upserted.id);
    console.log(`  ✓ Category: ${cat.name} (${upserted.id})`);
  }

  // 2. Remove obsolete project slugs if they exist
  const obsoleteSlugs = [
    'apex-capital-derivatives',
    'sovereign-rag-mesh',
    'turbomesh-edge-network',
    'federated-health-diagnostics',
    'aura-luxury-commerce',
  ];
  await prisma.portfolioProjectItem.deleteMany({
    where: { slug: { in: obsoleteSlugs } },
  });

  // 3. Seed 10 Projects
  for (const p of PROJECTS_DATA) {
    const categoryId = categoryMap.get(p.categorySlug) || null;
    await prisma.portfolioProjectItem.upsert({
      where: { slug: p.slug },
      update: {
        orderNumber: p.orderNumber,
        title: p.title,
        client: p.client,
        categoryId,
        description: p.description,
        imageUrl: p.imageUrl,
        altText: p.altText,
        projectUrl: p.projectUrl,
        tags: p.tags,
        metrics: p.metrics,
        displayOrder: p.displayOrder,
        status: p.status,
      },
      create: {
        orderNumber: p.orderNumber,
        title: p.title,
        slug: p.slug,
        client: p.client,
        categoryId,
        description: p.description,
        imageUrl: p.imageUrl,
        altText: p.altText,
        projectUrl: p.projectUrl,
        tags: p.tags,
        metrics: p.metrics,
        displayOrder: p.displayOrder,
        status: p.status,
      },
    });
    console.log(`  ✓ Project: ${p.title} (${p.slug})`);
  }

  // 4. Update / Upsert CMS Pages ("portfolio" and "our-work")
  const pagesToUpdate = ['our-work', 'portfolio'];

  for (const pageSlug of pagesToUpdate) {
    let page = await prisma.page.findFirst({
      where: { slug: pageSlug, deletedAt: null },
    });

    if (!page) {
      page = await prisma.page.create({
        data: {
          slug: pageSlug,
          title: 'Portfolio',
          description:
            'High-growth Shopify Plus storefronts, custom Liquid architectures, and high-conversion D2C experiences engineered by Gypsym.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          layoutType: 'DEFAULT',
        },
      });
      console.log(`  ✓ Created Page: ${pageSlug} (${page.id})`);
    } else {
      page = await prisma.page.update({
        where: { id: page.id },
        data: {
          title: 'Portfolio',
          description:
            'High-growth Shopify Plus storefronts, custom Liquid architectures, and high-conversion D2C experiences engineered by Gypsym.',
          status: ContentStatus.PUBLISHED,
        },
      });
      console.log(`  ✓ Updated Page: ${pageSlug} (${page.id})`);
    }

    // Upsert SEO Metadata
    await prisma.seoMetadata.upsert({
      where: { pageId: page.id },
      update: {
        metaTitle: 'Portfolio & Case Studies | Gypsym Shopify Agency',
        metaDescription:
          'Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C experiences built by Gypsym Technology.',
        ogTitle: 'Portfolio | Gypsym Technology',
        ogDescription:
          'Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C experiences built by Gypsym Technology.',
        robotsIndex: true,
        robotsFollow: true,
      },
      create: {
        page: { connect: { id: page.id } },
        metaTitle: 'Portfolio & Case Studies | Gypsym Shopify Agency',
        metaDescription:
          'Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C experiences built by Gypsym Technology.',
        ogTitle: 'Portfolio | Gypsym Technology',
        ogDescription:
          'Explore high-growth Shopify Plus stores, custom themes, and conversion-engineered D2C experiences built by Gypsym Technology.',
        robotsIndex: true,
        robotsFollow: true,
      },
    });

    // Upsert Page Section
    const sectionIdentifier = pageSlug === 'portfolio' ? 'portfolio-showcase' : 'our-work-portfolio';
    const existingSection = await prisma.pageSection.findFirst({
      where: { pageId: page.id, sectionIdentifier },
    });

    const sectionPayload = {
      eyebrow: 'SELECTED D2C WORKS',
      title: 'Stores we are proud of.',
      titleHighlight: 'proud',
      description:
        'A curated collection of high-growth Shopify Plus storefronts, custom Liquid architectures, and high-conversion D2C experiences engineered by Gypsym.',
      showCategoryFilter: true,
      defaultCategory: 'all',
      hoverEffectsEnabled: true,
      viewButtonEnabled: true,
      viewButtonLabel: 'View',
      overlayEnabled: true,
      backdropBlurEnabled: true,
      imageZoomEnabled: true,
      threeDScrollEnabled: true,
      threeDIntensity: 'premium',
      mouseParallaxEnabled: true,
      showHeroStrip: true,
      heroCredentials: [
        { label: 'Shopify Plus Partner', value: 'Official Agency', sub: 'Enterprise D2C Specialists' },
        { label: 'Cost Advantage', value: '40–60%', sub: 'Less than US/UK agencies' },
        { label: 'Mobile Store Speed', value: '< 0.8s', sub: '99+ Core Web Vitals' },
        { label: 'Dedicated Specialists', value: '25+', sub: 'Liquid, CRO & Theme leads' },
      ],
    };

    if (existingSection) {
      await prisma.pageSection.update({
        where: { id: existingSection.id },
        data: {
          componentType: ComponentType.FEATURE_GRID,
          displayOrder: 1,
          isActive: true,
          contentPayload: sectionPayload,
        },
      });
      console.log(`  ✓ Updated PageSection: ${sectionIdentifier}`);
    } else {
      await prisma.pageSection.create({
        data: {
          pageId: page.id,
          sectionIdentifier,
          componentType: ComponentType.FEATURE_GRID,
          displayOrder: 1,
          isActive: true,
          contentPayload: sectionPayload,
        },
      });
      console.log(`  ✓ Created PageSection: ${sectionIdentifier}`);
    }
  }

  console.log('🎉 Shopify Agency Portfolio Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
