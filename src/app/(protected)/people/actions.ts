"use server";

import PlansData from "@/data/plans.json";
import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";
import { isValidPhone } from "@/utils/helpers";

export async function updateStaff(companyID: number, contacts: string[]) {
  const supabase = await createClient();

  // Get company
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("id, name, timezone")
    .eq("id", companyID)
    .single();

  if (companyError) {
    console.error(companyError.message);
    return { error: "Internal server error" };
  }

  // Get company plan
  const { data: companyPlanData, error: companyPlanError } = await supabase
    .from("company_plan")
    .select("id, plan_id")
    .eq("company_id", companyID)
    .single();

  if (companyPlanError) {
    console.error(companyPlanError.message);
    return { error: "Internal server error" };
  }

  const isAus = companyData.timezone.includes("Australia");

  // Normalize mobile numbers
  const normalizedContacts = contacts.map((contact) => {
    // Check if phone number
    if (!contact.includes("@")) {
      const normalized = normalizeNumber(contact, companyData.timezone);
      return normalized ?? contact.replace(/[\s\-\(\)]/g, ""); // Keep original if not changed (remove all spaces, dashes, parentheses)
    }

    return contact;
  });

  if (contacts.length && normalizedContacts.length < 3) return { error: "At least 3 contacts are required" };

  // Check if within plan limit
  const plan = PlansData.find((i) => i.id === companyPlanData.plan_id);
  const hasPhoneContacts = normalizedContacts.some((i) => isValidPhone(i));

  if (hasPhoneContacts && !plan?.sms) {
    return { error: "Your plan doesn\u2019t support SMS. Remove mobile numbers or upgrade to enable it." };
  } else if (plan && !plan.unlimited && contacts.length && normalizedContacts.length > plan.limit) {
    return { error: `Your plan supports up to ${plan.limit} staff contacts. Remove some or upgrade to add more.` };
  }

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
    const subject = `${companyData.name} uses HowsWork`;
    const html = `<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
  <tbody>
    <tr>
      <td
        style="
          font-family:
            ui-sans-serif, system-ui, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;,
            &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;;
        "
      >
        <table
          align="center"
          width="100%"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="max-width: 37.5em; padding-bottom: 24px; padding-top: 24px"
        >
          <tbody>
            <tr style="width: 100%">
              <td>
                <img
                  alt="HowsWork"
                  height="32"
                  src="https://howswork.app/img/email-icon.png"
                  style="display: block; outline: none; border: none; text-decoration: none"
                  width="32"
                />
                <p style="font-size: 16px; line-height: 24px; margin-top: 16px; margin-bottom: 16px">Hi there,</p>
                <p style="font-size: 16px; line-height: 24px; margin-top: 16px; margin-bottom: 16px">
                  <strong>${companyData.name}</strong> uses <strong>HowsWork</strong> to give you a safe, anonymous way to share
                  how things are going at work and raise any concerns.
                </p>
                <p style="font-size: 16px; line-height: 24px; margin-top: 16px; margin-bottom: 16px">
                You&#x27;ll receive a quick check-in soon. After your first check-in, you can also raise a concern at any time. Your responses are always anonymous and can never be traced back to you.
                </p>
                <p
                  style="
                    font-size: 16px;
                    line-height: 24px;
                    color: rgb(79, 57, 246);
                    margin-top: 16px;
                    margin-bottom: 16px;
                  "
                >
                  <strong>No login. No tracking. Fully encrypted.</strong>
                </p>
                <p style="font-size: 14px; line-height: 20px; margin-top: 16px; margin-bottom: 16px">
                  <a
                    href="https://howswork.app/articles/how-howswork-protects-your-privacy/"
                    style="color: #067df7; text-decoration-line: none"
                    target="_blank"
                    >Learn more about how HowsWork protects your privacy</a
                  >
                </p>
                <hr
                  style="width: 100%; border: none; border-top: 1px solid #eaeaea; border-color: rgb(16, 24, 40, 10%)"
                />
                <p
                  style="
                    font-size: 12px;
                    line-height: 16px;
                    color: rgb(74, 85, 101);
                    margin-top: 16px;
                    margin-bottom: 16px;
                  "
                >
                  HowsWork${isAus ? " Pty Ltd" : ""}<br />Questions? Contact us at support@howswork.app
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
`;

    if (emails.length) {
      const emailRecords = emails.map((email) => ({
        to_email: email,
        from_email,
        subject,
        html,
        company_id: companyData.id,
      }));

      const { error: emailQueueError } = await supabaseAdmin.from("email_queue").insert(emailRecords);
      if (emailQueueError) throw emailQueueError;
    }

    // Send SMS
    const phoneNumbers = newContacts.filter((contact) => !contact.includes("@"));
    const smsMessage = `Welcome to HowsWork

${companyData.name} uses HowsWork so you can share how things are going and raise any concerns, completely anonymous.

You'll receive a quick check-in soon. No app or sign-up needed.`;

    if (phoneNumbers.length) {
      const smsRecords = phoneNumbers.map((phone) => ({
        phone_number: phone,
        message: smsMessage,
        company_id: companyData.id,
      }));

      const { error: smsQueueError } = await supabaseAdmin.from("sms_queue").insert(smsRecords);
      if (smsQueueError) throw smsQueueError;
    }
  } catch (error) {
    console.error(error);
  }

  return { success: true };
}

