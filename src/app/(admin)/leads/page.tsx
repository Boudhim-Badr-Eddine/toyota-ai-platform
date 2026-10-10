import { Suspense } from "react";
import { LeadsPageClient } from "./LeadsPageClient";

export const metadata = { title: "Leads — Toyota Admin" };

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-toyota-red border-t-transparent" />
        </div>
      }
    >
      <LeadsPageClient />
    </Suspense>
  );
}
