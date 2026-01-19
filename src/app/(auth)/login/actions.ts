"use server";

import { baseURL, isValidEmail } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const emailRedirectTo = `${baseURL}/callback?return_to=${encodeURIComponent(formData.get("return_to") as string)}`;
  let email = formData.get("email") as string;
  email = email.trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "Email is invalid" };

  // Send magic link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error(error.message);
    return { error: "No account found for this email" };
  }

  return { success: true };
}
