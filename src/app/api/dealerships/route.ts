import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEALERSHIPS } from "@/data/dealerships";

export async function GET() {
  try {
    const dealers = await prisma.dealership.findMany({
      orderBy: { city: "asc" },
    });

    if (dealers.length > 0) {
      return NextResponse.json({
        data: dealers.map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          city: d.city,
          address: d.address,
          phone: d.phone,
          email: d.email,
          lat: d.lat,
          lng: d.lng,
          hours: d.hours,
          services: d.services,
        })),
        source: "database",
      });
    }
  } catch (error) {
    console.warn("[GET /api/dealerships] Prisma fallback to static data:", error);
  }

  return NextResponse.json({ data: DEALERSHIPS, source: "static" });
}
