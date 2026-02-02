import { prisma } from '../lib/prisma';

async function main() {
  const u = await prisma.user.findUnique({ where: { email: 'admin@obe.com' } });
  console.log(u);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
