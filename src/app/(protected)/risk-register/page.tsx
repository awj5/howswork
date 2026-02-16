"use client";

import { useState } from "react";
import { DocumentPlusIcon, ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import Filters from "@/components/risk-register/Filters";

export default function RiskRegister() {
  const [disabled, setDisabled] = useState(false);
  const [sort, setSort] = useState("status");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="fade-in">
        <div className="flex flex-col justify-between gap-x-6 gap-y-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="flex h-12 items-end sm:h-10">
              <Heading>Risk Register</Heading>
            </div>

            <Filters sort={sort} setSort={setSort} disabled={disabled} />
          </div>

          <div className="flex gap-4">
            <Button onClick={() => null} outline disabled={disabled}>
              <ArrowDownTrayIcon />
              Export
            </Button>

            <Button onClick={() => null} color="indigo" disabled={disabled}>
              <DocumentPlusIcon />
              Add risk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
