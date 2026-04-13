"use client";

import { useEffect, useState } from "react";
import { Subheading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import Doodle from "@/components/Doodle";

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
          <div className="flex max-w-sm flex-col items-center sm:max-w-md">
            <Doodle doodles={31} />
            <Subheading className="mt-4 text-center">{error}</Subheading>

            <Button href="/" className="mt-6" outline>
              Back to dashboard
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
