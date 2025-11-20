import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { UserType } from "@/types";
import AdminUserProvider from "@/components/protected-layout/admin-user-provider";
import { SidebarLayout } from "@/components/sidebar-layout";
import Nav from "@/components/protected-layout/Nav";
import Header from "@/components/protected-layout/Header";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // Get user from profiles
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", authData.user.id)
    .single();

  if (profileError) throw profileError;

  // Pass to context provider
  const authUser: UserType = {
    user_id: authData.user.id,
    email: authData.user.email as string,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
  };

  return (
    <AdminUserProvider authUser={authUser}>
      <SidebarLayout sidebar={<Nav />} navbar={<Header />}>
        {children}
      </SidebarLayout>
    </AdminUserProvider>
  );
}
