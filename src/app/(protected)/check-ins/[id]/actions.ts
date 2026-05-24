"use server";

import { createClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/encryption";

export async function deleteCheckIn(id: number, companyID: number) {
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

export async function decryptDetails(details: string[]) {
  const decrypted = [];

  try {
    for (const detail of details) {
      decrypted.push(decrypt(detail));
    }

    return { data: decrypted };
  } catch (error) {
    console.error(error);
    return { error: "Internal server error" };
  }
}
