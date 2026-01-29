import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { UserType } from "@/types";
import UserProvider from "@/components/protected-layout/UserProvider";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import Nav from "@/components/protected-layout/Nav";
import Header from "@/components/protected-layout/Header";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  // Get profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", authData.user.id)
    .single();

  if (profileError) redirect("/error");

  // Pass to context provider
  const user: UserType = {
    user_id: authData.user.id,
    email: authData.user.email as string,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
  };

  return (
    <UserProvider authUser={user}>
      <SidebarLayout sidebar={<Nav />} navbar={<Header />}>
        {children}
      </SidebarLayout>
    </UserProvider>
  );
}
