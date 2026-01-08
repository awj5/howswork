"use server";

import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";
import { type CompanyType } from "@/types";

export async function updateCompany(company: CompanyType) {
  const supabase = await createClient();
  const slug = company.slug.slice(0, 20);

  // Check if slug already exists (use Supabase admin to get around RLS)
  const { data: companiesData, error: companiesError } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .neq("id", company.id)
    .limit(1);

  if (companiesError) return { error: companiesError.message };
  if (companiesData.length) return { error: "This URL is already in use. Choose a different URL." };

  // Update company (RLS only allows users in company to update it)
  const { error: updateCompanyError } = await supabase
    .from("companies")
    .update({
      name: company.name.trim().slice(0, 20),
      slug,
      timezone: company.timezone,
    })
    .eq("id", company.id);

  if (updateCompanyError) return { error: updateCompanyError.message };
  return { success: true };
}

export async function deleteCompany(companyID: number) {
  const supabase = await createClient();

  // Get company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("*")
    .eq("company_id", companyID);

  if (companyUsersError) return { error: companyUsersError.message };
  if (companyUsersData.length > 1) return { error: "All admins must be removed before this company can be deleted." };

  // There is only one user left so delete the company
  const { error: deleteCompanyError } = await supabase.from("companies").delete().eq("id", companyID);
  if (deleteCompanyError) return { error: deleteCompanyError.message };
  return { success: true };
}
