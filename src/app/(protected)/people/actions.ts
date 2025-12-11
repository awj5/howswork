"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateStaff(companyID: number, contacts: string[]) {
  const supabase = await createClient();

  // Update staff contacts (RLS only allows users in company to update it)
  const { error: updatePeopleError } = await supabase
    .from("people")
    .update({
      contacts,
    })
    .eq("company_id", companyID);

  if (updatePeopleError) return { error: updatePeopleError.message };
  return { success: true };
}
