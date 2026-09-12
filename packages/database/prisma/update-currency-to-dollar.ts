import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

function replaceEuro(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/€/g, '$');
  }
  if (Array.isArray(obj)) {
    return obj.map(replaceEuro);
  }
  if (obj !== null && typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      res[key] = replaceEuro(obj[key]);
    }
    return res;
  }
  return obj;
}

async function main() {
  console.log('🔄 Updating all currency references from € to $ in database...');

  const sections = await prisma.pageSection.findMany();

  for (const s of sections) {
    const rawPayload = JSON.stringify(s.contentPayload);
    if (rawPayload.includes('€')) {
      const updatedPayload = replaceEuro(s.contentPayload);
      await prisma.pageSection.update({
        where: { id: s.id },
        data: {
          contentPayload: updatedPayload,
        },
      });
      console.log(`✅ Updated Section: ${s.sectionIdentifier} (${s.id})`);
    }
  }

  console.log('🎉 All section currency symbols successfully updated to $.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
