"use server";

import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const base = process.env.NODE_ENV === "production" ? "https://app.moodcheck.co" : "http://localhost:3000";
  const emailRedirectTo = `${base}/callback?return_to=${encodeURIComponent(formData.get("return_to") as string)}`;
  let email = formData.get("email") as string;
  email = email.trim().toLowerCase();
  let firstName = formData.get("first_name") as string;
  firstName = firstName.trim();
  let lastName = formData.get("last_name") as string;
  lastName = lastName.trim();
  let company = formData.get("company") as string;
  company = company.trim();
  if (!email || !email.includes("@") || !firstName || !lastName || !company) return { error: "Form is invalid." };

  // Generate a random password since users will only sign in via magic link
  const password = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const data = {
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        company,
      },
    },
  };

  // Sign up
  const { error: signUpError } = await supabase.auth.signUp(data);

  if (signUpError) {
    console.error(signUpError);
    return { error: "This email already has an account." };
  }

  // Send magic link
  const { error: signInError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (signInError) {
    console.error(signInError);
    return { error: "No account found for this email." };
  }

  return { success: true };
}
