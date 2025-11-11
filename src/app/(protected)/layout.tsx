import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { AdminUser } from "@/context/admin-user";
import AdminUserProvider from "@/components/protected-layout/admin-user-provider";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get auth user
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/login");

  const user: AdminUser = {
    id: data.user.id,
    email: data.user.email,
  };

  return <AdminUserProvider user={user}>{children}</AdminUserProvider>;
}
