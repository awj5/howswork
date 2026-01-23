"use client";

import { useParams } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import Breadcrumb from "@/components/Breadcrumb";

export default function CheckIn() {
  const params = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumb href="/check-ins">Check-ins</Breadcrumb>

      <div className="flex h-12 items-end sm:h-auto lg:mt-8">
        <Heading>Check-In {params.id}</Heading>
      </div>
    </div>
  );
}
