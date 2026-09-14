import { PrismaClient, ContentStatus, ComponentType } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const prisma = new PrismaClient();

const CATEGORIES_DATA = [
  {
    name: 'Financial Infrastructure',
    slug: 'financial-infrastructure',
    description: 'Ultra-low-latency distributed clearing architectures, ledger networks, and transaction engines.',
    displayOrder: 1,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Generative AI & Search',
    slug: 'generative-ai-search',
    description: 'Enterprise neural knowledge meshes, private RAG pipelines, and hybrid vector search fabrics.',
    displayOrder: 2,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Distributed Edge Systems',
    slug: 'distributed-edge-systems',
    description: 'Global programmable routing fabrics, carrier-grade 5G edge orchestration, and telemetry networks.',
    displayOrder: 3,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Healthcare & Life Sciences',
    slug: 'healthcare-life-sciences',
    description: 'Cryptographic zero-knowledge health meshes and sovereign diagnostic oncology inference platforms.',
    displayOrder: 4,
    status: ContentStatus.PUBLISHED,
  },
  {
    name: 'Enterprise Headless Commerce',
    slug: 'enterprise-headless-commerce',
    description: 'Multi-store headless commerce engines, edge pricing synchronization, and conversion optimization platforms.',
    displayOrder: 5,
    status: ContentStatus.PUBLISHED,
  },
];

const PROJECTS_DATA = [
  {
    orderNumber: '01',
    title: 'Apex Capital Derivatives Exchange',
    slug: 'apex-capital-derivatives',
    client: 'Apex Capital Management',
    categorySlug: 'financial-infrastructure',
    description:
      'Ultra-low-latency distributed clearing architecture processing $40B+ daily transaction volume with sub-10ms finality.',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop',
    altText: 'Apex Capital derivatives trading terminal and liquidity ledger',
    projectUrl: '/portfolio/apex-capital-derivatives',
    tags: ['Rust', 'eBPF', 'Kafka'],
    metrics: '$40B+ Daily Volume · 99.999% SLA',
    displayOrder: 1,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '02',
    title: 'Sovereign RAG Neural Knowledge Mesh',
    slug: 'sovereign-rag-mesh',
    client: 'Sovereign Cloud AI',
    categorySlug: 'generative-ai-search',
    description:
      'Enterprise-grade air-gapped hybrid retrieval engine indexing 250M+ unstructured contracts with semantic vector guarantees.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    altText: 'Sovereign RAG vector embeddings and neural retrieval visualizer',
    projectUrl: '/portfolio/sovereign-rag-mesh',
    tags: ['Python', 'pgvector', 'vLLM'],
    metrics: '250M+ Vectors · 12ms Latency',
    displayOrder: 2,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '03',
    title: 'Global Telecommunications Edge Network (Turbomesh)',
    slug: 'turbomesh-edge-network',
    client: 'Vanguard Telecom',
    categorySlug: 'distributed-edge-systems',
    description:
      'Software-defined programmable routing fabric deployed across 48 global points of presence, providing sub-millisecond edge failover.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1800&auto=format&fit=crop',
    altText: 'Turbomesh edge datacenter cluster and global routing fabric',
    projectUrl: '/portfolio/turbomesh-edge-network',
    tags: ['Go', 'C', 'Kubernetes', 'WebAssembly'],
    metrics: '48 Global PoPs · 0 Packet Loss',
    displayOrder: 3,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '04',
    title: 'Federated Health Diagnostic Intelligence',
    slug: 'federated-health-diagnostics',
    client: 'Global Health Systems',
    categorySlug: 'healthcare-life-sciences',
    description:
      'Zero-knowledge federated oncology inference network interconnecting 60+ university medical centers with HIPAA-compliant cryptographic validation.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
    altText: 'Federated clinical diagnostic imaging and diagnostic intelligence suite',
    projectUrl: '/portfolio/federated-health-diagnostics',
    tags: ['PyTorch', 'Zero-Knowledge', 'Postgres'],
    metrics: '60+ Hospitals · 0 Bytes Raw Data Moved',
    displayOrder: 4,
    status: ContentStatus.PUBLISHED,
  },
  {
    orderNumber: '05',
    title: 'Autonomous Multi-Store Commerce Engine',
    slug: 'aura-luxury-commerce',
    client: 'Aura Luxury Group',
    categorySlug: 'enterprise-headless-commerce',
    description:
      'Headless Next.js 14 multi-tenant storefront with dynamic localized pricing, edge caching, and a 42% lift in global checkout conversions.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    altText: 'Aura luxury group multi-storefront analytics and checkout interface',
    projectUrl: '/portfolio/aura-luxury-commerce',
    tags: ['Next.js', 'Turborepo', 'TailwindCSS'],
    metrics: '+42% Conversion · 0.7s LCP',
    displayOrder: 5,
    status: ContentStatus.PUBLISHED,
  },
];

