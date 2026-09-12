import { PrismaClient, ComponentType } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const prisma = new PrismaClient();

const ADDITIONAL_CLIENTS = [
  {
    name: 'FinTech Horizon',
    slug: 'fintech-horizon',
    logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979dd980128708e9ebf0fe1_Feature%20Card%20(3).svg',
    websiteUrl: 'https://horizon.finance',
  },
  {
    name: 'Aura Cloud Systems',
    slug: 'aura-cloud-systems',
    logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979ddee87f63e9febdd720b_Feature%20Card%20(4).svg',
    websiteUrl: 'https://auracloud.io',
  },
  {
    name: 'Veloce Payments',
    slug: 'veloce-payments',
    logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979de091db4c0e377f11d7c_Feature%20Card%20(5).svg',
    websiteUrl: 'https://velocepay.com',
  },
  {
    name: 'OmniLogic AI',
    slug: 'omnilogic-ai',
    logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979de698d579838430c261a_Feature%20Card%20(6).svg',
    websiteUrl: 'https://omnilogic.ai',
  },
  {
    name: 'Quantum Health',
    slug: 'quantum-health',
    logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979de811d91c2a9ef083daa_Feature%20Card%20(7).svg',
    websiteUrl: 'https://quantumhealth.tech',
  },
  {
    name: 'Vertex Global',
    slug: 'vertex-global',
    logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979dee9b8c3b5a0558fb6cb_Feature%20Card%20(8).svg',
    websiteUrl: 'https://vertexglobal.org',
  },
  {
    name: 'Krypton Robotics',
    slug: 'krypton-robotics',
    logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979df0ee47b62496991984b_Feature%20Card%20(9).svg',
    websiteUrl: 'https://kryptonrobotics.io',
  },
];

async function main() {
  console.log('🌱 Seeding Section 8: Clients / Trusted By for Home page...');

  const homePage = await prisma.page.findFirst({
    where: { slug: 'home' },
  });

  if (!homePage) {
    console.error('❌ Home page not found!');
    return;
  }

  // Ensure there are at least 18 clients so the initial 8 / 6 / 4 layout is full
  let allClients = await prisma.client.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  if (allClients.length < 18) {
    console.log(`Current clients: ${allClients.length}. Supplementing up to 18 clients...`);
    for (const add of ADDITIONAL_CLIENTS) {
      if (allClients.length >= 18) break;
      const existing = await prisma.client.findFirst({ where: { name: add.name } });
      if (!existing) {
        const media = await prisma.media.create({
          data: {
            originalFilename: `${add.slug}-logo.svg`,
            mimeType: 'image/svg+xml',
            fileSizeBytes: BigInt(0),
            storageKey: `clients/logo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            altText: `${add.name} logo`,
            variants: { original: add.logoUrl },
          },
        });

        await prisma.client.create({
          data: {
            slug: `${add.slug}-${Date.now()}`,
            name: add.name,
            logoLightId: media.id,
            logoDarkId: media.id,
            websiteUrl: add.websiteUrl,
            displayOrder: (allClients.length + 1) * 10,
          },
        });
      }
    }

    allClients = await prisma.client.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  // Filter out any client with apex-bank-logo (hero placeholder) so we get clean client logos
  const eligibleClients = allClients.filter(
    (c) => c.name && !c.name.toLowerCase().includes('apex global financial')
  );

  const selectedClients = eligibleClients
    .slice(0, 18)
    .map((c, idx) => ({
      clientId: c.id,
      displayOrder: idx + 1,
      visibility: true,
    }));

    // Move client-testimonials to displayOrder: 8
    const testimonialsSection = await prisma.pageSection.findFirst({
      where: {
        pageId: homePage.id,
        sectionIdentifier: 'client-testimonials',
      },
    });
    if (testimonialsSection) {
      await prisma.pageSection.update({
        where: { id: testimonialsSection.id },
        data: { displayOrder: 8 },
      });
      console.log('✅ Moved client-testimonials to displayOrder 8');
    }

  const clientsSectionData = {
    pageId: homePage.id,
    sectionIdentifier: 'clients-trusted-by',
    componentType: ComponentType.LOGO_CLOUD,
    displayOrder: 7,
    isActive: true,
    contentPayload: {
      eyebrow: '',
      title: 'Trusted by 100+ brands worldwide',
      titleHighlight: '',
      description: '',
      cta: {
        enabled: false,
        label: 'Work With Us',
        url: '/contact',
        target: '_self',
      },
      layout: {
        preset: '8/6/4',
        rowPattern: [8, 6, 4],
        overflowBehavior: 'continue', // 'continue' | 'limit'
        rowAlignment: 'center',
        logoStyle: 'original', // 'muted' | 'grayscale' | 'monochrome' | 'original'
        logoSize: 'medium', // 'small' | 'medium' | 'large'
        gap: 'medium', // 'compact' | 'medium' | 'relaxed'
      },
      animation: {
        enableReveal: true,
        revealStyle: 'stagger',
        hoverEffect: true,
      },
      selectedClients,
    },
  };

  const existingSection = await prisma.pageSection.findFirst({
    where: {
      pageId: homePage.id,
      sectionIdentifier: 'clients-trusted-by',
    },
  });

  if (existingSection) {
    await prisma.pageSection.update({
      where: { id: existingSection.id },
      data: clientsSectionData,
    });
    console.log('✅ Updated Section 7: clients-trusted-by (after OUR METHODOLOGY)');
  } else {
    await prisma.pageSection.create({
      data: clientsSectionData,
    });
    console.log('✅ Created Section 7: clients-trusted-by');
  }

  console.log(`🎉 Clients / Trusted By section successfully placed at order 7 with ${selectedClients.length} clients.`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding clients section:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
