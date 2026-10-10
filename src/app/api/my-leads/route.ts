import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireCustomer();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      where: { userId: session.user.id },
      include: {
        vehicle: { select: { id: true, name: true, slug: true } },
        dealership: { select: { id: true, name: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error("[GET /api/my-leads]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
