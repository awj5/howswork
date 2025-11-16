"use server";

import { createClient } from "@/utils/supabase/server";

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
    .eq("id", authData.user.id);

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
  /*
  // Get profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("admin, company_id")
    .eq("id", authData.user.id)
    .single();

  if (profileError) return { error: profileError.message };

  // Get company admins
  const { count: profilesCount, error: profilesError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("company_id", profileData.company_id)
    .eq("admin", true);

  if (profilesError) return { error: profilesError.message };

  // Check if only admin
  if (profilesCount === 1) {
    // Remove company from users
    const { error: updateProfilesError } = await supabase
      .from("profiles")
      .update({ company_id: null })
      .eq("company_id", profileData.company_id);

    if (updateProfilesError) return { error: updateProfilesError.message };
  }

  // Count if any other admins for company*/
  return { success: true };
}
