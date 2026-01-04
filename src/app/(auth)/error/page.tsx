"use client";

import { useEffect, useState } from "react";
import { Text, TextLink } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";

export default function Error() {
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
            <Heading className="text-red-600! dark:text-red-500!">{error}</Heading>

            <Text>
              Please <TextLink href="/login">sign in</TextLink> again.
            </Text>
          </>
        )}
      </div>
    </main>
  );
}
