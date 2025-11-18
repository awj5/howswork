"use server";

import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";

export async function updateAccount(formData: { firstName: string; lastName: string; email: string }) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Update profile
  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({
      first_name: formData.firstName,
      last_name: formData.lastName,
    })
    .eq("user_id", authData.user.id);

  if (updateProfileError) return { error: updateProfileError.message };

  // Update email if changed
  if (formData.email !== authData.user.email) {
    const { error: updateAuthUserError } = await supabase.auth.updateUser({
      email: formData.email,
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

  // Delete
  const { error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
  if (deleteAuthUserError) return { error: deleteAuthUserError.message };

  return { success: true };
}
