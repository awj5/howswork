import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { UserType } from "@/context/user";
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

    // Get user from profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", authData.user.id)
      .single();

    if (profilesError) throw profilesError;

    // Pass to context provider
    const authUser: UserType = {
      id: authData.user.id,
      email: authData.user.email as string,
      firstName: profilesData.first_name,
      lastName: profilesData.last_name,
    };

    return (
      <AdminUserProvider authUser={authUser}>
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
