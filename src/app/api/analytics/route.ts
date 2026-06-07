import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const range = new URL(request.url).searchParams.get("range") ?? "30d";
    const now = new Date();
    const since = new Date(now);
    if (range === "7d") since.setDate(since.getDate() - 7);
    else if (range === "30d") since.setDate(since.getDate() - 30);
    else since.setFullYear(2020);

    const [leads, reservations, leadsByVehicle, leadsByType, leadsByDealership] = await Promise.all([
      prisma.lead.findMany({
        where: { createdAt: { gte: since } },
        include: { vehicle: true, dealership: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.reservation.count({ where: { status: "pending" } }),
      prisma.lead.groupBy({
        by: ["vehicleId"],
        where: { createdAt: { gte: since } },
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ["type"],
        where: { createdAt: { gte: since } },
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ["dealershipId"],
        where: { createdAt: { gte: since }, dealershipId: { not: null } },
        _count: true,
      }),
    ]);

    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: leadsByVehicle.map((g) => g.vehicleId) } },
    });
    const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v.name]));

    const dealerships = await prisma.dealership.findMany({
      where: { id: { in: leadsByDealership.map((g) => g.dealershipId!).filter(Boolean) } },
    });
    const dealerMap = Object.fromEntries(dealerships.map((d) => [d.id, d.city]));

    // Daily buckets
    const dailyMap: Record<string, number> = {};
    leads.forEach((l) => {
      const day = l.createdAt.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] ?? 0) + 1;
    });
    const timeline = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const statusCounts = {
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      converted: leads.filter((l) => l.status === "converted").length,
      lost: leads.filter((l) => l.status === "lost").length,
    };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return NextResponse.json({
      data: {
        kpis: {
          totalLeads: leads.length,
          leadsToday: leads.filter((l) => l.createdAt >= todayStart).length,
          pendingReservations: reservations,
          conversionRate:
            leads.length > 0
              ? Math.round((statusCounts.converted / leads.length) * 100)
              : 0,
        },
        timeline,
        leadsByVehicle: leadsByVehicle.map((g) => ({
          name: vehicleMap[g.vehicleId] ?? g.vehicleId,
          count: g._count,
        })),
        leadsByType: leadsByType.map((g) => ({ type: g.type, count: g._count })),
        leadsByDealership: leadsByDealership.map((g) => ({
          city: dealerMap[g.dealershipId!] ?? "—",
          count: g._count,
        })),
        funnel: statusCounts,
        recentLeads: leads.slice(0, 10).map((l) => ({
          id: l.id,
          name: `${l.firstName} ${l.lastName}`,
          email: l.email,
          type: l.type,
          status: l.status,
          vehicle: l.vehicle.name,
          dealership: l.dealership?.city ?? null,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
