import { XCircleIcon } from "@heroicons/react/16/solid";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { DateTime } from "luxon";
import type { CheckInType } from "@/types";
import { Button } from "@/components/button";
import { TableCell, TableRow } from "@/components/table";
import { Badge } from "@/components/badge";

type CheckInProps = {
  data: CheckInType;
  timezone: string;
  disabled: boolean;
  confirmRemoveClick: (checkIn: CheckInType, cancelRepeat?: boolean) => void;
};

export default function CheckIn(props: CheckInProps) {
  const nowUTC = DateTime.utc();
  const startDT = DateTime.fromISO(props.data.start).toUTC(); // Convert to date object (UTC)
  const inFuture = startDT.toMillis() > nowUTC.toMillis(); // Check if scheduled for future
  const nextStartDT = startDT.plus({ days: props.data.repeat });
  const repeatWeeks = props.data.repeat / 7;
  const repeatText = repeatWeeks === 1 ? "Weekly" : repeatWeeks ? `${repeatWeeks} weeks` : "None";

  return (
    <>
      {/* Extra row previewing next when open check-in repeats */}
      {props.data.status === "Open" && props.data.repeat && (
        <TableRow>
          <TableCell className="font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              {nextStartDT.setZone(props.timezone).toFormat("dd LLL yyyy, h:mm a")}
              <ArrowPathIcon className="size-5" />
            </div>
          </TableCell>

          <TableCell className="text-zinc-500">{repeatText}</TableCell>
          <TableCell className="text-zinc-500">-</TableCell>

          <TableCell>
            <Badge color="zinc">Upcoming</Badge>
          </TableCell>

          <TableCell className="text-right">
            <Button onClick={() => props.confirmRemoveClick(props.data, true)} disabled={props.disabled} outline>
              <XCircleIcon />
              Remove
            </Button>
          </TableCell>
        </TableRow>
      )}

      <TableRow href={inFuture ? undefined : `/check-ins/${props.data.id}`}>
        <TableCell className={`font-medium ${inFuture && "text-zinc-500"}`}>
          <div className="flex items-center gap-1.5">
            {startDT.setZone(props.timezone).toFormat("dd LLL yyyy, h:mm a")}
            {props.data.repeat && inFuture ? <ArrowPathIcon className="size-5" /> : null}
          </div>
        </TableCell>

        <TableCell className={`${inFuture && "text-zinc-500"}`}>{repeatText}</TableCell>
        <TableCell className={`${inFuture && "text-zinc-500"}`}>{!inFuture ? props.data.pin : "-"}</TableCell>

        <TableCell>
          <Badge color={props.data.status === "Open" ? "amber" : inFuture ? "zinc" : "green"}>
            {props.data.status}
          </Badge>
        </TableCell>

        <TableCell className="text-right">
          <Button
            onClick={() => props.confirmRemoveClick(props.data)}
            className={`${!inFuture && "pointer-events-none invisible"}`}
            disabled={props.disabled}
            outline
          >
            <XCircleIcon />
            Remove
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}
