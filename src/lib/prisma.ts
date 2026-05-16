import { PrismaClient } from "@prisma/client";

// ─── Prisma Singleton ──────────────────────────────────────────────────────────
// Prevents multiple PrismaClient instances during Next.js hot reloads in dev.
// In production, a single instance is created and reused.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;
