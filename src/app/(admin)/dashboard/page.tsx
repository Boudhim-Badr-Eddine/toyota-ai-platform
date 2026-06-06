import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

// ─── Dashboard page (Server Component) ────────────────────────────────────────

export const metadata = { title: "Dashboard — Toyota Admin" };
export const dynamic = "force-dynamic";

async function fetchDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [totalLeads, newLeadsToday, newLeadsMonth, previousMonthLeads, totalReservations, pendingReservations, monthReservations, previousMonthReservations, convertedLeads, previousMonthConverted, leadsByVehicle, recentLeads, recentReservations, avgVehiclePrice] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({
        where: { createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
      }),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "pending" } }),
      prisma.reservation.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.reservation.count({
        where: { createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
      }),
      prisma.lead.count({ where: { status: "converted" } }),
      prisma.lead.count({
        where: {
          status: "converted",
          updatedAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
      }),
      prisma.lead.groupBy({
        by: ["vehicleId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { vehicle: { select: { name: true, slug: true } } },
      }),
      prisma.reservation.findMany({
        take: 8,
        orderBy: { date: "desc" },
        include: {
          lead: { select: { firstName: true, lastName: true, email: true } },
          vehicle: { select: { name: true, slug: true, category: true } },
        },
      }),
      prisma.vehicle.aggregate({ _avg: { priceFrom: true } }),
    ]);

  // Resolve vehicle names for the bar chart
  const vehicleIds = leadsByVehicle.map((g) => g.vehicleId);
  const vehicles =
    vehicleIds.length > 0
      ? await prisma.vehicle.findMany({
          where: { id: { in: vehicleIds } },
          select: { id: true, name: true },
        })
      : [];
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v.name]));

  const conversionRate =
    totalLeads > 0
      ? Math.round(
          ((await prisma.lead.count({ where: { status: "converted" } })) / totalLeads) * 100
        )
      : 0;

  const topVehicleGroup = leadsByVehicle[0];
  const topVehicle = topVehicleGroup
    ? (vehicleMap[topVehicleGroup.vehicleId] ?? "—")
    : "—";

  const avgPrice = avgVehiclePrice._avg.priceFrom ?? 450000;
  const estimatedRevenueM =
    Math.round(((totalLeads * avgPrice * (conversionRate / 100)) / 1_000_000) * 10) / 10;

  return {
    stats: {
      totalLeads,
      newLeadsToday,
      newLeadsMonth,
      previousMonthLeads,
      totalReservations,
      pendingReservations,
      monthReservations,
      previousMonthReservations,
      convertedLeads,
      previousMonthConverted,
      conversionRate,
      topVehicle,
      estimatedRevenueM,
    },
    leadsByVehicle: leadsByVehicle.map((g) => ({
      name: vehicleMap[g.vehicleId] ?? g.vehicleId,
      count: g._count.id,
    })),
    recentLeads: recentLeads.map((l) => ({
      id: l.id,
      name: `${l.firstName} ${l.lastName}`,
      email: l.email,
      vehicleName: l.vehicle.name,
      vehicleSlug: l.vehicle.slug,
      type: l.type,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    })),
    recentReservations: recentReservations.map((r) => ({
      id: r.id,
      clientName: `${r.lead.firstName} ${r.lead.lastName}`,
      clientEmail: r.lead.email,
      vehicleName: r.vehicle.name,
      vehicleCategory: r.vehicle.category,
      vehicleSlug: r.vehicle.slug,
      date: r.date.toISOString(),
      status: r.status,
    })),
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") redirect("/login");

  const data = await fetchDashboardData();

  return <DashboardClient data={data} adminName={session.user?.name ?? "Admin"} />;
}
