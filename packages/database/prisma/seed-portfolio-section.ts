import { PrismaClient, ComponentType } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Section 5: Portfolio / Our Work for Home page...');

  const homePage = await prisma.page.findFirst({
    where: { slug: 'home' },
  });

  if (!homePage) {
    console.error('❌ Home page not found!');
    return;
  }

  // Ensure subsequent sections are placed after Section 5
  await prisma.pageSection.updateMany({
    where: { pageId: homePage.id, sectionIdentifier: 'delivery-process' },
    data: { displayOrder: 6 },
  });

  await prisma.pageSection.updateMany({
    where: { pageId: homePage.id, sectionIdentifier: 'client-testimonials' },
    data: { displayOrder: 7 },
  });

  // Section 5: Portfolio / Our Work (2 -> 1 -> 2 layout)
  const portfolioData = {
    pageId: homePage.id,
    sectionIdentifier: 'portfolio-showcase',
    componentType: ComponentType.FEATURE_GRID,
    displayOrder: 5,
    isActive: true,
    contentPayload: {
      eyebrow: 'PORTFOLIO',
      title: 'Our Work In Production',
      titleHighlight: 'Our Work',
      description:
        'High-performance architectures, mission-critical platforms, and conversion engines engineered for global enterprises.',
      
      // Hover Settings
      hoverEffectsEnabled: true,
      viewButtonEnabled: true,
      viewButtonLabel: 'View',
      viewButtonPosition: 'center', // 'center' | 'bottom-center' | 'bottom-right'
      overlayEnabled: true,
      backdropBlurEnabled: true,
      imageZoomEnabled: true,

      // Display Limit
      maxDisplayCount: 5,

      // 3D Animation Settings
      threeDScrollEnabled: true,
      threeDIntensity: 'premium', // 'subtle' | 'premium'
      mouseParallaxEnabled: true,

      // 5 Projects for 2 -> 1 -> 2 Layout
      projects: [
        {
          id: 'proj-01',
          orderNumber: '01',
          title: 'Apex Capital Derivatives Exchange',
          client: 'Apex Capital Management',
          category: 'Financial Infrastructure',
          description:
            'Ultra-low-latency distributed clearing architecture processing $40B+ daily transaction volume with sub-10ms finality.',
          imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop',
          altText: 'Apex Capital derivatives trading terminal and liquidity ledger',
          projectUrl: '/portfolio/apex-capital-derivatives',
          tags: ['Rust', 'eBPF', 'Kafka'],
          metrics: '$40B+ Daily Volume · 99.999% SLA',
        },
        {
          id: 'proj-02',
          orderNumber: '02',
          title: 'Sovereign RAG Neural Knowledge Mesh',
          client: 'Sovereign Cloud AI',
          category: 'Generative AI & Search',
          description:
            'Enterprise-grade air-gapped hybrid retrieval engine indexing 250M+ unstructured contracts with semantic vector guarantees.',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
          altText: 'Sovereign RAG vector embeddings and neural retrieval visualizer',
          projectUrl: '/portfolio/sovereign-rag-mesh',
          tags: ['Python', 'pgvector', 'vLLM'],
          metrics: '250M+ Vectors · 12ms Latency',
        },
        {
          id: 'proj-03',
          orderNumber: '03',
          title: 'Global Telecommunications Edge Network (Turbomesh)',
          client: 'Vanguard Telecom',
          category: 'Distributed Edge Systems',
          description:
            'Software-defined programmable routing fabric deployed across 48 global points of presence, providing sub-millisecond edge failover.',
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1800&auto=format&fit=crop',
          altText: 'Turbomesh edge datacenter cluster and global routing fabric',
          projectUrl: '/portfolio/turbomesh-edge-network',
          tags: ['Go', 'C', 'Kubernetes', 'WebAssembly'],
          metrics: '48 Global PoPs · 0 Packet Loss',
        },
        {
          id: 'proj-04',
          orderNumber: '04',
          title: 'Federated Health Diagnostic Intelligence',
          client: 'Global Health Systems',
          category: 'Healthcare & Life Sciences',
          description:
            'Zero-knowledge federated oncology inference network interconnecting 60+ university medical centers with HIPAA-compliant cryptographic validation.',
          imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
          altText: 'Federated clinical diagnostic imaging and diagnostic intelligence suite',
          projectUrl: '/portfolio/federated-health-diagnostics',
          tags: ['PyTorch', 'Zero-Knowledge', 'Postgres'],
          metrics: '60+ Hospitals · 0 Bytes Raw Data Moved',
        },
        {
          id: 'proj-05',
          orderNumber: '05',
          title: 'Autonomous Multi-Store Commerce Engine',
          client: 'Aura Luxury Group',
          category: 'Enterprise Headless Commerce',
          description:
            'Headless Next.js 14 multi-tenant storefront with dynamic localized pricing, edge caching, and a 42% lift in global checkout conversions.',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
          altText: 'Aura luxury group multi-storefront analytics and checkout interface',
          projectUrl: '/portfolio/aura-luxury-commerce',
          tags: ['Next.js', 'Turborepo', 'TailwindCSS'],
          metrics: '+42% Conversion · 0.7s LCP',
        },
      ],
    },
  };

  const existing = await prisma.pageSection.findFirst({
    where: { pageId: homePage.id, sectionIdentifier: 'portfolio-showcase' },
  });

  if (existing) {
    await prisma.pageSection.update({
      where: { id: existing.id },
      data: portfolioData,
    });
    console.log('✅ Updated Section 5: portfolio-showcase');
  } else {
    await prisma.pageSection.create({
      data: portfolioData,
    });
    console.log('✅ Created Section 5: portfolio-showcase');
  }

  console.log('🎉 Portfolio / Our Work section successfully populated in database.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
