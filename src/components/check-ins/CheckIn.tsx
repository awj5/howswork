import { useSearchParams } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { DateTime } from "luxon";
import type { CheckInType } from "@/types";
import { checkInStatusText } from "@/utils/helpers";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CheckInProps = {
  data: CheckInType;
  timezone: string;
  disabled: boolean;
};

export default function CheckIn(props: CheckInProps) {
  const searchParams = useSearchParams();
  const startDT = DateTime.fromISO(props.data.start); // Convert to date object
  const repeatWeeks = props.data.repeat / 7;
  const repeatText = repeatWeeks === 1 ? "Weekly" : repeatWeeks ? `${repeatWeeks} weeks` : "None";

  return (
    <TableRow href={`/assessments/${props.data.id}${searchParams.size ? `?${searchParams.toString()}` : ""}`}>
      <TableCell className={`font-medium ${props.data.status === 1 && "text-zinc-500 dark:text-zinc-400"}`}>
        <span className="inline-flex items-center gap-1.5">
          <time className="lg:hidden">{startDT.setZone(props.timezone).toFormat("ccc, dd LLL yyyy, h:mm a")}</time>

          <time className="hidden lg:inline">
            {startDT.setZone(props.timezone).toFormat("cccc, dd LLLL yyyy, h:mm a")}
          </time>

          {!!(props.data.repeat && props.data.status !== 3) && <ArrowPathIcon className="size-5" />}
        </span>
      </TableCell>

      <TableCell className={`${props.data.status === 1 && "text-zinc-500 dark:text-zinc-400"}`}>{repeatText}</TableCell>

      <TableCell className={`${props.data.status === 1 && "text-zinc-500 dark:text-zinc-400"}`}>
        {props.data.contact_count ?? "—"}
      </TableCell>

      <TableCell>
        <Badge color={props.data.status === 3 ? "green" : props.data.status === 2 ? "amber" : "zinc"}>
          {checkInStatusText(props.data.status)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
