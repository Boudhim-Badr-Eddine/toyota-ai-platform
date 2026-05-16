import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// Use relative path — avoids needing tsconfig-paths at seed time
import { VEHICLES_DATA } from "../src/data/vehicles";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ─── Seed Vehicles ───────────────────────────────────────────────────────────
  console.log("🚗 Seeding vehicles...");

  for (const vehicle of VEHICLES_DATA) {
    const vehicleData = {
      name: vehicle.name,
      category: vehicle.category,
      description: vehicle.description,
      priceFrom: vehicle.priceFrom,
      model3dPath: vehicle.model3dPath,
      colors: vehicle.colors as unknown as object[],
      wheels: vehicle.wheels as unknown as object[],
      interiors: vehicle.interiors as unknown as object[],
      specs: vehicle.specs as unknown as object,
    };
    const record = await prisma.vehicle.upsert({
      where: { slug: vehicle.id },
      update: vehicleData,
      create: { slug: vehicle.id, ...vehicleData },
    });
    console.log(`  ✅ ${record.name} (${record.slug})`);
  }

  console.log(`\n✔  ${VEHICLES_DATA.length} vehicles seeded.\n`);

  // ─── Seed Default Admin ──────────────────────────────────────────────────────
  console.log("👤 Seeding admin user...");

  const adminEmail = "admin@toyota-ma.com";
  const plainPassword = "Admin@2024!";
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: "Toyota Admin",
      password: hashedPassword,
      role: "admin",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Toyota Admin",
      role: "admin",
    },
  });

  console.log(`  ✅ Admin created: ${admin.email}`);
  console.log(`  ℹ  Default password: ${plainPassword}`);
  console.log("\n🎉 Database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
