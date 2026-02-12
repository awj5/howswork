"use server";

import { createClient } from "@/utils/supabase/server";
import { encrypt, decrypt } from "@/utils/encryption";

export async function getConcernData(id: number, companyID: number) {
  const supabase = await createClient();

  const { data: concernData, error: concernError } = await supabase
    .from("concerns")
    .select("id, tracking, details, created_at, issues")
    .eq("company_id", companyID)
    .eq("id", id)
    .single();

  if (concernError) {
    console.error(concernError.message);
    return { error: "Concern not found" };
  }

  concernData.details = decrypt(concernData.details); // Decrypt details

  // Get status updates
  const { data: concernStatusData, error: concernStatusError } = await supabase
    .from("concern_status")
    .select("created_at, status")
    .eq("concern_id", id)
    .order("created_at", { ascending: false });

  if (concernStatusError) {
    console.error(concernStatusError.message);
    return { error: "Internal server error" };
  }

  // Get comments
  const { data: concernCommentsData, error: concernCommentsError } = await supabase
    .from("concern_comments")
    .select("created_at, comment, admin_name")
    .eq("concern_id", id)
    .order("created_at", { ascending: false });

  if (concernCommentsError) {
    console.error(concernCommentsError.message);
    return { error: "Internal server error" };
  }

  // Decrypt comments
  concernCommentsData.forEach((item) => {
    item.comment = decrypt(item.comment);
  });

  // Combine status updates and comments
  const activity = [...concernStatusData, ...concernCommentsData].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const response = {
    ...concernData,
    activity,
  };

  return { data: response };
}

export async function addComment(concernID: number, comment: string, companyID: number) {
  const supabase = await createClient();

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: "Not authenticated" };

  // Get profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", authData.user.id)
    .single();

  if (profileError) {
    console.error(profileError.message);
    return { error: "Internal server error" };
  }

  // Add comment
  const { error: insertConcernCommentError } = await supabase.from("concern_comments").insert({
    comment: encrypt(comment.trim().slice(0, 800)),
    concern_id: concernID,
    company_id: companyID,
    admin_name: `${profileData.first_name} ${profileData.last_name}`,
  });

  if (insertConcernCommentError) {
    console.error(insertConcernCommentError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}

export async function addStatus(concernID: number, status: number, companyID: number) {
  const supabase = await createClient();

  const { error: insertConcernStatusError } = await supabase.from("concern_status").insert({
    status,
    concern_id: concernID,
    company_id: companyID,
  });

  if (insertConcernStatusError) {
    console.error(insertConcernStatusError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}

export async function updateIssues(concernID: number, issues: number[]) {
  const supabase = await createClient();

  const { error: updateConcernError } = await supabase
    .from("concerns")
    .update({
      issues,
    })
    .eq("id", concernID);

  if (updateConcernError) {
    console.error(updateConcernError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}
