import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function validateReturnTo(path: string | null) {
  const defaultPath = "/";
  if (!path) return defaultPath;
  if (path.startsWith("/") && !path.startsWith("//")) return path; // Only allow paths starting with / but not //
  return defaultPath;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code"); // From magic link

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const returnTo = validateReturnTo(searchParams.get("return_to")); // Validate redirect
      redirect(returnTo);
    }

    console.error(error);
  }

  redirect("/error");
}
