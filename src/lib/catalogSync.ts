import { prisma } from "@/lib/prisma";
import { VEHICLES_DATA } from "@/data/vehicles";
import { DEALERSHIPS } from "@/data/dealerships";
import type { Vehicle, Dealership } from "@prisma/client";

function vehiclePayload(v: (typeof VEHICLES_DATA)[number]) {
  return {
    name: v.name,
    category: v.category,
    description: v.description,
    priceFrom: v.priceFrom,
    model3dPath: v.model3dPath,
    colors: v.colors as unknown as object[],
    wheels: v.wheels as unknown as object[],
    interiors: v.interiors as unknown as object[],
    specs: v.specs as unknown as object,
  };
}

/** Ensure catalog vehicle exists in DB (auto-seed from static data). */
export async function ensureVehicle(slugOrId: string): Promise<Vehicle | null> {
  const existing = await prisma.vehicle.findFirst({
    where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
  });
  if (existing) return existing;

  const staticVehicle = VEHICLES_DATA.find((v) => v.id === slugOrId);
  if (!staticVehicle) return null;

  return prisma.vehicle.upsert({
    where: { slug: staticVehicle.id },
    update: vehiclePayload(staticVehicle),
    create: { slug: staticVehicle.id, ...vehiclePayload(staticVehicle) },
  });
}

/** Ensure dealership exists in DB (auto-seed from static data). */
export async function ensureDealership(slugOrId: string): Promise<Dealership | null> {
  const existing = await prisma.dealership.findFirst({
    where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
  });
  if (existing) return existing;

  const staticDealer = DEALERSHIPS.find((d) => d.id === slugOrId);
  if (!staticDealer) return null;

  return prisma.dealership.upsert({
    where: { slug: staticDealer.id },
    update: {
      name: staticDealer.name,
      city: staticDealer.city,
      address: staticDealer.address,
      phone: staticDealer.phone,
      email: staticDealer.email,
      lat: staticDealer.lat,
      lng: staticDealer.lng,
      hours: staticDealer.hours as object,
      services: staticDealer.services as object,
    },
    create: {
      slug: staticDealer.id,
      name: staticDealer.name,
      city: staticDealer.city,
      address: staticDealer.address,
      phone: staticDealer.phone,
      email: staticDealer.email,
      lat: staticDealer.lat,
      lng: staticDealer.lng,
      hours: staticDealer.hours as object,
      services: staticDealer.services as object,
    },
  });
}
