"use client";

import { useCompanies } from "@/hooks/useCompanies";
import { Heading } from "@/components/ui/heading";

export default function Home() {
  const companies = useCompanies();

  return (
    <div className="flex h-12 items-end sm:h-10">
      <Heading>{companies[0]?.name}</Heading>
    </div>
  );
}

/*
- Add people first and then schedule your pulse checks start date to get started
- Key insights (no. of concerns reported)
- Trends (hazard category changes over time and AI insights)
- Pulse check participation over time
- Filter by date and pulse check period
- AI recommendations
- “What needs attention today”
*/
