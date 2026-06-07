import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureVehicle } from "@/lib/catalogSync";
import { prisma } from "@/lib/prisma";
import { notifyAdminReservationConfirmed } from "@/lib/adminNotifications";
import { requireAdmin } from "@/lib/auth";

// ─── Validation schemas ────────────────────────────────────────────────────────

const CreateReservationSchema = z.object({
  leadId: z.string().min(1, "leadId est requis"),
  vehicleId: z.string().min(1, "vehicleId est requis"),
  date: z.string().datetime({ message: "date must be an ISO 8601 datetime string" }),
  type: z.enum(["test_drive", "visit"]),
  notes: z.string().max(500).optional(),
});

const UpdateReservationSchema = z.object({
  id: z.string().min(1, "id est requis"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  notes: z.string().max(500).optional(),
});

// ─── POST /api/reservations ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const parsed = CreateReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { leadId, vehicleId, date, type, notes } = parsed.data;

    // Verify lead exists
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json(
        { error: `Lead "${leadId}" not found` },
        { status: 404 }
      );
    }

    // Verify lead doesn't already have a reservation
    const existing = await prisma.reservation.findUnique({ where: { leadId } });
    if (existing) {
      return NextResponse.json(
        { error: "A reservation already exists for this lead" },
        { status: 409 }
      );
    }

    // Resolve vehicleId (slug or cuid); auto-sync from catalog if missing
    const vehicle = await ensureVehicle(vehicleId);

    if (!vehicle) {
      return NextResponse.json(
        { error: `Vehicle "${vehicleId}" not found` },
        { status: 404 }
      );
    }

    // Ensure date is in the future (5 min buffer for same-day slots)
    const reservationDate = new Date(date);
    const minDate = new Date(Date.now() + 5 * 60 * 1000);
    if (reservationDate <= minDate) {
      return NextResponse.json(
        { error: "Choisissez une date et une heure dans le futur" },
        { status: 422 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        leadId,
        vehicleId: vehicle.id,
        date: reservationDate,
        type,
        notes: notes ?? null,
        status: "pending",
      },
      include: {
        vehicle: true,
        lead: {
          include: {
            vehicle: true,
            dealership: true,
          },
        },
      },
    });

    // Update lead status to "contacted" now that a reservation exists
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "contacted" },
    });

    void notifyAdminReservationConfirmed(reservation).catch((err) =>
      console.error("[POST /api/reservations] Admin email failed:", err)
    );

    return NextResponse.json({ data: reservation }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reservations] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET /api/reservations (admin-protected) ───────────────────────────────────

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

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          vehicle: true,
          lead: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reservation.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: reservations,
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
    console.error("[GET /api/reservations] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/reservations — update status ──────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();

    const parsed = UpdateReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { id, status, notes } = parsed.data;

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: `Reservation "${id}" not found` },
        { status: 404 }
      );
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        vehicle: true,
        lead: true,
      },
    });

    // Mirror status changes to the linked lead
    if (status === "confirmed" || status === "completed") {
      await prisma.lead.update({
        where: { id: existing.leadId },
        data: {
          status: status === "completed" ? "converted" : "contacted",
        },
      });
    } else if (status === "cancelled") {
      await prisma.lead.update({
        where: { id: existing.leadId },
        data: { status: "lost" },
      });
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/reservations] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
