"use client";

import { useState } from "react";
import { UserContext, type UserType } from "@/context/user";

export default function AdminUserProvider({ authUser, children }: { authUser: UserType; children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(authUser);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
