import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "admin" | "customer";
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: "admin" | "customer";
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      city?: string | null;
      address?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "customer";
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  }
}
