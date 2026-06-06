import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_PATHS = ["/dashboard", "/leads", "/reservations"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (!isAdminRoute) return NextResponse.next();

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.auth.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/compte", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/reservations/:path*"],
};
