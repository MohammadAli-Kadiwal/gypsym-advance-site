import { PrismaClient, ComponentType } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Sections 3 and 4 for Home page...');

  const homePage = await prisma.page.findFirst({
    where: { slug: 'home' },
  });

  if (!homePage) {
    console.error('❌ Home page not found!');
    return;
  }

  // Section 3: CRO Revenue Experiment
  const section3Data = {
    pageId: homePage.id,
    sectionIdentifier: 'cro-revenue-experiment',
    componentType: ComponentType.CTA_STRIP,
    displayOrder: 3,
    isActive: true,
    contentPayload: {
      eyebrow: 'CRO REVENUE EXPERIMENT',
      headline: 'Test what makes money, not what looks nice',
      description:
        'Every month we ship experiments against a single number — revenue per session. Winners stay, losers get reverted, and you see both.',
      ctaText: 'Start a CRO audit',
      ctaUrl: '#audit',
      experimentTag: 'Experiment 14 · PDP bundle block',
      winnerBadge: 'WINNER',
      metricTitle: 'Revenue per session',
      controlLabel: 'Control',
      controlValue: '$1.94',
      controlSubtext: 'rev / session',
      variantLabel: 'Variant B',
      variantValue: '$2.61',
      variantSubtext: '+34.5% · 97% conf.',
      bars: [25, 38, 55, 70, 85, 100],
    },
  };

  const existingSec3 = await prisma.pageSection.findFirst({
    where: { pageId: homePage.id, sectionIdentifier: 'cro-revenue-experiment' },
  });

  if (existingSec3) {
    await prisma.pageSection.update({
      where: { id: existingSec3.id },
      data: section3Data,
    });
    console.log('✅ Updated Section 3: cro-revenue-experiment');
  } else {
    await prisma.pageSection.create({
      data: section3Data,
    });
    console.log('✅ Created Section 3: cro-revenue-experiment');
  }

  // Section 4: What We Actually Change
  const section4Data = {
    pageId: homePage.id,
    sectionIdentifier: 'what-we-actually-change',
    componentType: ComponentType.FEATURE_GRID,
    displayOrder: 4,
    isActive: true,
    contentPayload: {
      eyebrow: 'WHAT WE ACTUALLY CHANGE',
      title: 'Give shoppers fewer reasons to leave',
      description:
        'Every store we touch gets the same three things fixed first — the ones that move revenue before any new traffic is bought.',
      cards: [
        {
          id: 'card-1',
          type: 'cart',
          title: 'Fewer steps to buy',
          description:
            'We strip the friction between product page and paid order — variants, upsells, and checkout included.',
          cartLabel: 'Cart',
          cartStep: '1 step',
          checkoutButtonText: 'Checkout · $89.00',
        },
        {
          id: 'card-2',
          type: 'speed',
          title: 'Fast on real phones',
          description:
            "Tested on mid-range devices and slow networks, not on a developer's laptop. Core Web Vitals pass before launch.",
          metrics: [
            { label: 'LCP', value: '0.9s', percent: 75 },
            { label: 'CLS', value: '0.02', percent: 88 },
          ],
        },
        {
          id: 'card-3',
          type: 'theme',
          title: 'Yours to run after',
          description:
            'Clean Liquid and native theme sections, so your team edits the store without opening a ticket.',
          items: [
            { title: 'Hero section', badge: 'Editable' },
            { title: 'Bundle block', badge: 'Editable' },
            { title: 'Reviews', badge: 'Editable' },
          ],
        },
      ],
    },
  };

  const existingSec4 = await prisma.pageSection.findFirst({
    where: { pageId: homePage.id, sectionIdentifier: 'what-we-actually-change' },
  });

  if (existingSec4) {
    await prisma.pageSection.update({
      where: { id: existingSec4.id },
      data: section4Data,
    });
    console.log('✅ Updated Section 4: what-we-actually-change');
  } else {
    await prisma.pageSection.create({
      data: section4Data,
    });
    console.log('✅ Created Section 4: what-we-actually-change');
  }

  console.log('🎉 Sections 3 and 4 successfully populated in database.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
