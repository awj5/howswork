"use server";

import { createClient } from "@/utils/supabase/server";

export async function removeCheckIn(id: number, companyID: number) {
  const supabase = await createClient();
  const { error: deleteCheckInError } = await supabase.from("check_ins").delete().eq("id", id);

  if (deleteCheckInError) {
    console.error(deleteCheckInError.message);
    return { error: "Internal server error" };
  }

  // Remove repeat from open check-in (if exists)
  const { error: updateCheckInError } = await supabase
    .from("check_ins")
    .update({
      repeat: 0,
    })
    .eq("company_id", companyID)
    .eq("status", 2);

  if (updateCheckInError) {
    console.error(updateCheckInError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}
