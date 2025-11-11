"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <p>Hello</p>
      <button onClick={handleLogout} className="mt-4 rounded bg-gray-200 px-3 py-2 hover:bg-gray-300">
        Logout
      </button>
    </>
  );
}
