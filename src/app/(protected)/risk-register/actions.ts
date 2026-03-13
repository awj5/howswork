"use server";

import { createClient } from "@/utils/supabase/server";
import { encrypt, decrypt } from "@/utils/encryption";
import { RiskType } from "@/types";

export async function getRisksData(
  companyID: number,
  from: number,
  to: number,
  sort: string,
  issue?: string,
  concernID?: string,
  checkInID?: string
) {
  const supabase = await createClient();

  let risksQuery = supabase
    .from("risks")
    .select(
      "id, concern_id, concern_tracking, check_in_id, check_in_date, date_raised, date_reviewed, issues, description, ai_description, level, status, owner, response, date_resolved, ai_response",
      {
        count: "exact",
      }
    )
    .eq("company_id", companyID);

  if (issue) risksQuery = risksQuery.contains("issues", issue); // Filter
  if (concernID) risksQuery = risksQuery.eq("concern_id", concernID); // Concern only
  if (checkInID) risksQuery = risksQuery.eq("check_in_id", checkInID); // Check-in only

  const {
    data: risksData,
    error: risksError,
    count: risksCount,
  } = await (sort === "status"
    ? risksQuery.order("status", { ascending: true }).order("date_raised", { ascending: false }).range(from, to)
    : sort === "level"
      ? risksQuery.order("level", { ascending: false }).order("date_raised", { ascending: false }).range(from, to)
      : risksQuery.order("date_raised", { ascending: false }).range(from, to));

  if (risksError) return { error: risksError.message };

  // Decrypt descriptions
  risksData.forEach((risk) => {
    try {
      risk.description = decrypt(risk.description);
    } catch {
      risk.description = "[decryption error]";
    }
  });

  // Decrypt responses
  risksData.forEach((risk) => {
    if (risk.response) {
      try {
        risk.response = decrypt(risk.response);
      } catch {
        risk.response = "[decryption error]";
      }
    }
  });

  return { data: risksData, count: risksCount };
}

export async function getRiskData(id: number) {
  const supabase = await createClient();

  const { data: riskData, error: riskError } = await supabase
    .from("risks")
    .select(
      "id, concern_id, check_in_id, date_raised, date_reviewed, issues, description, ai_description, level, status, owner, response, date_resolved, ai_response"
    )
    .eq("id", id)
    .single();

  if (riskError) {
    console.error(riskError.message);
    return { error: "Internal server error" };
  }

  try {
    riskData.description = decrypt(riskData.description); // Decrypt description
    if (riskData.response) riskData.response = decrypt(riskData.response); // Decrypt response
  } catch (error) {
    console.error(error);
    return { error: "Internal server error" };
  }

  return { data: riskData };
}

export async function addEditRisk(companyID: number, risk: RiskType, id: number) {
  const supabase = await createClient();

  if (id) return { error: "Internal server error" };

  /*if (id) {
    // Edit
    const { error: updateRiskError } = await supabase
      .from("risks")
      .update({
        ...(!risk.concern_id && !risk.check_in_id && { date_raised: risk.date_raised }),
        ...(!risk.concern_id && { date_reviewed: risk.date_reviewed || null }),
        issues: risk.issues?.length ? risk.issues : null,
        description: encrypt(risk.description.trim()),
        level: risk.level,
        status: risk.status,
        owner: risk.owner || null,
        response: risk.response ? encrypt(risk.response.trim()) : null,
        ai_description: risk.ai_description,
        ...(!risk.concern_id && { date_resolved: risk.date_resolved || null }),
        ai_response: risk.ai_response,
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
      date_reviewed: risk.date_reviewed || null,
      issues: risk.issues?.length ? risk.issues : null,
      description: encrypt(risk.description.trim()),
      level: risk.level,
      status: risk.status,
      owner: risk.owner || null,
      response: risk.response ? encrypt(risk.response.trim()) : null,
      date_resolved: risk.date_resolved || null,
    });

    if (insertRiskError) {
      console.error(insertRiskError.message);
      return { error: "Internal server error" };
    }
  }*/

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
