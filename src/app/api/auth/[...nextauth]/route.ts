import { handlers } from "@/lib/auth";

// NextAuth v5 — re-export HTTP handlers for the catch-all route
export const { GET, POST } = handlers;
