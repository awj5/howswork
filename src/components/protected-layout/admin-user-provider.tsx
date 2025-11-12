"use client";

import { useMemo } from "react";
import { UserContext, type UserType } from "@/context/user";

export default function AdminUserProvider({ user, children }: { user: UserType; children: React.ReactNode }) {
  const value = useMemo(() => user, [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
