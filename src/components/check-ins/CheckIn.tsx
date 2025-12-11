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
  const startDT = DateTime.fromISO(props.data.start).toUTC(); // Convert to date object (UTC)
  const nextStartDT = startDT.plus({ days: props.data.repeat });
  const isScheduled = props.data.status === "Scheduled";
  const repeatWeeks = props.data.repeat / 7;
  const repeatText = repeatWeeks === 1 ? "Weekly" : repeatWeeks ? `${repeatWeeks} weeks` : "None";

  return (
    <>
      {/* Extra row previewing next when open check-in repeats */}
      {props.data.status === "Open" && props.data.repeat ? (
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
      ) : null}

      <TableRow href={isScheduled ? undefined : `/check-ins/${props.data.id}`}>
        <TableCell className={`font-medium ${isScheduled && "text-zinc-500"}`}>
          <div className="flex items-center gap-1.5">
            {startDT.setZone(props.timezone).toFormat("dd LLL yyyy, h:mm a")}
            {props.data.repeat && isScheduled ? <ArrowPathIcon className="size-5" /> : null}
          </div>
        </TableCell>

        <TableCell className={`${isScheduled && "text-zinc-500"}`}>{repeatText}</TableCell>
        <TableCell className={`${isScheduled && "text-zinc-500"}`}>{!isScheduled ? props.data.pin : "-"}</TableCell>

        <TableCell>
          <Badge color={props.data.status === "Closed" ? "green" : isScheduled ? "zinc" : "amber"}>
            {props.data.status}
          </Badge>
        </TableCell>

        <TableCell className="text-right">
          <Button
            onClick={() => props.confirmRemoveClick(props.data)}
            className={`${!isScheduled && "pointer-events-none invisible"}`}
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
