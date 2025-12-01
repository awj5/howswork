"use client";

import { useCompanies } from "@/hooks/useCompanies";
import { Heading } from "@/components/heading";

export default function Home() {
  const companies = useCompanies();

  return <Heading>{companies[0]?.name}</Heading>;
}
