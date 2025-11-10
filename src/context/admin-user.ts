import { createContext } from "react";

export type AdminUser = {
  id: string; // Auth user UUID
  email?: string; // Auth user email
  companyID?: number;
  companyName?: string;
  superAdmin?: boolean;
};

export const AdminUserContext = createContext<AdminUser | null>(null);
