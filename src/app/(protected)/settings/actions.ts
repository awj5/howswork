"use server";

import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";

export async function removeUser(userID: string, companyID: number) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Get all company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("user_id")
    .eq("company_id", companyID);

  if (companyUsersError) return { error: companyUsersError.message };
  const companyUserIDs = companyUsersData.map((row) => row.user_id); // Get user ids
  const authInCompany = companyUserIDs.includes(authData.user.id); // Check if auth user is in company
  const targetInCompany = companyUserIDs.includes(userID); // Check if user to remove is in company
  if (!authInCompany) return { error: "You do not have permission to modify this company." };
  if (!targetInCompany) return { error: "User is not part of this company." };

  // Delete user from company using supabase admin
  const { error: deleteCompanyUserError } = await supabaseAdmin
    .from("company_users")
    .delete()
    .eq("user_id", userID)
    .eq("company_id", companyID);

  if (deleteCompanyUserError) return { error: deleteCompanyUserError.message };
  return { success: true };
}
