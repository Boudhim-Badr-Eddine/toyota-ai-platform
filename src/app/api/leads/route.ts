import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyAdminLeadConfirmed } from "@/lib/adminNotifications";
import { auth, requireAdmin } from "@/lib/auth";

// ─── Validation schema ─────────────────────────────────────────────────────────

const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.union([z.string(), z.date()]),
});

const ConfigurationSchema = z.object({
  vehicleId: z.string().optional(),
  selectedColor: z
    .object({ id: z.string(), name: z.string(), hex: z.string(), type: z.string() })
    .nullable()
    .optional(),
  selectedWheel: z
    .object({ id: z.string(), name: z.string(), size: z.string() })
    .nullable()
    .optional(),
  selectedInterior: z
    .object({ id: z.string(), name: z.string(), material: z.string(), colorHex: z.string() })
    .nullable()
    .optional(),
}).passthrough();

const CreateLeadSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(50),
  lastName: z.string().min(1, "Le nom est requis").max(50),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^[+\d\s\-()]{7,20}$/, "Numéro de téléphone invalide").optional().or(z.literal("")),
  vehicleId: z.string().min(1, "L'ID du véhicule est requis"),
  dealershipId: z.string().optional(),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
  configuration: ConfigurationSchema.optional().default({}),
  chatHistory: z.array(ChatMessageSchema).optional().default([]),
  type: z.enum(["test_drive", "quote", "purchase"]),
});

// ─── POST /api/leads ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { rateLimit, clientIp } = await import("@/lib/rateLimit");
    if (!rateLimit(`leads:${clientIp(request)}`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body: unknown = await request.json();

    const parsed = CreateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { firstName, lastName, email, phone, vehicleId, dealershipId, userLat, userLng, configuration, chatHistory, type } =
      parsed.data;

    // Resolve vehicleId: accept either the string slug or the DB cuid
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [{ id: vehicleId }, { slug: vehicleId }],
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: `Vehicle "${vehicleId}" not found` },
        { status: 404 }
      );
    }

    let resolvedDealershipId: string | null = null;
    if (dealershipId) {
      const dealership = await prisma.dealership.findFirst({
        where: { OR: [{ id: dealershipId }, { slug: dealershipId }] },
      });
      if (dealership) resolvedDealershipId = dealership.id;
    }

    const session = await auth();
    let userId: string | null = null;

    if (session?.user?.role === "customer") {
      userId = session.user.id;
    }

    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone ?? null,
        vehicleId: vehicle.id,
        userId,
        dealershipId: resolvedDealershipId,
        userLat: userLat ?? null,
        userLng: userLng ?? null,
        configuration: configuration as object,
        chatHistory: chatHistory as object[],
        type,
        status: "new",
      },
      include: {
        vehicle: true,
        dealership: true,
      },
    });

    void notifyAdminLeadConfirmed(lead).catch((err) =>
      console.error("[POST /api/leads] Admin email failed:", err)
    );

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/leads] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET /api/leads (admin-protected) ─────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where = {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { vehicle: true, dealership: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: leads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/leads] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/leads (admin-protected) ───────────────────────────────────────

const UpdateLeadSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["new", "contacted", "converted", "lost"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = UpdateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("[PATCH /api/leads] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
