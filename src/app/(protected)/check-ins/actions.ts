"use server";

import { DateTime } from "luxon";
import { randomInt } from "node:crypto";
import type { CheckInType } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function scheduleCheckIn(companyID: number, start: string, repeat: number) {
  const supabase = await createClient();

  // Get company timezone
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("timezone")
    .eq("id", companyID)
    .single();

  if (companyError) return { error: companyError.message };
  const startDT = DateTime.fromISO(start, { zone: companyData.timezone }).toUTC(); // Convert to UTC using company timezone
  const startISO = startDT.toISO(); // Convert to ISO to store in Supabase
  const pin = randomInt(100000, 1000000).toString(); // Generate random pin
  const startPrevWeek = startDT.minus({ days: 7 }).toISO();
  const startNextWeek = startDT.plus({ days: 7 }).toISO();

  // Check if new check-in is less or greater than a week from an existing check-in
  const { data: checkInsData, error: checkInsError } = await supabase
    .from("check_ins")
    .select("*")
    .eq("company_id", companyID)
    .gte("start", startPrevWeek)
    .lte("start", startNextWeek)
    .limit(1);

  if (checkInsError) return { error: checkInsError.message };
  if (checkInsData.length) return { error: "Check-ins must be more than 7 days apart" };

  // Check for check-ins beyond this one (if repeating)
  if (repeat) {
    const { data: checkInsData, error: checkInsError } = await supabase
      .from("check_ins")
      .select("*")
      .eq("company_id", companyID)
      .gte("start", startISO)
      .limit(1);

    if (checkInsError) return { error: checkInsError.message };
    if (checkInsData.length) return { error: "A future check-in is already scheduled" };
  }

  // Add check-in for company
  const { error: insertCheckInError } = await supabase.from("check_ins").insert({
    company_id: companyID,
    start: startISO, // Stored as UTC
    repeat,
    pin,
  });

  if (insertCheckInError) return { error: insertCheckInError.message };
  return { success: true };
}

export async function removeCheckIn(checkIn: CheckInType, companyID: number) {
  const supabase = await createClient();
  const { error: deleteCheckInError } = await supabase.from("check_ins").delete().eq("id", checkIn.id);
  if (deleteCheckInError) return { error: deleteCheckInError.message };

  // Remove repeat from open check-in (if exists)
  const { error: updateCheckInError } = await supabase
    .from("check_ins")
    .update({
      repeat: 0,
    })
    .eq("company_id", companyID)
    .eq("status", "Open");

  if (updateCheckInError) return { error: updateCheckInError.message };
  return { success: true };
}
