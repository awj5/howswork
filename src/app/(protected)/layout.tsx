import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { AdminUser } from "@/context/admin-user";
import AdminUserProvider from "@/components/protected-layout/admin-user-provider";
import { SidebarLayout } from "@/components/sidebar-layout";
import Nav from "@/components/protected-layout/Nav";
import Header from "@/components/protected-layout/Header";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const supabase = await createClient();

    // Get auth user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw new Error("Unauthenticated");

    // Get user from users table
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("email, company_id, uuid, first_name, last_name")
      .eq("admin_uuid", authData.user.id)
      .single();

    if (usersError) throw usersError;

    // Pass to context provider
    const user: AdminUser = {
      id: authData.user.id,
      email: usersData.email,
      uuid: usersData.uuid,
      companyID: usersData.company_id,
      superAdmin: usersData.company_id === 3,
      firstName: usersData.first_name ?? undefined,
      lastName: usersData.last_name ?? undefined,
    };

    return (
      <AdminUserProvider user={user}>
        <SidebarLayout sidebar={<Nav />} navbar={<Header />}>
          {children}
        </SidebarLayout>
      </AdminUserProvider>
    );
  } catch (error) {
    console.error(error);
    redirect("/login");
  }
}
