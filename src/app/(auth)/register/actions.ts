"use server";

import { baseURL, isValidEmail } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import supabaseAdmin from "@/utils/supabase/admin";

export async function signUp(formData: FormData) {
  if (formData.get("website")) return { success: true, hp: true }; // Honeypot
  const supabase = await createClient();
  const emailRedirectTo = `${baseURL}/callback?return_to=/`;
  let email = formData.get("email") as string;
  email = email.trim().toLowerCase();
  let first_name = formData.get("first_name") as string;
  first_name = first_name.trim();
  let last_name = formData.get("last_name") as string;
  last_name = last_name.trim();
  let company = formData.get("company") as string;
  company = company.trim().slice(0, 20);
  if (!isValidEmail(email) || !first_name || !last_name || !company) return { error: "Form is invalid" };
  const timezone = (formData.get("timezone") as string) || "Australia/Sydney"; // Fallback to Sydney

  // Generate a random password since users will only sign in via magic link
  const password = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const data = {
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        company,
        timezone,
      },
    },
  };

  // Sign up
  const { error: signUpError } = await supabase.auth.signUp(data);
  if (signUpError) return { error: signUpError.message };
  await supabase.auth.signOut(); // Sign out (user gets signed in on sign-up)

  // Send magic link
  const { error: signInError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (signInError) return { error: signInError.message };

  // Schedule welcome email
  const { error: emailQueueError } = await supabaseAdmin.from("email_queue").insert({
    to_email: email,
    from_email: "no-reply@updates.howswork.app",
    subject: "Welcome to HowsWork",
    html: `<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
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
                <p style="font-size: 16px; line-height: 24px; margin-top: 16px; margin-bottom: 16px">
                  Hi ${first_name},
                </p>
                <p style="font-size: 16px; line-height: 24px; margin-top: 16px; margin-bottom: 16px">
                  Your <strong>HowsWork</strong> account for <strong>${company}</strong> is set up and ready to go.
                </p>
                <p
                  style="
                    font-size: 20px;
                    line-height: 28px;
                    margin-bottom: 24px;
                    color: rgb(97, 95, 255);
                    margin-top: 16px;
                  "
                >
                  <strong>How to get started:</strong>
                </p>
                <table
                  align="center"
                  width="100%"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin-bottom: 24px"
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          width="100%"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                        >
                          <tbody style="width: 100%">
                            <tr style="width: 100%">
                              <td
                                width="24"
                                height="24"
                                align="center"
                                valign="top"
                                data-id="__react-email-column"
                                style="height: 24px; width: 24px; padding-right: 16px"
                              >
                                <table
                                  align="center"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                >
                                  <tbody style="width: 100%">
                                    <tr style="width: 100%">
                                      <td
                                        align="center"
                                        valign="middle"
                                        width="24"
                                        height="24"
                                        data-id="__react-email-column"
                                        style="
                                          height: 24px;
                                          width: 24px;
                                          border-radius: 9999px;
                                          background-color: rgb(97, 95 ,255);
                                          font-size: 12px;
                                          line-height: 1;
                                          font-weight: 600;
                                          color: rgb(255, 255, 255);
                                        "
                                      >
                                        1
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td valign="top" data-id="__react-email-column">
                                <p
                                  style="
                                    font-size: 16px;
                                    line-height: 24px;
                                    margin: 0px;
                                    margin-top: 0px;
                                    margin-bottom: 0px;
                                    margin-left: 0px;
                                    margin-right: 0px;
                                  "
                                >
                                  <strong>Add staff contacts</strong>
                                </p>
                                <p
                                  style="
                                    font-size: 14px;
                                    line-height: 20px;
                                    margin: 0px;
                                    color: rgb(113, 113, 123);
                                    margin-top: 0px;
                                    margin-bottom: 0px;
                                    margin-left: 0px;
                                    margin-right: 0px;
                                  "
                                >
                                  Import email addresses or mobile numbers.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table
                  align="center"
                  width="100%"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin-bottom: 24px"
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          width="100%"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                        >
                          <tbody style="width: 100%">
                            <tr style="width: 100%">
                              <td
                                width="24"
                                height="24"
                                align="center"
                                valign="top"
                                data-id="__react-email-column"
                                style="height: 24px; width: 24px; padding-right: 16px"
                              >
                                <table
                                  align="center"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                >
                                  <tbody style="width: 100%">
                                    <tr style="width: 100%">
                                      <td
                                        align="center"
                                        valign="middle"
                                        width="24"
                                        height="24"
                                        data-id="__react-email-column"
                                        style="
                                          height: 24px;
                                          width: 24px;
                                          border-radius: 9999px;
                                          background-color: rgb(97, 95 ,255);
                                          font-size: 12px;
                                          line-height: 1;
                                          font-weight: 600;
                                          color: rgb(255, 255, 255);
                                        "
                                      >
                                        2
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td valign="top" data-id="__react-email-column">
                                <p
                                  style="
                                    font-size: 16px;
                                    line-height: 24px;
                                    margin: 0px;
                                    margin-top: 0px;
                                    margin-bottom: 0px;
                                    margin-left: 0px;
                                    margin-right: 0px;
                                  "
                                >
                                  <strong>Schedule first check-in</strong>
                                </p>
                                <p
                                  style="
                                    font-size: 14px;
                                    line-height: 20px;
                                    margin: 0px;
                                    color: rgb(113, 113, 123);
                                    margin-top: 0px;
                                    margin-bottom: 0px;
                                    margin-left: 0px;
                                    margin-right: 0px;
                                  "
                                >
                                  Choose a check-in frequency. HowsWork handles the rest.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table
                  align="center"
                  width="100%"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin-bottom: 24px"
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          width="100%"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                        >
                          <tbody style="width: 100%">
                            <tr style="width: 100%">
                              <td
                                width="24"
                                height="24"
                                align="center"
                                valign="top"
                                data-id="__react-email-column"
                                style="height: 24px; width: 24px; padding-right: 16px"
                              >
                                <table
                                  align="center"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                >
                                  <tbody style="width: 100%">
                                    <tr style="width: 100%">
                                      <td
                                        align="center"
                                        valign="middle"
                                        width="24"
                                        height="24"
                                        data-id="__react-email-column"
                                        style="
                                          height: 24px;
                                          width: 24px;
                                          border-radius: 9999px;
                                          background-color: rgb(97, 95 ,255);
                                          font-size: 12px;
                                          line-height: 1;
                                          font-weight: 600;
                                          color: rgb(255, 255, 255);
                                        "
                                      >
                                        3
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td valign="top" data-id="__react-email-column">
                                <p
                                  style="
                                    font-size: 16px;
                                    line-height: 24px;
                                    margin: 0px;
                                    margin-top: 0px;
                                    margin-bottom: 0px;
                                    margin-left: 0px;
                                    margin-right: 0px;
                                  "
                                >
                                  <strong>Review your risk register</strong>
                                </p>
                                <p
                                  style="
                                    font-size: 14px;
                                    line-height: 20px;
                                    margin: 0px;
                                    color: rgb(113, 113, 123);
                                    margin-top: 0px;
                                    margin-bottom: 0px;
                                    margin-left: 0px;
                                    margin-right: 0px;
                                  "
                                >
                                  Once responses come in, HowsWork flags emerging issues and suggests next steps.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <a
                  href="https://admin.howswork.app/"
                  style="
                    line-height: 100%;
                    text-decoration: none;
                    display: inline-block;
                    max-width: 100%;
                    mso-padding-alt: 0px;
                    border-radius: 6px;
                    background-color: rgb(97, 95, 255);
                    padding-right: 16px;
                    padding-left: 16px;
                    padding-bottom: 12px;
                    padding-top: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: rgb(255, 255, 255);
                  "
                  target="_blank"
                  ><span
                    ><!--[if mso
                      ]><i style="mso-font-width: 400%; mso-text-raise: 18" hidden>&#8202;&#8202;</i><!
                    [endif]--></span
                  ><span
                    style="
                      max-width: 100%;
                      display: inline-block;
                      line-height: 120%;
                      mso-padding-alt: 0px;
                      mso-text-raise: 9px;
                    "
                    >Go to your dashboard</span
                  ><span
                    ><!--[if mso]><i style="mso-font-width: 400%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span
                  ></a
                >
                <p style="font-size: 14px; line-height: 20px; margin-top: 16px; margin-bottom: 16px">
                  <a
                    href="https://howswork.app/articles/how-howswork-uses-ai-to-help-employers-act-faster/"
                    style="color: rgb(97, 95, 255); text-decoration-line: none"
                    target="_blank"
                    >Learn more about how HowsWork uses AI to help employers act faster</a
                  >
                </p>
                <hr
                  style="width: 100%; border: none; border-top: 1px solid #eaeaea; border-color: rgb(9, 9, 11, 10%)"
                />
                <p
                  style="
                    font-size: 12px;
                    line-height: 16px;
                    color: rgb(113, 113, 123);
                    margin-top: 16px;
                    margin-bottom: 16px;
                  "
                >
                  HowsWork<br />Questions? Contact us at support@howswork.app
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
`,
  });

  if (emailQueueError) console.error(emailQueueError.message);
  return { success: true };
}
