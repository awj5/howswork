"use server";

import { DateTime } from "luxon";
import { randomInt } from "node:crypto";
import { createClient } from "@/utils/supabase/server";

export async function scheduleCheckIn(companyID: number, scheduled: string, repeat: number) {
  const supabase = await createClient();

  // Get company timezone
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("timezone")
    .eq("id", companyID)
    .single();

  if (companyError) return { error: companyError.message };
  const scheduledDT = DateTime.fromISO(scheduled, { zone: companyData.timezone }).toUTC(); // Convert to UTC using company timezone
  const scheduledISO = scheduledDT.toISO(); // Convert to ISO to store in Supabase
  const pin = randomInt(100000, 1000000).toString(); // Generate random pin
  const scheduledPrevWeek = scheduledDT.minus({ days: 7 }).toISO();
  const scheduledNextWeek = scheduledDT.plus({ days: 7 }).toISO();

  // Check if new check-in is less or greater than a week from an existing check-in
  const { data: checkInsData, error: checkInsError } = await supabase
    .from("check_ins")
    .select("id")
    .eq("company_id", companyID)
    .gte("scheduled", scheduledPrevWeek)
    .lte("scheduled", scheduledNextWeek);

  if (checkInsError) return { error: checkInsError.message };
  if (checkInsData.length > 0) return { error: "Check-ins must be more than 7 days apart." };

  // Check for check-ins beyond this one (if repeating)
  if (repeat) {
    const { data: checkInsData, error: checkInsError } = await supabase
      .from("check_ins")
      .select("id")
      .eq("company_id", companyID)
      .gte("scheduled", scheduledISO);

    if (checkInsError) return { error: checkInsError.message };
    if (checkInsData.length > 0) return { error: "A future check-in is already scheduled." };
  }

  // Add check-in for company
  const { error: insertCheckInError } = await supabase.from("check_ins").insert({
    company_id: companyID,
    scheduled: scheduledISO, // Stored as UTC
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
