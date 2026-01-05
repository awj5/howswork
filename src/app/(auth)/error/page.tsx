"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Subheading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export default function Error() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // Get error description (with fallback)
    const params = new URLSearchParams(window.location.hash.slice(1)); // drops leading '#'
    const errorDescription = params.get("error_description") as string;
    setError(errorDescription ?? "Something went wrong");
  }, []);

  return (
    <main className="flex min-h-dvh flex-col p-2">
      <div className="flex grow flex-col items-center justify-center p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        {error && (
          <>
            <ExclamationTriangleIcon className="size-16 text-red-600 sm:size-12 dark:text-red-500" />
            <Subheading className="mt-2 text-center text-red-600! dark:text-red-500!">{error}</Subheading>

            <Button onClick={() => router.push("/login")} className="mt-6" outline>
              Sign in again
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