function normalizeNumber(number: string, timezone: string) {
  let cleaned = number.replace(/[\s\-\(\)]/g, ""); // Remove all spaces, dashes, parentheses

  if (timezone.includes("Australia")) {
    if (cleaned.startsWith("04") && cleaned.length === 10) return `+61${cleaned.substring(1)}`; // Convert 04 to +614
    if (cleaned.startsWith("614") && cleaned.length === 11) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+614") && cleaned.length === 12) return cleaned; // Already in correct format
  }

  if (timezone.includes("America")) {
    if (cleaned.length === 10 && !cleaned.startsWith("+")) return `+1${cleaned}`; // 10-digit local → +1XXXXXXXXXX
    if (cleaned.startsWith("1") && cleaned.length === 11) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+1") && cleaned.length === 12) return cleaned; // Already in correct format
  }

  if (timezone === "Europe/London") {
    if (cleaned.startsWith("0") && cleaned.length === 11) return `+44${cleaned.substring(1)}`; // Convert 07... to +447...
    if (cleaned.startsWith("44") && cleaned.length === 12) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+44") && cleaned.length === 13) return cleaned; // Already in correct format
  }

  if (timezone === "Europe/Dublin") {
    if (cleaned.startsWith("0") && (cleaned.length === 9 || cleaned.length === 10))
      return `+353${cleaned.substring(1)}`; // Convert 08... to +3538...

    if (cleaned.startsWith("353") && (cleaned.length === 11 || cleaned.length === 12)) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+353") && (cleaned.length === 12 || cleaned.length === 13)) return cleaned; // Already in correct format
  }

  if (timezone === "Pacific/Auckland") {
    if (cleaned.startsWith("0") && (cleaned.length === 9 || cleaned.length === 10)) return `+64${cleaned.substring(1)}`; // Convert 02... to +642...
    if (cleaned.startsWith("64") && (cleaned.length === 10 || cleaned.length === 11)) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+64") && (cleaned.length === 11 || cleaned.length === 12)) return cleaned; // Already in correct format
  }

  if (timezone === "Asia/Singapore") {
    if (cleaned.length === 8 && !cleaned.startsWith("+")) return `+65${cleaned}`; // 8-digit local → +65XXXXXXXX
    if (cleaned.startsWith("65") && cleaned.length === 10) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+65") && cleaned.length === 11) return cleaned; // Already in correct format
  }

  if (timezone === "Asia/Hong_Kong") {
    if (cleaned.length === 8 && !cleaned.startsWith("+")) return `+852${cleaned}`; // 8-digit local → +852XXXXXXXX
    if (cleaned.startsWith("852") && cleaned.length === 11) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+852") && cleaned.length === 12) return cleaned; // Already in correct format
  }

  if (timezone === "Africa/Johannesburg") {
    if (cleaned.startsWith("0") && cleaned.length === 10) return `+27${cleaned.substring(1)}`; // Convert 08... to +278...
    if (cleaned.startsWith("27") && cleaned.length === 11) return `+${cleaned}`; // Add missing +
    if (cleaned.startsWith("+27") && cleaned.length === 12) return cleaned; // Already in correct format
  }

  return null; // Not changed
}
