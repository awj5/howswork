"use server";

import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const base = process.env.NODE_ENV === "production" ? "https://app.moodcheck.co" : "http://localhost:3000";
  const emailRedirectTo = `${base}/callback?return_to=${encodeURIComponent(formData.get("return_to") as string)}`;

  const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const data = {
    email: formData.get("email") as string,
    password: randomPassword,
    options: {
      data: {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        company: formData.get("company"),
      },
    },
  };

  const { error: signUpError } = await supabase.auth.signUp(data);
  if (signUpError) return { error: signUpError.message };

  // Send magic link
  const { error: signInError } = await supabase.auth.signInWithOtp({
    email: formData.get("email") as string,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (signInError) return { error: signInError.message };
  return { success: true };
}
