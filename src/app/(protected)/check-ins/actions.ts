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

  // Check for check-ins beyond this one (if repeating)
  if (repeat) {
    const { data: checkInsData, error: checkInsError } = await supabase
      .from("check_ins")
      .select("id")
      .eq("company_id", companyID)
      .gt("scheduled", scheduledDT);

    if (checkInsError) return { error: checkInsError.message };
    if (checkInsData.length > 0) return { error: "You already have a future check-in scheduled." };
  }

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

export async function updateCheckIn(checkInID: number) {
  const supabase = await createClient();

  // Remove repeat
  const { error: updateCheckInError } = await supabase
    .from("check_ins")
    .update({
      repeat: 0,
    })
    .eq("id", checkInID);

  if (updateCheckInError) return { error: updateCheckInError.message };
  return { success: true };
}
