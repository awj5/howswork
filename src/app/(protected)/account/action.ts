"use server";

import { createClient } from "@/utils/supabase/server";

export async function update(formData: { firstName: string; lastName: string; email: string }) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: formData.firstName,
      last_name: formData.lastName,
    })
    .eq("id", authData.user.id);

  if (profileError) return { error: profileError.message };

  // Update email if changed
  if (formData.email !== authData.user.email) {
    const { error: authUserError } = await supabase.auth.updateUser({
      email: formData.email,
    });

    if (authUserError) return { error: authUserError.message };
    return { emailChanged: true };
  }

  return { success: true };
}
