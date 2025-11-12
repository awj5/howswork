"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const base = process.env.NODE_ENV === "production" ? "https://app.moodcheck.co" : "http://localhost:3000";
  const emailRedirectTo = `${base}/callback?return_to=${encodeURIComponent(formData.get("return_to") as string)}`;

  // Send magic link
  const { error } = await supabase.auth.signInWithOtp({
    email: formData.get("email") as string,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}
