const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany({
    select: { id: true, title: true, slug: true, status: true, _count: { select: { sections: true } } },
  });
  console.log('All Pages in DB:', pages);

  const home = await prisma.page.findFirst({
    where: { slug: 'home' },
    include: { sections: { orderBy: { displayOrder: 'asc' } } },
  });
  console.log('\nHome Page Details:', {
    id: home?.id,
    title: home?.title,
    slug: home?.slug,
    status: home?.status,
    sectionsCount: home?.sections?.length,
  });

  console.log('\nHome Sections:');
  home?.sections?.forEach((s) => {
    console.log({
      id: s.id,
      order: s.displayOrder,
      type: s.componentType,
      ident: s.sectionIdentifier,
      active: s.isActive,
      hasPayload: Boolean(s.contentPayload),
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
