import { Dispatch, SetStateAction, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import IssuesData from "@/data/issues.json";
import { Input, InputGroup } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SearchProps = {
  query: string | undefined;
  setQuery: Dispatch<SetStateAction<string | undefined>>;
};

export default function Search(props: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="mt-4 flex max-w-xl gap-4">
      <div className="flex-1">
        <InputGroup>
          <MagnifyingGlassIcon />

          <Input
            value={props.query ?? ""}
            onChange={(e) => props.setQuery(e.target.value)}
            placeholder="Tracking number"
            aria-label="Tracking number"
          />
        </InputGroup>
      </div>

      <div className="max-sm:hidden">
        <Select
          value={searchParams.get("issue") ?? ""}
          onChange={(e) => router.push(`/concerns${e.target.value ? `?issue=${e.target.value}` : ""}`)}
        >
          <option value="">All issues</option>

          {IssuesData.map((issue) => (
            <option key={issue.id} value={issue.id}>
              {issue.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
