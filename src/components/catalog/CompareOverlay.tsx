"use client";

import { CompareDrawer, CompareBar } from "@/components/catalog/CompareDrawer";

/** Global compare UI — mounted in root layout so chat compare works on every page (incl. homepage). */
export function CompareOverlay() {
  return (
    <>
      <CompareDrawer />
      <CompareBar />
    </>
  );
}
