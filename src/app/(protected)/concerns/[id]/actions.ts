"use server";

import StatusData from "@/data/status.json";
import { createClient } from "@/utils/supabase/server";
import { encrypt, decrypt } from "@/utils/encryption";
import { generateRiskResponse } from "@/utils/ai";

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

  try {
    concernData.details = decrypt(concernData.details); // Decrypt details
  } catch (error) {
    console.error(error);
    return { error: "Internal server error" };
  }

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
    try {
      item.comment = decrypt(item.comment);
    } catch {
      item.comment = "[decryption error]";
    }
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

  // Get risk
  const { data: riskData, error: riskError } = await supabase
    .from("risks")
    .select("owner")
    .eq("concern_id", concernID)
    .maybeSingle();

  if (riskError) {
    console.error(riskError.message);
    return { error: "Internal server error" };
  }

  // Update risk (add owner)
  if (riskData && !riskData.owner) {
    const { error: updateRiskError } = await supabase
      .from("risks")
      .update({
        owner: `${profileData.first_name} ${profileData.last_name}`,
      })
      .eq("concern_id", concernID);

    if (updateRiskError) {
      console.error(updateRiskError.message);
      return { error: "Internal server error" };
    }
  }

  return { success: true };
}

export async function addStatus(concernID: number, status: number, companyID: number) {
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

  const { error: insertConcernStatusError } = await supabase.from("concern_status").insert({
    status,
    concern_id: concernID,
    company_id: companyID,
  });

  if (insertConcernStatusError) {
    console.error(insertConcernStatusError.message);
    return { error: "Internal server error" };
  }

  // Get risk
  const { data: riskData, error: riskError } = await supabase
    .from("risks")
    .select("date_reviewed, owner")
    .eq("concern_id", concernID)
    .maybeSingle();

  if (riskError) {
    console.error(riskError.message);
    return { error: "Internal server error" };
  }

  // Generate AI risk response (if resolved)
  let riskResponse = "";

  if (status >= 4) {
    // Get status updates
    const { data: concernStatusData, error: concernStatusError } = await supabase
      .from("concern_status")
      .select("created_at, status")
      .eq("concern_id", concernID)
      .order("created_at", { ascending: false });

    if (concernStatusError) {
      console.error(concernStatusError.message);
      return { error: "Internal server error" };
    }

    // Get comments
    const { data: concernCommentsData, error: concernCommentsError } = await supabase
      .from("concern_comments")
      .select("created_at, comment, admin_name")
      .eq("concern_id", concernID)
      .order("created_at", { ascending: false });

    if (concernCommentsError) {
      console.error(concernCommentsError.message);
      return { error: "Internal server error" };
    }

    // Decrypt comments
    concernCommentsData.forEach((item) => {
      try {
        item.comment = decrypt(item.comment);
      } catch {
        item.comment = "[decryption error]";
      }
    });

    // Map status numbers to titles and set author for AI
    const statusWithTitles = concernStatusData.map((item) => ({
      created_at: item.created_at,
      status: StatusData.find((i) => i.id === item.status)?.title,
      author: item.status === 1 ? "Employee" : "Admin",
    }));

    // Combine status updates and comments, and set comments author
    const activity = [
      ...statusWithTitles,
      ...concernCommentsData.map((item) => ({ ...item, author: item.admin_name ? "Admin" : "Employee" })),
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    riskResponse = await generateRiskResponse(activity);
  }

  const now = new Date().toISOString();

  // Update risk
  const { error: updateRiskError } = await supabase
    .from("risks")
    .update({
      status: status === 5 ? 4 : status, // No further action shown as Resolved
      date_resolved: status >= 4 ? now : null, // Null if not resolved
      response: status >= 4 ? encrypt(riskResponse || "Unable to generate a response. See concern for details.") : null,
      ai_response: status >= 4,
      ...(status >= 2 && !riskData?.date_reviewed && { date_reviewed: now }),
      ...(!riskData?.owner && { owner: `${profileData.first_name} ${profileData.last_name}` }), // Add owner if not already assigned
    })
    .eq("concern_id", concernID);

  if (updateRiskError) {
    console.error(updateRiskError.message);
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
