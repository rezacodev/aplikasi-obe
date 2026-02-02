import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

console.log('Testing database connection...');
console.log('DATABASE_URL:', connectionString ? 'Set' : 'Not set');

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test if tables exist
    const userCount = await prisma.user.count();
    console.log('✅ Users table exists, count:', userCount);

    const roleCount = await prisma.role.count();
    console.log('✅ Roles table exists, count:', roleCount);

    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@obe.com' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('   Email:', adminUser.email);
      console.log('   Active:', adminUser.isActive);
      console.log('   Roles:', adminUser.roles.map(ur => ur.role.name).join(', '));
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();