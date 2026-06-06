import { PrismaClient } from "@prisma/client";

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

export function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;

  if (existing && typeof (existing as PrismaClient & { user?: unknown }).user === "undefined") {
    void existing.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

let lazyPrisma: PrismaClient | undefined;

function prismaClient(): PrismaClient {
  if (!lazyPrisma) lazyPrisma = getPrismaClient();
  return lazyPrisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = prismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export default prisma;
