import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VEHICLES_DATA } from "@/data/vehicles";

// ─── GET /api/vehicles ─────────────────────────────────────────────────────────

export async function GET() {
  try {
    const dbVehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Fall back to static data if database is empty
    if (dbVehicles.length === 0) {
      return NextResponse.json({ data: VEHICLES_DATA }, { status: 200 });
    }

    return NextResponse.json({ data: dbVehicles }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/vehicles] Error:", error);

    // Fall back to static data on DB failure so the app stays functional
    return NextResponse.json({ data: VEHICLES_DATA }, { status: 200 });
  }
}
