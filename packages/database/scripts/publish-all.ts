import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { PrismaClient, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function publishAll() {
  console.log('Publishing all content across the database...');

  try {
    // 1. Clients
    const clientsResult = await prisma.client.updateMany({
      data: { isFeatured: true },
    });
    console.log(`Clients published: ${clientsResult.count}`);

    // 2. Partners
    const partnersResult = await prisma.partner.updateMany({
      data: { status: ContentStatus.PUBLISHED, showOnHomepage: true },
    });
    console.log(`Partners published: ${partnersResult.count}`);

    // 3. Team Members
    const teamResult = await prisma.teamMember.updateMany({
      data: { isActive: true },
    });
    console.log(`Team members activated: ${teamResult.count}`);

    // 4. Services
    const servicesResult = await prisma.service.updateMany({
      where: { deletedAt: null },
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Services published: ${servicesResult.count}`);

    // 5. Solutions
    const solutionsResult = await prisma.solution.updateMany({
      where: { deletedAt: null },
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Solutions published: ${solutionsResult.count}`);

    // 6. Case Studies
    const caseStudiesResult = await prisma.caseStudy.updateMany({
      where: { deletedAt: null },
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Case studies published: ${caseStudiesResult.count}`);

    // 7. Projects
    const projectsResult = await prisma.project.updateMany({
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Projects published: ${projectsResult.count}`);

    // 8. Portfolio Categories
    const portCatResult = await (prisma as any).portfolioCategory.updateMany({
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Portfolio categories published: ${portCatResult.count}`);

    // 9. Portfolio Project Items
    const portProjResult = await (prisma as any).portfolioProjectItem.updateMany({
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Portfolio project items published: ${portProjResult.count}`);

    // 10. Testimonials
    const testResult = await prisma.testimonial.updateMany({
      data: { isFeatured: true },
    });
    console.log(`Testimonials marked featured: ${testResult.count}`);

    // 11. FAQs
    const faqsResult = await prisma.faq.updateMany({
      data: { isActive: true },
    });
    console.log(`FAQs activated: ${faqsResult.count}`);

    // 12. Blog Posts
    const blogResult = await prisma.blogPost.updateMany({
      where: { deletedAt: null },
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Blog posts published: ${blogResult.count}`);

    // 13. Pages
    const pagesResult = await prisma.page.updateMany({
      where: { deletedAt: null },
      data: { status: ContentStatus.PUBLISHED },
    });
    console.log(`Pages published: ${pagesResult.count}`);

    // 14. Page Sections
    const sectionsResult = await prisma.pageSection.updateMany({
      data: { isActive: true },
    });
    console.log(`Page sections activated: ${sectionsResult.count}`);

    console.log('All content has been successfully set to PUBLISHED / ACTIVE in the database!');
  } catch (error) {
    console.error('Error publishing content:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

publishAll();
