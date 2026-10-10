"use client";

import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";

interface ProvidersProps {
  children: React.ReactNode;
}

// ─── Root providers wrapper ────────────────────────────────────────────────────
// Wraps the entire application with all React context providers.
// Add new providers here as the app grows.

export function Providers({ children }: ProvidersProps) {
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>{children}</SessionProvider>
    </MotionConfig>
  );
}
