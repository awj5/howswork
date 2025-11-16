"use server";

import { createClient } from "@/utils/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const base = process.env.NODE_ENV === "production" ? "https://app.psychsignal.work" : "http://localhost:3000";
  const emailRedirectTo = `${base}/callback?return_to=/`;
  let email = formData.get("email") as string;
  email = email.trim().toLowerCase();
  let firstName = formData.get("first_name") as string;
  firstName = firstName.trim();
  let lastName = formData.get("last_name") as string;
  lastName = lastName.trim();
  let company = formData.get("company") as string;
  company = company.trim();
  if (!email.includes("@") || !firstName || !lastName || !company) return { error: "Form is invalid." };

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
  if (signUpError) return { error: signUpError.message };
  await supabase.auth.signOut(); // Sign out new user

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
