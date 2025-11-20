"use client";

import { useCompany } from "@/hooks/useCompany";
import { Heading } from "@/components/heading";

export default function Home() {
  const company = useCompany();

  return <Heading>{company?.name}</Heading>;
}
