"use client";

import { useParams } from "next/navigation";
import { Heading } from "@/components/heading";

export default function CheckIn() {
  const params = useParams<{ id: string }>();

  return <Heading>Check-In {params.id}</Heading>;
}
