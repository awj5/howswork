"use server";

import { baseURL, isValidEmail } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";

export async function signUp(formData: FormData) {
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
  if (!isValidEmail(email) || !first_name || !last_name || !company) return { error: "Form is invalid." };
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
  return { success: true };
}
