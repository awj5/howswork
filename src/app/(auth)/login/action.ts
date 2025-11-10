"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  // Send magic link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `https://board.moodcheck.co/callback`,
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}
