import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@obe.com' } });
  console.log('user:', user ? { id: user.id, email: user.email, isActive: user.isActive, password: user.password } : null);
  if (!user) {
    console.log('No user found');
    return;
  }
  const ok = await bcrypt.compare('password123', user.password!);
  console.log('bcrypt compare result:', ok);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
