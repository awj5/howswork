"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateStaff(companyID: number, contacts: string[]) {
  const supabase = await createClient();

  // Update staff contacts (RLS only allows users in company to update it)
  const { error: updateStaffContactsError } = await supabase
    .from("staff_contacts")
    .update({
      contacts,
    })
    .eq("company_id", companyID);

  if (updateStaffContactsError) return { error: updateStaffContactsError.message };
  return { success: true };
}
