import { Suspense } from "react";
import ClientLoginPage from "./ClientLoginPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-toyota-dark pt-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-toyota-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClientLoginPage />
    </Suspense>
  );
}
