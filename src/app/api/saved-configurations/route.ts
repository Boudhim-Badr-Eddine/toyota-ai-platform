import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateSavedConfigSchema = z.object({
  vehicleId: z.string().min(1),
  name: z.string().min(1).max(80),
  configuration: z.record(z.string(), z.unknown()).default({}),
});

export async function GET() {
  try {
    const session = await requireCustomer();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configs = await prisma.savedConfiguration.findMany({
      where: { userId: session.user.id },
      include: {
        vehicle: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: configs });
  } catch (error) {
    console.error("[GET /api/saved-configurations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCustomer();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = CreateSavedConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { vehicleId, name, configuration } = parsed.data;

    const vehicle = await prisma.vehicle.findFirst({
      where: { OR: [{ id: vehicleId }, { slug: vehicleId }] },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const saved = await prisma.savedConfiguration.create({
      data: {
        userId: session.user.id,
        vehicleId: vehicle.id,
        name,
        configuration: configuration as object,
      },
      include: {
        vehicle: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/saved-configurations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
