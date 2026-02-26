"use client";

import { useState } from "react";
import type { DashboardStatType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { Heading } from "@/components/ui/heading";
import Risks from "@/components/dashboard/Risks";

export default function Home() {
  const companies = useCompanies();
  const [riskStats, setRiskStats] = useState<DashboardStatType[]>([]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex h-12 items-end sm:h-10">
        <Heading>{companies[0]?.name}</Heading>
      </div>

      <Risks data={riskStats} setData={setRiskStats} />
    </div>
  );
}
