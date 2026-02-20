"use server";

import { baseURL } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";
import resend from "@/utils/resend";
import type { CompanyType, UserType } from "@/types";
import InviteAdmin from "@/emails/invite-admin";
import ConfirmAdmin from "@/emails/confirm-admin";
import RemoveAdmin from "@/emails/remove-admin";

export async function inviteUser(email: string, company: CompanyType) {
  const supabase = await createClient();
  email = email.trim().toLowerCase();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Get all company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("user_id, invite_email")
    .eq("company_id", company.id);

  if (companyUsersError) {
    console.error(companyUsersError.message);
    return { error: "Internal server error" };
  }

  const userIDs = companyUsersData.map((i) => i.user_id).filter(Boolean); // Registered user IDs
  const inviteEmails = companyUsersData.map((i) => i.invite_email).filter(Boolean); // Invited user emails
  if (!userIDs.includes(authData.user.id)) return { error: "You do not have permission to modify this company" };

  // Check if user already exists
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("user_id, first_name")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    console.error(profileError.message);
    return { error: "Internal server error" };
  }

  if (userIDs.includes(profileData?.user_id)) return { error: "User is already in this company" };
  if (inviteEmails.includes(email)) return { error: "User is already invited" };

  // Add user to company
  const { error: insertCompanyUserError } = await supabaseAdmin.from("company_users").insert({
    user_id: profileData?.user_id ?? null,
    company_id: company.id,
    invite_email: !profileData ? email : null,
  });

  if (insertCompanyUserError) {
    console.error(insertCompanyUserError.message);
    return { error: "Internal server error" };
  }

  // Send email invite or alert existing user
  try {
    const inviteUrl = `${baseURL}/register?email=${encodeURIComponent(email)}&company=${encodeURIComponent(company.name)}`;

    const { error: sendInviteError } = await resend.emails.send({
      from: "HowsWork <no-reply@updates.howswork.app>",
      to: email,
      subject: profileData ? `Admin access granted for ${company.name}` : `${company.name} has invited you to HowsWork`,
      react: profileData
        ? ConfirmAdmin({
            company: company.name,
            name: profileData.first_name,
          })
        : InviteAdmin({
            company: company.name,
            url: inviteUrl,
          }),
    });

    if (sendInviteError) throw sendInviteError;
    return { success: profileData ? "Admin access granted" : "Admin invite sent" };
  } catch (error) {
    console.error(error);
    return { error: "Unexpected error sending email" };
  }
}

export async function removeUser(user: UserType, company: CompanyType) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Get all company users
  const { data: companyUsersData, error: companyUsersError } = await supabase
    .from("company_users")
    .select("user_id, invite_email")
    .eq("company_id", company.id);

  if (companyUsersError) {
    console.error(companyUsersError.message);
    return { error: "Internal server error" };
  }

  const userIDs = companyUsersData.map((i) => i.user_id).filter(Boolean); // Registered user IDs
  const inviteEmails = companyUsersData.map((i) => i.invite_email).filter(Boolean); // Invited user emails
  if (!userIDs.includes(authData.user.id)) return { error: "You do not have permission to modify this company" };

  if ((user.user_id && !userIDs.includes(user.user_id)) || (!user.user_id && !inviteEmails.includes(user.email)))
    return { error: "User is not in this company" };

  // Delete user from company using supabase admin
  const { error: deleteCompanyUserError } = await supabaseAdmin
    .from("company_users")
    .delete()
    .eq(user.user_id ? "user_id" : "invite_email", user.user_id || user.email)
    .eq("company_id", company.id);

  if (deleteCompanyUserError) {
    console.error(deleteCompanyUserError.message);
    return { error: "Internal server error" };
  }

  // Send email alerting user
  if (user.user_id && userIDs.includes(user.user_id)) {
    try {
      // Get user's name
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("first_name")
        .eq("user_id", user.user_id)
        .single();

      if (profileError) throw profileError.message;

      // Get auth user's name
      const { data: authProfileData, error: authProfileError } = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", authData.user.id)
        .single();

      if (authProfileError) throw authProfileError.message;

      const { error: sendInviteError } = await resend.emails.send({
        from: "HowsWork <no-reply@updates.howswork.app>",
        to: user.email,
        subject: `Admin access removed for ${company.name}`,
        react: RemoveAdmin({
          company: company.name,
          name: profileData.first_name,
          removedBy: `${authProfileData.first_name} ${authProfileData.last_name}`,
        }),
      });

      if (sendInviteError) throw sendInviteError;
    } catch (error) {
      console.error(error);
    }
  }

  return { success: true };
}
