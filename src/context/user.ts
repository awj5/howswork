import { createContext, type Dispatch, type SetStateAction } from "react";
import type { UserType } from "@/types";

export type UserContextValue = {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
};

export const UserContext = createContext<UserContextValue | null>(null);
