"use server";

import { createClient } from "@/utils/supabase/server";
import { encrypt, decrypt } from "@/utils/encryption";

export async function getRisksData(companyID: number, from: number, to: number, issue?: string) {
  const supabase = await createClient();

  let risksQuery = supabase
    .from("risks")
    .select("id, description, issues", {
      count: "exact",
    })
    .eq("company_id", companyID);

  if (issue) risksQuery = risksQuery.contains("issues", issue); // Filter

  const {
    data: risksData,
    error: risksError,
    count: risksCount,
  } = await risksQuery.order("created_at", { ascending: false }).range(from, to);

  if (risksError) return { error: risksError.message };
  // Decrypt description
  return { data: risksData, count: risksCount };
}

export async function addRisk(companyID: number) {
  const supabase = await createClient();

  const { error: insertRiskError } = await supabase.from("risks").insert({
    company_id: companyID,
  });

  if (insertRiskError) {
    console.error(insertRiskError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}
