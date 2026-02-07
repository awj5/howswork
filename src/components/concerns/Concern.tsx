import { useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import StatusData from "@/data/status.json";
import type { ConcernType } from "@/types";
import { concernStatusColor } from "@/utils/helpers";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type ConcernProps = {
  data: ConcernType;
  timezone: string;
};

export default function Concern(props: ConcernProps) {
  const searchParams = useSearchParams();
  const date = DateTime.fromISO(props.data.created_at); // Convert to date object
  const status = props.data.status ?? 0; // Latest status or default to "Awaiting review"

  return (
    <TableRow href={`/concerns/${props.data.id}${searchParams.size ? `?${searchParams.toString()}` : ""}`}>
      <TableCell className={"font-medium"}>HW-{props.data.tracking}</TableCell>

      <TableCell>
        <time className="lg:hidden">{date.setZone(props.timezone).toFormat("ccc, dd LLL yyyy, h:mm a")}</time>
        <time className="hidden lg:inline">{date.setZone(props.timezone).toFormat("cccc, dd LLLL yyyy, h:mm a")}</time>
      </TableCell>

      <TableCell>
        <Badge color={concernStatusColor(status)}>{StatusData.find((i) => i.id === status)?.title}</Badge>
      </TableCell>
    </TableRow>
  );
}
