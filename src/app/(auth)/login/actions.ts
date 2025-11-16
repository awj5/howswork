"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const base = process.env.NODE_ENV === "production" ? "https://app.psychsignal.work" : "http://localhost:3000";
  const emailRedirectTo = `${base}/callback?return_to=${encodeURIComponent(formData.get("return_to") as string)}`;
  let email = formData.get("email") as string;
  email = email.trim().toLowerCase();
  if (!email.includes("@")) return { error: "Form is invalid." };

  // Send magic link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}
