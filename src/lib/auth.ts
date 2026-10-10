import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/** Used when DATABASE_URL is unreachable (local dev without Supabase). */
const DEV_ACCOUNTS = [
  {
    email: "admin@toyota-ma.com",
    password: "Admin@2024!",
    role: "admin" as const,
    name: "Toyota Admin",
  },
  {
    email: "client@toyota-ma.com",
    password: "Client@2024!",
    role: "customer" as const,
    name: "Karim Benali",
    firstName: "Karim",
    lastName: "Benali",
    phone: "+212 612 345 678",
    city: "Casablanca",
    address: "45, Bd Mohammed V",
  },
];

function devAuthFallback(email: string, password: string) {
  const allow =
    process.env.NODE_ENV === "development" || process.env.AUTH_DEV_FALLBACK === "true";
  if (!allow) return null;

  const account = DEV_ACCOUNTS.find((a) => a.email === email && a.password === password);
  if (!account) return null;

  if (account.role === "admin") {
    return {
      id: "dev-admin",
      email: account.email,
      name: account.name,
      role: "admin" as const,
    };
  }

  return {
    id: "dev-customer",
    email: account.email,
    name: account.name,
    role: "customer" as const,
    firstName: account.firstName!,
    lastName: account.lastName!,
    phone: account.phone!,
    city: account.city!,
    address: account.address!,
  };
}

const authSecret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "development"
    ? "toyota-ai-dev-secret-do-not-use-in-production"
    : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        try {
          const { prisma } = await import("@/lib/prisma");
          const customer = await prisma.user.findUnique({ where: { email } });
          if (customer) {
            const valid = await bcrypt.compare(password, customer.password);
            if (!valid) return null;
            return {
              id: customer.id,
              email: customer.email,
              name: `${customer.firstName} ${customer.lastName}`,
              role: "customer" as const,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              city: customer.city,
              address: customer.address,
            };
          }

          const admin = await prisma.admin.findUnique({ where: { email } });
          if (!admin) return null;

          const valid = await bcrypt.compare(password, admin.password);
          if (!valid) return null;

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: "admin" as const,
          };
        } catch (error) {
          console.error("[auth] authorize failed:", error);
          return devAuthFallback(email, password);
        }
      },
    }),
  ],
  pages: { signIn: "/compte/connexion" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.city = user.city;
        token.address = user.address;
      }
      if (trigger === "update" && session) {
        const s = session as {
          firstName?: string;
          lastName?: string;
          phone?: string | null;
          city?: string | null;
          address?: string | null;
          name?: string;
        };
        if (s.firstName !== undefined) token.firstName = s.firstName;
        if (s.lastName !== undefined) token.lastName = s.lastName;
        if (s.phone !== undefined) token.phone = s.phone;
        if (s.city !== undefined) token.city = s.city;
        if (s.address !== undefined) token.address = s.address;
        if (s.firstName && s.lastName) token.name = `${s.firstName} ${s.lastName}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
        session.user.city = token.city;
        session.user.address = token.address;
      }
      return session;
    },
  },
});

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function requireCustomer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "customer") {
    return null;
  }
  return session;
}
