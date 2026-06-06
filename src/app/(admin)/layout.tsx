"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AdminSidebar />
      <div className="lg:pl-[240px]">
        <Suspense fallback={<div className="h-[88px] border-b border-white/[0.06]" />}>
          <AdminTopBar />
        </Suspense>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
