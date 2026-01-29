import { Dispatch, SetStateAction } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import IssuesData from "@/data/issues.json";
import { Input, InputGroup } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SearchProps = {
  query: string | undefined;
  setQuery: Dispatch<SetStateAction<string | undefined>>;
  filter: string | undefined;
  setFilter: Dispatch<SetStateAction<string | undefined>>;
};

export default function Search(props: SearchProps) {
  return (
    <div className="mt-4 flex max-w-xl gap-4">
      <div className="flex-1">
        <InputGroup>
          <MagnifyingGlassIcon />

          <Input
            value={props.query ?? ""}
            onChange={(e) => props.setQuery(e.target.value)}
            placeholder="Search by tracking number&hellip;"
            aria-label="Search by tracking number"
          />
        </InputGroup>
      </div>

      <div className="max-sm:hidden">
        <Select value={props.filter} onChange={(e) => props.setFilter(e.target.value)}>
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
