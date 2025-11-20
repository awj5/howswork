"use server";

import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";

export async function updateAccount(first_name: string, last_name: string, email: string) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Update profile (use Supabase admin because no update policy exists (stops user from changing company))
  const { error: updateProfileError } = await supabaseAdmin
    .from("profiles")
    .update({
      first_name,
      last_name,
      email,
    })
    .eq("user_id", authData.user.id);

  if (updateProfileError) return { error: updateProfileError.message };

  // Update auth email if changed
  if (email !== authData.user.email) {
    const { error: updateAuthUserError } = await supabase.auth.updateUser({
      email,
    });

    if (updateAuthUserError) return { error: updateAuthUserError.message };
    return { emailChanged: true };
  }

  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Delete (user Supabase admin)
  const { error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
  if (deleteAuthUserError) return { error: deleteAuthUserError.message };

  return { success: true };
}
