"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export function useProfile() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const isLoggedIn = status === "authenticated" && !!user;
  const isCustomer = isLoggedIn && user.role === "customer";
  const isAdmin = isLoggedIn && user.role === "admin";

  const profile = useMemo(() => {
    if (!isCustomer || !user) return null;
    return {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      city: user.city ?? "",
      address: user.address ?? "",
    };
  }, [isCustomer, user]);

  return {
    status,
    isLoggedIn,
    isCustomer,
    isAdmin,
    profile,
    user,
  };
}
