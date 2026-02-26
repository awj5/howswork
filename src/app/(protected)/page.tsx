"use client";

import { useCompanies } from "@/hooks/useCompanies";
import { Heading } from "@/components/ui/heading";
import Risks from "@/components/dashboard/Risks";

export default function Home() {
  const companies = useCompanies();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex h-12 items-end sm:h-10">
        <Heading>{companies[0]?.name}</Heading>
      </div>

      <Risks />
    </div>
  );
}
