"use client";

import { useMemo } from "react";
import { AdminUserContext, type AdminUser } from "@/context/admin-user";

export default function AdminUserProvider({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const value = useMemo(() => user, [user]);

  return <AdminUserContext.Provider value={value}>{children}</AdminUserContext.Provider>;
}
