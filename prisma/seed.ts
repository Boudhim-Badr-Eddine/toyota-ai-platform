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

  // ─── Seed Dealerships ────────────────────────────────────────────────────────
  console.log("🏢 Seeding dealerships...");
  const { DEALERSHIPS } = await import("../src/data/dealerships");

  for (const d of DEALERSHIPS) {
    const record = await prisma.dealership.upsert({
      where: { slug: d.id },
      update: {
        name: d.name,
        city: d.city,
        address: d.address,
        phone: d.phone,
        email: d.email,
        lat: d.lat,
        lng: d.lng,
        hours: d.hours as object,
        services: d.services as object,
      },
      create: {
        slug: d.id,
        name: d.name,
        city: d.city,
        address: d.address,
        phone: d.phone,
        email: d.email,
        lat: d.lat,
        lng: d.lng,
        hours: d.hours as object,
        services: d.services as object,
      },
    });
    console.log(`  ✅ ${record.name}`);
  }
  console.log(`\n✔  ${DEALERSHIPS.length} dealerships seeded.\n`);

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
  console.log("\n👤 Seeding demo customer...");

  const customerEmail = "client@toyota-ma.com";
  const customerPassword = "Client@2024!";
  const customerHash = await bcrypt.hash(customerPassword, 12);

  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      firstName: "Karim",
      lastName: "Benali",
      password: customerHash,
      phone: "+212 612 345 678",
      city: "Casablanca",
      address: "45, Bd Mohammed V",
    },
    create: {
      email: customerEmail,
      password: customerHash,
      firstName: "Karim",
      lastName: "Benali",
      phone: "+212 612 345 678",
      city: "Casablanca",
      address: "45, Bd Mohammed V",
    },
  });

  console.log(`  ✅ Customer created: ${customer.email}`);
  console.log(`  ℹ  Default password: ${customerPassword}`);
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
