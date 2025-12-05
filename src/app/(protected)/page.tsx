"use client";

import { useCompanies } from "@/hooks/useCompanies";
import { Heading } from "@/components/heading";

export default function Home() {
  const companies = useCompanies();

  return <Heading>{companies[0]?.name}</Heading>;
}

/*
- Key insights (no. of concerns reported)
- Trends (hazard category changes over time and AI insights)
- Pulse check participation over time
- Filter by date and pulse check period
- AI recommendations
- “What needs attention today”
*/
