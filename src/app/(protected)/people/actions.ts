"use server";

import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";

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

  if (normalizedContacts.length < 3) return { error: "At least 3 contacts are required" };

  // Update staff contacts (RLS only allows users in company to update it)
  const { error: updatePeopleError } = await supabase
    .from("people")
    .update({
      contacts: normalizedContacts,
    })
    .eq("company_id", companyID);

  if (updatePeopleError) {
    console.error(updatePeopleError.message);
    return { error: "Internal server error" };
  }

  // Send welcome message to new contacts
  try {
    // Get company timezone
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("timezone")
      .eq("id", companyID)
      .single();

    if (companyError) throw companyError;
    const isAus = companyData.timezone.includes("Australia");

    // Get already sent welcomes for company
    const { data: welcomeSentData, error: welcomeSentError } = await supabase
      .from("welcome_sent")
      .select("contact")
      .eq("company_id", companyID);

    if (welcomeSentError) throw welcomeSentError;
    const welcomeSentContacts = welcomeSentData.map((row) => row.contact); // Email or phone

    // Record that welcome was sent to contact
    const toInsert = normalizedContacts
      .filter((contact) => !welcomeSentContacts.includes(contact))
      .map((contact) => ({ contact, company_id: companyID }));

    if (toInsert.length) {
      const { error: insertWelcomeSentError } = await supabase.from("welcome_sent").insert(toInsert);
      if (insertWelcomeSentError) throw insertWelcomeSentError;
    }

    const newContacts = toInsert.map((row) => row.contact);

    // Send emails
    const emails = newContacts.filter((contact) => contact.includes("@"));
    const from_email = isAus ? "no-reply@updates.howswork.com.au" : "no-reply@updates.howswork.app";
    const subject = "Test";
    const html = `<p>Hello</p>`;

    if (emails.length) {
      const emailRecords = emails.map((email) => ({
        to_email: email,
        from_email,
        subject,
        html,
      }));

      const { error: emailQueueError } = await supabaseAdmin.from("email_queue").insert(emailRecords);
      if (emailQueueError) throw emailQueueError;
    }

    // Send SMS
    const phoneNumbers = newContacts.filter((contact) => !contact.includes("@"));
    const smsMessage = `Test`;

    if (phoneNumbers.length) {
      const smsRecords = phoneNumbers.map((phone) => ({
        phone_number: phone,
        message: smsMessage,
      }));

      const { error: smsQueueError } = await supabaseAdmin.from("sms_queue").insert(smsRecords);
      if (smsQueueError) throw smsQueueError;
    }
  } catch (error) {
    console.error(error);
  }

  return { success: true };
}

function normalizeAusNumber(number: string) {
  let cleaned = number.replace(/[\s\-\(\)]/g, ""); // Remove all spaces, dashes, parentheses
  if (cleaned.startsWith("04") && cleaned.length === 10) return `+61${cleaned.substring(1)}`; // Convert 04 to +614
  if (cleaned.startsWith("+614") && cleaned.length === 12) return cleaned; // Already in correct format
  if (cleaned.startsWith("614") && cleaned.length === 11) return `+${cleaned}`; // Add missing +
  return null; // Not an Aus mobile
}
