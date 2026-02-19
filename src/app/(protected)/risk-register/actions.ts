"use server";

import { createClient } from "@/utils/supabase/server";
import { encrypt, decrypt } from "@/utils/encryption";
import { RiskType } from "@/types";

export async function getRisksData(companyID: number, from: number, to: number, issue?: string) {
  const supabase = await createClient();

  let risksQuery = supabase
    .from("risks")
    .select(
      "id, concern_id, concern_tracking, check_in_id, check_in_date, date_raised, date_reviewed, issues, description, ai_description, level, status, owner, response",
      {
        count: "exact",
      }
    )
    .eq("company_id", companyID);

  if (issue) risksQuery = risksQuery.contains("issues", issue); // Filter

  const {
    data: risksData,
    error: risksError,
    count: risksCount,
  } = await risksQuery.order("created_at", { ascending: false }).range(from, to);

  if (risksError) return { error: risksError.message };
  risksData.forEach((risk) => (risk.description = decrypt(risk.description))); // Decrypt descriptions

  // Decrypt responses
  risksData.forEach((risk) => {
    if (risk.response) risk.response = decrypt(risk.response);
  });

  return { data: risksData, count: risksCount };
}

export async function getRiskData(id: number) {
  const supabase = await createClient();

  const { data: riskData, error: riskError } = await supabase
    .from("risks")
    .select(
      "id, concern_id, check_in_id, date_raised, date_reviewed, issues, description, level, status, owner, response"
    )
    .eq("id", id)
    .single();

  if (riskError) {
    console.error(riskError.message);
    return { error: "Internal server error" };
  }

  riskData.description = decrypt(riskData.description); // Decrypt description
  if (riskData.response) riskData.response = decrypt(riskData.response); // Decrypt response
  return { data: riskData };
}

export async function addEditRisk(companyID: number, risk: RiskType, id: number) {
  const supabase = await createClient();

  if (id) {
    // Edit
    const { error: updateRiskError } = await supabase
      .from("risks")
      .update({
        date_raised: risk.date_raised,
        date_reviewed: risk.date_reviewed ? risk.date_reviewed : null,
        issues: risk.issues?.length ? risk.issues : null,
        description: encrypt(risk.description.trim()),
        level: risk.level,
        status: risk.status,
        owner: risk.owner ? risk.owner : null,
        response: risk.response ? encrypt(risk.response.trim()) : null,
      })
      .eq("id", id);

    if (updateRiskError) {
      console.error(updateRiskError.message);
      return { error: "Internal server error" };
    }
  } else {
    // Add
    const { error: insertRiskError } = await supabase.from("risks").insert({
      company_id: companyID,
      date_raised: risk.date_raised,
      date_reviewed: risk.date_reviewed ? risk.date_reviewed : null,
      issues: risk.issues?.length ? risk.issues : null,
      description: encrypt(risk.description.trim()),
      level: risk.level,
      status: risk.status,
      owner: risk.owner ? risk.owner : null,
      response: risk.response ? encrypt(risk.response.trim()) : null,
    });

    if (insertRiskError) {
      console.error(insertRiskError.message);
      return { error: "Internal server error" };
    }
  }

  return { success: true };
}

export async function deleteRisk(id: number) {
  const supabase = await createClient();
  const { error: deleteRiskError } = await supabase.from("risks").delete().eq("id", id);

  if (deleteRiskError) {
    console.error(deleteRiskError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}
