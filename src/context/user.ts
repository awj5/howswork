import { createContext } from "react";

export type UserType = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export const UserContext = createContext<UserType | null>(null);
