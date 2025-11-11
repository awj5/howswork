import { createContext } from "react";

export type AdminUser = {
  id: string; // Auth user UUID
  email: string;
  uuid: string;
  companyID: number;
  superAdmin: boolean;
  firstName?: string;
  lastName?: string;
};

export const AdminUserContext = createContext<AdminUser | null>(null);
