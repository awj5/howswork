"use client";

import { useState } from "react";
import type { UserType } from "@/types";
import { UserContext } from "@/context/user";

export default function UserProvider({ authUser, children }: { authUser: UserType; children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(authUser);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
