import { Dispatch, SetStateAction } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import IssuesData from "@/data/issues.json";
import { Select } from "@/components/ui/select";

type FiltersProps = {
  sort: string;
  setSort: Dispatch<SetStateAction<string>>;
  disabled: boolean;
};

export default function Filters(props: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="mt-4 flex max-w-md gap-4">
      <div className="flex-1">
        <Select
          value={searchParams.get("issue") ?? ""}
          onChange={(e) => router.push(`/risk-register${e.target.value ? `?issue=${e.target.value}` : ""}`)}
        >
          <option value="">All issues</option>

          {IssuesData.map((issue) => (
            <option key={issue.id} value={issue.id}>
              {issue.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="max-sm:hidden">
        <Select value={props.sort} onChange={(e) => props.setSort(e.target.value)}>
          <option value="status">Sort by status</option>
          <option value="date">Sort by date</option>
          <option value="level">Sort by risk level</option>
        </Select>
      </div>
    </div>
  );
}
