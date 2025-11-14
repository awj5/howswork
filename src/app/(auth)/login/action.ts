"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const base = process.env.NODE_ENV === "production" ? "https://app.moodcheck.co" : "http://localhost:3000";
  const emailRedirectTo = `${base}/callback?return_to=${encodeURIComponent(formData.get("return_to") as string)}`;
  let email = formData.get("email") as string;
  email = email.trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Form is invalid." };

  // Send magic link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error(error);
    return { error: "No account found for this email." };
  }

  return { success: true };
}
