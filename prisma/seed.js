const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = 'admin@toyota-ma.com';
  const plainPassword = 'Admin@2024!';
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Toyota Admin',
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Toyota Admin',
      role: 'admin',
    },
  });

  console.log('  ✅ Admin created: ' + admin.email);
  console.log('  ℹ  Default password: ' + plainPassword);
  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
