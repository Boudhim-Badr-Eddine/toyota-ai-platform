"use client";

import dynamic from "next/dynamic";

const DebugPanel = dynamic(
  () => import("@/components/dev/DebugPanel").then((m) => m.DebugPanel),
  { ssr: false }
);

export function DebugPanelLoader() {
  return <DebugPanel />;
}
