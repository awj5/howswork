"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";

let cachedCount = 0;

export default function ConcernCount() {
  const supabase = createClient();
  const pathname = usePathname();
  const companies = useCompanies();
  const [count, setCount] = useState(cachedCount);

  useEffect(() => {
    if (!companies.length) return;

    const getConcerns = async () => {
      const { data: concernsData, error: concernsError } = await supabase
        .from("concerns")
        .select("id")
        .eq("company_id", companies[0].id);

      if (concernsError) {
        console.error(concernsError);
        return;
      }

      const concernIDs = concernsData.map((i) => i.id);

      // Get status of concerns
      const { data: concernStatusData, error: concernStatusError } = await supabase
        .from("concern_status")
        .select("concern_id, status, created_at")
        .in("concern_id", concernIDs);

      if (concernStatusError) {
        console.error(concernStatusError);
        return;
      }

      // Get current status of concerns
      const latestStatusByConcern = new Map<number, { status: number; created_at: string }>();

      for (const row of concernStatusData) {
        const existing = latestStatusByConcern.get(row.concern_id);
        if (!existing || row.created_at > existing.created_at) latestStatusByConcern.set(row.concern_id, row);
      }

      // Calculate count of concerns with no status or current status 1
      const concernsWithStatus1 = [...latestStatusByConcern.values()].filter((i) => i.status === 1);
      const concernIDsWithStatus = new Set(concernStatusData.map((i) => i.concern_id));
      const concernsWithoutStatus = concernIDs.filter((id) => !concernIDsWithStatus.has(id));
      const newCount = concernsWithStatus1.length + concernsWithoutStatus.length;
      cachedCount = newCount;
      setCount(newCount);
    };

    getConcerns();
  }, [companies, pathname]);

  return (
    <span
      className={`${!count && "hidden"} fade-in h-4 min-w-4 rounded-full bg-red-500 px-1 py-0.5 text-center text-xs leading-none text-white`}
    >
      {count}
    </span>
  );
}
