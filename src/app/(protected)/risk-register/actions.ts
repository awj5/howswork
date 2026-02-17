"use server";

import { createClient } from "@/utils/supabase/server";
import { encrypt, decrypt } from "@/utils/encryption";
import { RiskType } from "@/types";

export async function getRisksData(companyID: number, from: number, to: number, issue?: string) {
  const supabase = await createClient();

  let risksQuery = supabase
    .from("risks")
    .select("id, date_raised, date_reviewed, issues, description", {
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
  risksData.forEach((risk) => (risk.description = decrypt(risk.description))); // Decrypt descriptions
  return { data: risksData, count: risksCount };
}

export async function addRisk(companyID: number, risk: RiskType) {
  const supabase = await createClient();

  const { error: insertRiskError } = await supabase.from("risks").insert({
    company_id: companyID,
    date_raised: risk.date_raised,
    date_reviewed: risk.date_reviewed,
    issues: risk.issues?.length ? risk.issues : null,
    description: encrypt(risk.description.trim()),
  });

  if (insertRiskError) {
    console.error(insertRiskError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}
