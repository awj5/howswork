"use server";

import { baseURL, isValidEmail } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";
import { resend } from "@/utils/resend";
import type { CompanyType } from "@/types";

export async function inviteUser(email: string, company: CompanyType) {
  const supabase = await createClient();
  email = email.trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "Email is invalid." };

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Verify auth user can send invite
  const { error: companyUserError } = await supabase
    .from("company_users")
    .select("id")
    .eq("user_id", authData.user.id)
    .single();

  if (companyUserError) return { error: companyUserError.message };

  // Check if user already exists
  const { error: profileError } = await supabase.from("profiles").select("id").eq("email", email).single();

  if (profileError) return { error: profileError.message };

  // Send email invite
  const inviteUrl = `${baseURL}/register?email=${encodeURIComponent(email)}`;
  try {
    const { error: sendInviteError } = await resend.emails.send({
      from: "HowsWork <no-reply@updates.howswork.app>",
      to: email,
      subject: "You've been invited to join",
      html: `
        <p>Hi,</p>
        <p>You've been invited to join your company on HowsWork.</p>
        <p>
          <a href="${inviteUrl}">Click here to get started</a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p>${inviteUrl}</p>
      `,
      // optional plain-text:
      text: `You've been invited to join. Open this link: ${inviteUrl}`,
    });

    if (sendInviteError) {
      console.error(sendInviteError);
      return { error: sendInviteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Unexpected error sending email" };
  }
}

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
  const userIDs = companyUsersData.map((row) => row.user_id); // Get user ids
  const authInCompany = userIDs.includes(authData.user.id); // Check if auth user is in company
  const targetInCompany = userIDs.includes(userID); // Check if user to remove is in company
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
