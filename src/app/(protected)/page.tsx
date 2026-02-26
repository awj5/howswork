"use client";

import { useEffect, useState } from "react";
import type { RiskType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Heading } from "@/components/ui/heading";
import Risks from "@/components/dashboard/Risks";

export default function Home() {
  const companies = useCompanies();
  const [risks, setRisks] = useState<RiskType[]>();

  useEffect(() => {
    if (!companies.length) return;

    const getRisks = async () => {
      const supabase = createClient();

      const { data: risksData, error: risksError } = await supabase
        .from("risks")
        .select("id, status, date_raised, date_reviewed, date_resolved")
        .eq("company_id", companies[0].id)
        .order("date_raised", { ascending: true });

      if (risksError) {
        console.error(risksError);
        return;
      }

      setRisks(risksData);
    };

    getRisks();
  }, [companies]);

  return (
    <div className="mx-auto max-w-6xl">
      {risks !== undefined && (
        <div className="fade-in">
          <div className="flex h-12 items-end sm:h-10">
            <Heading>{companies[0]?.name}</Heading>
          </div>

          <Risks data={risks} setData={setRisks} />
        </div>
      )}
    </div>
  );
}
