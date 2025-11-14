import { createContext, type Dispatch, type SetStateAction } from "react";

export type UserType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type UserContextValue = {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
};

export const UserContext = createContext<UserContextValue | null>(null);
