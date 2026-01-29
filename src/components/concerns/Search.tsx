import { Dispatch, SetStateAction } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { Input, InputGroup } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SearchProps = {
  query: string | undefined;
  setQuery: Dispatch<SetStateAction<string | undefined>>;
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
        <Select name="status">
          <option value="all">All issues</option>
          <option value="needs_attention">Needs attention</option>
          <option value="in_progress">In progress</option>
          <option value="closed">Closed</option>
        </Select>
      </div>
    </div>
  );
}