async function main() {
  console.log('🚀 Seeding Portfolio Categories & Projects...');

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

  // 2. Seed Projects
  for (const p of PROJECTS_DATA) {
    const categoryId = categoryMap.get(p.categorySlug) || null;
    const upserted = await prisma.portfolioProjectItem.upsert({
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
    console.log(`  ✓ Project: ${p.title} -> Category ID: ${categoryId}`);
  }

  // 3. Seed / Upsert Dedicated "our-work" CMS Page
  console.log('📄 Creating / Updating CMS Page: /our-work...');
  let ourWorkPage = await prisma.page.findFirst({
    where: { slug: 'our-work', deletedAt: null },
  });

  if (!ourWorkPage) {
    ourWorkPage = await prisma.page.create({
      data: {
        slug: 'our-work',
        title: 'Our Work',
        description:
          "Work we're proud of. A collection of digital experiences, mission-critical platforms, and brands we've helped build.",
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        layoutType: 'DEFAULT',
      },
    });
    console.log(`  ✓ Created Page: our-work (${ourWorkPage.id})`);
  } else {
    ourWorkPage = await prisma.page.update({
      where: { id: ourWorkPage.id },
      data: {
        title: 'Our Work',
        description:
          "Work we're proud of. A collection of digital experiences, mission-critical platforms, and brands we've helped build.",
        status: ContentStatus.PUBLISHED,
      },
    });
    console.log(`  ✓ Updated Page: our-work (${ourWorkPage.id})`);
  }

  // 4. Seed / Upsert SEO Metadata for our-work
  await prisma.seoMetadata.upsert({
    where: { pageId: ourWorkPage.id },
    update: {
      metaTitle: 'Our Work | Gypsym Technology',
      metaDescription:
        'Explore enterprise portfolio case studies, high-throughput cloud platforms, and generative AI architectures built by Gypsym Technology.',
      ogTitle: 'Our Work | Gypsym Technology',
      ogDescription:
        'Explore enterprise portfolio case studies, high-throughput cloud platforms, and generative AI architectures built by Gypsym Technology.',
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      page: { connect: { id: ourWorkPage.id } },
      metaTitle: 'Our Work | Gypsym Technology',
      metaDescription:
        'Explore enterprise portfolio case studies, high-throughput cloud platforms, and generative AI architectures built by Gypsym Technology.',
      ogTitle: 'Our Work | Gypsym Technology',
      ogDescription:
        'Explore enterprise portfolio case studies, high-throughput cloud platforms, and generative AI architectures built by Gypsym Technology.',
      robotsIndex: true,
      robotsFollow: true,
    },
  });
  console.log('  ✓ Updated SEO Metadata for our-work');

  // 5. Seed / Upsert Page Section for our-work
  const sectionIdentifier = 'our-work-portfolio';
  const existingSection = await prisma.pageSection.findFirst({
    where: { pageId: ourWorkPage.id, sectionIdentifier },
  });

  const sectionPayload = {
    eyebrow: 'OUR WORK',
    title: "Work we're proud of.",
    titleHighlight: 'Our Work',
    description:
      "A collection of digital experiences, mission-critical platforms, and brands we've helped build.",
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
    console.log('  ✓ Updated PageSection: our-work-portfolio');
  } else {
    await prisma.pageSection.create({
      data: {
        pageId: ourWorkPage.id,
        sectionIdentifier,
        componentType: ComponentType.FEATURE_GRID,
        displayOrder: 1,
        isActive: true,
        contentPayload: sectionPayload,
      },
    });
    console.log('  ✓ Created PageSection: our-work-portfolio');
  }

  console.log('🎉 Portfolio Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
