"use server";

import { DateTime } from "luxon";
import { randomInt } from "node:crypto";
import { createClient } from "@/utils/supabase/server";

export async function addCheckIn(companyID: number, scheduled: string, repeat: number) {
  const supabase = await createClient();

  // Get company timezone
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("timezone")
    .eq("id", companyID)
    .single();

  if (companyError) return { error: companyError.message };
  const scheduledDT = DateTime.fromISO(scheduled, { zone: companyData.timezone }).toUTC().toISO(); // Convert to UTC using company timezone
  const pin = randomInt(100000, 1000000).toString();

  // Add check-in for company
  const { error: insertCheckInError } = await supabase.from("check_ins").insert({
    company_id: companyID,
    scheduled: scheduledDT, // Stored as UTC
    repeat,
    pin,
  });

  if (insertCheckInError) return { error: insertCheckInError.message };
  return { success: true };
}

export async function removeCheckIn(checkInID: number) {
  const supabase = await createClient();
  const { error: deleteCheckInError } = await supabase.from("check_ins").delete().eq("id", checkInID);
  if (deleteCheckInError) return { error: deleteCheckInError.message };
  return { success: true };
}
