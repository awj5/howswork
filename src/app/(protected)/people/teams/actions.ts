"use server";

import { createClient } from "@/utils/supabase/server";
import type { CompanyType } from "@/types";

export async function addTeam(name: string, company: CompanyType) {
  const supabase = await createClient();

  // Add team
  const { error: insertTeamError } = await supabase.from("teams").insert({
    name: name.trim(),
    company_id: company.id,
  });

  if (insertTeamError) {
    console.error(insertTeamError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}

export async function removeTeam(id: number) {
  const supabase = await createClient();
  const { error: deleteTeamError } = await supabase.from("teams").delete().eq("id", id); // Delete team

  if (deleteTeamError) {
    console.error(deleteTeamError.message);
    return { error: "Internal server error" };
  }

  return { success: true };
}
