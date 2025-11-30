"use server";

import { baseURL, isValidEmail } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";
import { resend } from "@/utils/resend";
import type { CompanyType, UserType } from "@/types";

export async function inviteUser(email: string, company: CompanyType) {
  const supabase = await createClient();
  email = email.trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "Email is invalid." };

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Get all company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("user_id, invite_email")
    .eq("company_id", company.id);

  if (companyUsersError) return { error: companyUsersError.message };
  const userIDs = companyUsersData.map((row) => row.user_id).filter(Boolean); // Registered users in company
  const inviteEmails = companyUsersData.map((row) => row.invite_email).filter(Boolean); // Invited users
  if (!userIDs.includes(authData.user.id)) return { error: "You do not have permission to modify this company." };

  // Check if user already exists
  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("email", email);

  if (profilesError) return { error: profilesError.message };

  if (profilesData.length && userIDs.includes(profilesData[0].user_id))
    return { error: "User is already in this company." };

  if (inviteEmails.includes(email)) return { error: "User is already invited." };

  // Add to company
  const { error: insertCompanyUserError } = await supabaseAdmin.from("company_users").insert({
    user_id: profilesData.length ? profilesData[0].user_id : null,
    company_id: company.id,
    invite_email: !profilesData.length ? email : null,
  });

  if (insertCompanyUserError) return { error: insertCompanyUserError.message };
  if (profilesData.length) return { success: "User added!" };

  // Send email invite
  const inviteUrl = `${baseURL}/register?email=${encodeURIComponent(email)}&company=${encodeURIComponent(company.name)}`;

  try {
    const { error: sendInviteError } = await resend.emails.send({
      from: "HowsWork <no-reply@updates.howswork.app>",
      to: email,
      subject: `You have been invited by ${company.name}`,
      html: `
      <h2>${company.name} has invited you to HowsWork</h2>
      
      <p>Follow this link to register and accept the invite:</p>
      <p><a href="${inviteUrl}">Accept the invite</a></p>
      `,
    });

    if (sendInviteError) return { error: sendInviteError.message };
    return { success: "Invite sent!" };
  } catch (error) {
    console.error(error);
    return { error: "Unexpected error sending email" };
  }
}

export async function removeUser(user: UserType, companyID: number) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Get all company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("user_id, invite_email")
    .eq("company_id", companyID);

  if (companyUsersError) return { error: companyUsersError.message };
  const userIDs = companyUsersData.map((row) => row.user_id).filter(Boolean); // Registered users in company
  const inviteEmails = companyUsersData.map((row) => row.invite_email).filter(Boolean); // Invited users
  if (!userIDs.includes(authData.user.id)) return { error: "You do not have permission to modify this company." };

  if ((user.user_id && !userIDs.includes(user.user_id)) || (!user.user_id && !inviteEmails.includes(user.email)))
    return { error: "User is not part of this company." };

  // Delete user from company using supabase admin
  const { error: deleteCompanyUserError } = await supabaseAdmin
    .from("company_users")
    .delete()
    .eq(user.user_id ? "user_id" : "invite_email", user.user_id || user.email)
    .eq("company_id", companyID);

  if (deleteCompanyUserError) return { error: deleteCompanyUserError.message };
  return { success: "Invite sent!" };
}
