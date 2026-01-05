"use server";

import { baseURL, isValidEmail } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";
import resend from "@/utils/resend";
import type { CompanyType, UserType } from "@/types";
import { adminInviteEmail } from "@/utils/emails/admin-invite";

export async function inviteUser(email: string, company: CompanyType) {
  const supabase = await createClient();
  email = email.trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "Email is invalid." };

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated." };

  // Get all company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("user_id, invite_email")
    .eq("company_id", company.id);

  if (companyUsersError) return { error: companyUsersError.message };
  const userIDs = companyUsersData.map((u) => u.user_id).filter(Boolean); // Registered user IDs
  const inviteEmails = companyUsersData.map((u) => u.invite_email).filter(Boolean); // Invited user emails
  if (!userIDs.includes(authData.user.id)) return { error: "You do not have permission to modify this company." };

  // Check if user already exists
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (profileError) return { error: profileError.message };
  if (userIDs.includes(profileData?.user_id)) return { error: "User is already in this company." };
  if (inviteEmails.includes(email)) return { error: "User is already invited." };

  // Add user to company
  const { error: insertCompanyUserError } = await supabaseAdmin.from("company_users").insert({
    user_id: profileData?.user_id ?? null,
    company_id: company.id,
    invite_email: !profileData ? email : null,
  });

  if (insertCompanyUserError) return { error: insertCompanyUserError.message };
  if (profileData) return { success: "Admin access granted." };

  // Send email invite (if user doesn't already exist)
  const inviteUrl = `${baseURL}/register?email=${encodeURIComponent(email)}&company=${encodeURIComponent(company.name)}`;

  try {
    const { error: sendInviteError } = await resend.emails.send({
      from: "HowsWork <no-reply@updates.howswork.app>",
      to: email,
      subject: "You've been invited to access HowsWork",
      html: adminInviteEmail(company.name, inviteUrl),
    });

    if (sendInviteError) return { error: sendInviteError.message };
    return { success: "Admin invite sent." };
  } catch (error) {
    console.error(error);
    return { error: "Unexpected error sending email." };
  }
}

export async function removeUser(user: UserType, companyID: number) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated." };

  // Get all company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("user_id, invite_email")
    .eq("company_id", companyID);

  if (companyUsersError) return { error: companyUsersError.message };
  const userIDs = companyUsersData.map((u) => u.user_id).filter(Boolean); // Registered user IDs
  const inviteEmails = companyUsersData.map((u) => u.invite_email).filter(Boolean); // Invited user emails
  if (!userIDs.includes(authData.user.id)) return { error: "You do not have permission to modify this company." };

  if ((user.user_id && !userIDs.includes(user.user_id)) || (!user.user_id && !inviteEmails.includes(user.email)))
    return { error: "User is not in this company." };

  // Delete user from company using supabase admin
  const { error: deleteCompanyUserError } = await supabaseAdmin
    .from("company_users")
    .delete()
    .eq(user.user_id ? "user_id" : "invite_email", user.user_id || user.email)
    .eq("company_id", companyID);

  if (deleteCompanyUserError) return { error: deleteCompanyUserError.message };
  return { success: true };
}
