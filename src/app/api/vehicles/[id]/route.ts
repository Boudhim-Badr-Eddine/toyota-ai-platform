import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVehicleById } from "@/data/vehicles";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/vehicles/[id] ────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Try DB first (look up by slug which equals the vehicle's string ID)
    const dbVehicle = await prisma.vehicle.findUnique({
      where: { slug: id },
    });

    if (dbVehicle) {
      return NextResponse.json({ data: dbVehicle }, { status: 200 });
    }

    // Fall back to static data
    const staticVehicle = getVehicleById(id);
    if (staticVehicle) {
      return NextResponse.json({ data: staticVehicle }, { status: 200 });
    }

    return NextResponse.json(
      { error: `Vehicle with id "${id}" not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error(`[GET /api/vehicles/${id}] Error:`, error);

    // Fall back to static on DB error
    const staticVehicle = getVehicleById(id);
    if (staticVehicle) {
      return NextResponse.json({ data: staticVehicle }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
