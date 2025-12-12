"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateStaff(companyID: number, contacts: string[]) {
  const supabase = await createClient();

  // Normalize Aus mobile numbers
  const normalizedContacts = contacts.map((contact) => {
    // Check if phone number
    if (!contact.includes("@")) {
      const normalized = normalizeAusNumber(contact);
      return normalized ?? contact.replace(/[\s\-\(\)]/g, ""); // Keep original if not Aus number (remove all spaces, dashes, parentheses)
    }

    return contact;
  });

  // Update staff contacts (RLS only allows users in company to update it)
  const { error: updatePeopleError } = await supabase
    .from("people")
    .update({
      contacts: normalizedContacts,
    })
    .eq("company_id", companyID);

  if (updatePeopleError) return { error: updatePeopleError.message };
  return { success: true };
}

function normalizeAusNumber(number: string) {
  let cleaned = number.replace(/[\s\-\(\)]/g, ""); // Remove all spaces, dashes, parentheses
  if (cleaned.startsWith("04") && cleaned.length === 10) return `+61${cleaned.substring(1)}`; // Convert 04 to +614
  if (cleaned.startsWith("+614") && cleaned.length === 12) return cleaned; // Already in correct format
  if (cleaned.startsWith("614") && cleaned.length === 11) return `+${cleaned}`; // Add missing +
  return null; // Not an Aus mobile
}
