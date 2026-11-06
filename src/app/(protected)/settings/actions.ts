"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";
import { baseURL } from "@/utils/helpers";
import { type CompanyType } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function updateCompany(company: CompanyType) {
  const supabase = await createClient();
  const slug = company.slug.slice(0, 15);

  // Check if slug already exists (use Supabase admin to get around RLS)
  const { data: companiesData, error: companiesError } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .neq("id", company.id)
    .limit(1);

  if (companiesError) {
    console.error(companiesError.message);
    return { error: "Internal server error" };
  }

  if (companiesData.length) return { error: "This URL is already in use. Choose a different URL" };

  // Update company (RLS only allows users in company to update it)
  const { error: updateCompanyError } = await supabase
    .from("companies")
    .update({
      name: company.name.trim().slice(0, 20),
      slug,
      timezone: company.timezone,
    })
    .eq("id", company.id);

  if (updateCompanyError) {
    console.error(updateCompanyError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}

export async function deleteCompany(companyID: number) {
  const supabase = await createClient();

  // Get company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("id")
    .eq("company_id", companyID)
    .not("user_id", "is", null);

  if (companyUsersError) {
    console.error(companyUsersError.message);
    return { error: "Internal server error" };
  }

  if (companyUsersData.length > 1) return { error: "All admins must be removed before this workspace can be deleted" };

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Get company name
  const { data: companiesData, error: companiesError } = await supabaseAdmin
    .from("companies")
    .select("name")
    .eq("id", companyID)
    .single();

  if (companiesError) {
    console.error(companiesError.message);
    return { error: "Internal server error" };
  }

  const companyName = companiesData.name;

  // There is only one admin left so delete the company
  const { error: deleteCompanyError } = await supabase.from("companies").delete().eq("id", companyID);

  if (deleteCompanyError) {
    console.error(deleteCompanyError.message);
    return { error: "Internal server error" };
  }

  // Record company deletion
  const { error: insertCompanyDeletedError } = await supabaseAdmin.from("company_deleted").insert({
    name: companyName,
    email: authData.user.email,
  });

  if (insertCompanyDeletedError) console.error(insertCompanyDeletedError.message);
  return { success: true };
}

export async function openStripe(customer: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: `${baseURL}/settings`,
  });

  redirect(session.url);
}
