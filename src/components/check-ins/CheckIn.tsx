import Link from "next/link";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { DateTime } from "luxon";
import type { CheckInType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/ui/dropdown";

type CheckInProps = {
  data: CheckInType;
  timezone: string;
  disabled: boolean;
  confirmRemoveClick: (checkIn: CheckInType) => void;
};

export default function CheckIn(props: CheckInProps) {
  const startDT = DateTime.fromISO(props.data.start).toUTC(); // Convert to date object (UTC)
  const isScheduled = props.data.status === "Scheduled" || props.data.status === "Upcoming";
  const repeatWeeks = props.data.repeat / 7;
  const repeatText = repeatWeeks === 1 ? "Weekly" : repeatWeeks ? `${repeatWeeks} weeks` : "None";

  return (
    <TableRow>
      <TableCell className={`font-medium ${isScheduled && "text-zinc-500"}`}>
        <Link
          href={`/check-ins/${props.data.id}`}
          className={`inline-flex items-center gap-1.5 ${isScheduled && "pointer-events-none"}`}
        >
          {startDT.setZone(props.timezone).toFormat("dd LLL yyyy, h:mm a")}
          {props.data.repeat && isScheduled ? <ArrowPathIcon className="size-5" /> : null}
        </Link>
      </TableCell>

      <TableCell className={`${isScheduled && "text-zinc-500"}`}>{repeatText}</TableCell>
      <TableCell className={`${isScheduled && "text-zinc-500"}`}>{!isScheduled ? props.data.pin : "-"}</TableCell>

      <TableCell>
        <Badge color={props.data.status === "Closed" ? "green" : isScheduled ? "zinc" : "amber"}>
          {props.data.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div className="-mx-3 -my-1.5 sm:-mx-2.5">
          <Dropdown>
            <DropdownButton plain aria-label="More options">
              <EllipsisHorizontalIcon />
            </DropdownButton>

            <DropdownMenu anchor="bottom end">
              {!isScheduled && <DropdownItem href={`/check-ins/${props.data.id}`}>View results</DropdownItem>}
              {isScheduled && <DropdownItem onClick={() => props.confirmRemoveClick(props.data)}>Remove</DropdownItem>}

              {!isScheduled && props.data.status !== "Closed" && (
                <DropdownItem onClick={() => null}>Generate QR code</DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      </TableCell>
    </TableRow>
  );
}
