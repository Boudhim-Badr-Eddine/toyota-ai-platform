import { NextRequest, NextResponse } from "next/server";
import { DEALERSHIPS } from "@/data/dealerships";
import { sortByDistance } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const limit = Math.min(10, Math.max(1, parseInt(searchParams.get("limit") ?? "3", 10)));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng query params required" },
      { status: 400 }
    );
  }

  const sorted = sortByDistance(DEALERSHIPS, { lat, lng }).slice(0, limit);

  return NextResponse.json({
    data: sorted.map(({ item, distanceKm }) => ({
      ...item,
      distanceKm: Math.round(distanceKm * 10) / 10,
    })),
  });
}
