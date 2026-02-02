import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function checkAdminUser() {
  console.log('🔍 Checking admin user...');

  try {
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@obe.com' },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        profile: true
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   Email:', adminUser.email);
    console.log('   Active:', adminUser.isActive);
    console.log('   Roles:', adminUser.roles.map(ur => ur.role.name).join(', '));
    console.log('   Profile:', adminUser.profile ? 'Exists' : 'Not found');

    // Check if admin role exists
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!adminRole) {
      console.log('❌ Admin role not found!');
      return;
    }

    console.log('✅ Admin role found with permissions:');
    console.log('   Permissions:', adminRole.permissions.map(rp => rp.permission.name).join(', '));

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();