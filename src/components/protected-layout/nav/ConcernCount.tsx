"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";

export default function ConcernCount() {
  const supabase = createClient();
  const pathname = usePathname();
  const companies = useCompanies();
  const [count, setCount] = useState(0);

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

      const { data: concernStatusData, error: concernStatusError } = await supabase
        .from("concern_status")
        .select("concern_id, status")
        .in("concern_id", concernIDs);

      if (concernStatusError) {
        console.error(concernStatusError);
        return;
      }

      const concernsWithStatus1 = concernStatusData.filter((i) => i.status === 1);
      const concernIDsWithStatus = new Set(concernStatusData.map((i) => i.concern_id));
      const concernsWithoutStatus = concernIDs.filter((id) => !concernIDsWithStatus.has(id));
      setCount(concernsWithStatus1.length + concernsWithoutStatus.length);
    };

    getConcerns();
  }, [companies, pathname]);

  return (
    <span
      className={`${!count && "hidden"} h-4 min-w-4 rounded-full bg-red-500 px-1 py-0.5 text-center text-xs leading-none`}
    >
      {count}
    </span>
  );
}
