import { createContext } from "react";

export type AdminUser = {
  id: string;
  email?: string;
  companyID?: number;
  companyName?: string;
  superAdmin?: boolean;
};

export const AdminUserContext = createContext<AdminUser | null>(null);
