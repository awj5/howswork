"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateCompany(companyID: number, name: string) {
  const supabase = await createClient();

  // Update company (RLS only allows users in company to update it)
  const { error: updateCompanyError } = await supabase
    .from("companies")
    .update({
      name,
    })
    .eq("id", companyID);

  if (updateCompanyError) return { error: updateCompanyError.message };
  return { success: true };
}

export async function deleteCompany(companyID: number) {
  const supabase = await createClient();

  // Get company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("id")
    .eq("company_id", companyID);

  if (companyUsersError) return { error: companyUsersError.message };
  if (companyUsersData.length > 1) return { error: "Remove all admins before deleting a company." };

  // There is only one user left so delete the company
  const { error: deleteCompanyError } = await supabase.from("companies").delete().eq("id", companyID);
  if (deleteCompanyError) return { error: deleteCompanyError.message };
  return { success: true };
}
