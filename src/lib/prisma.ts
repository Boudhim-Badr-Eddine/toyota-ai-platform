import { PrismaClient } from "@prisma/client";

// ─── Prisma Singleton ──────────────────────────────────────────────────────────
// Prevents multiple PrismaClient instances during Next.js hot reloads in dev.
// Re-creates the client if the schema changed (e.g. new User model) while dev
// server is still running — otherwise prisma.user stays undefined and auth fails.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;

  // Stale singleton after `prisma generate` + schema changes in dev
  if (existing && typeof (existing as PrismaClient & { user?: unknown }).user === "undefined") {
    void existing.$disconnect().catch(() => undefined);
    const fresh = createPrismaClient();
    globalForPrisma.prisma = fresh;
    return fresh;
  }

  if (existing) return existing;

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

const prisma = getPrismaClient();

export { prisma };
export default prisma;
