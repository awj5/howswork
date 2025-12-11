"use client";

import { useParams } from "next/navigation";
import { Heading } from "@/components/heading";

export default function CheckIn() {
  const params = useParams<{ id: string }>();

  return (
    <div className="flex h-12 items-end sm:h-10">
      <Heading>Check-In {params.id}</Heading>
    </div>
  );
}
