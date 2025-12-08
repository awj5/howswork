"use server";

import { DateTime } from "luxon";
import { createClient } from "@/utils/supabase/server";
import { PulseCheckType } from "./page";

export async function addPulseCheck(pulseCheck: PulseCheckType) {
  const supabase = await createClient();

  // Get company timezone
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("timezone")
    .eq("id", pulseCheck.company_id)
    .single();

  if (companyError) return { error: companyError.message };
  const scheduledUTC = DateTime.fromISO(pulseCheck.scheduled, { zone: companyData.timezone }).toUTC().toISO(); // Convert to UTC using company timezone

  // Add pulse check for company
  const { error: insertPulseCheckError } = await supabase.from("pulse_checks").insert({
    company_id: pulseCheck.company_id,
    scheduled: scheduledUTC,
    repeat: pulseCheck.repeat,
  });

  if (insertPulseCheckError) return { error: insertPulseCheckError.message };
  return { success: true };
}
