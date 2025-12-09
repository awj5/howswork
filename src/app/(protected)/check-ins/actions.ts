"use server";

import { DateTime } from "luxon";
import { createClient } from "@/utils/supabase/server";
import { CheckInType } from "./page";

export async function addCheckIn(companyID: number, checkIn: CheckInType) {
  const supabase = await createClient();

  // Get company timezone
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("timezone")
    .eq("id", companyID)
    .single();

  if (companyError) return { error: companyError.message };
  const scheduledDT = DateTime.fromISO(checkIn.scheduled, { zone: companyData.timezone }).toUTC().toISO(); // Convert to UTC using company timezone

  // Add check-in for company
  const { error: insertCheckInError } = await supabase.from("check_ins").insert({
    company_id: companyID,
    scheduled: scheduledDT, // Stored as UTC
    repeat: checkIn.repeat,
  });

  if (insertCheckInError) return { error: insertCheckInError.message };
  return { success: true };
}
