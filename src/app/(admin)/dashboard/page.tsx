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

  const [totalLeads, newLeadsToday, newLeadsMonth, totalReservations, pendingReservations, leadsByVehicle, recentLeads] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "pending" } }),
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

  return {
    stats: {
      totalLeads,
      newLeadsToday,
      newLeadsMonth,
      totalReservations,
      pendingReservations,
      conversionRate,
      topVehicle,
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
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const data = await fetchDashboardData();

  return <DashboardClient data={data} adminName={session.user?.name ?? "Admin"} />;
}
