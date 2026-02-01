import { DateTime } from "luxon";
import {
  HandRaisedIcon,
  CheckIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  ArchiveBoxIcon,
  CalendarDaysIcon,
} from "@heroicons/react/20/solid";
import StatusData from "@/data/status.json";
import type { ConcernActivityType } from "@/types";
import { Text } from "@/components/ui/text";

type EventProps = {
  data: ConcernActivityType;
};

const icons = {
  userComment: ChatBubbleOvalLeftEllipsisIcon,
  adminComment: UserIcon,
  status0: HandRaisedIcon,
  status1: ClockIcon,
  status2: EyeIcon,
  status3: CalendarDaysIcon,
  status4: CheckIcon,
  status5: ArchiveBoxIcon,
};

export default function Event(props: EventProps) {
  const date = DateTime.fromISO(props.data.created_at); // Convert to date object
  const status = props.data.status ?? null;

  const Icon = props.data.comment
    ? props.data.admin_name
      ? icons["adminComment"]
      : icons["userComment"]
    : icons[("status" + status) as keyof typeof icons];

  const iconBgColor =
    status === 1
      ? "bg-red-500"
      : status === 2 || status === 3
        ? "bg-amber-500"
        : status === 4
          ? "bg-green-500"
          : "bg-gray-100 dark:bg-zinc-800";

  const iconColor = status && status < 5 ? "text-white" : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex gap-3">
      <div
        className={`flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-zinc-900 ${iconBgColor}`}
      >
        <Icon className={`size-5 ${iconColor}`} aria-hidden="true" />
      </div>

      <div className="flex flex-1 justify-between gap-4 pt-1">
        <Text>
          {status === 0 ? (
            "You raised this concern"
          ) : status ? (
            <>
              Status was updated to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {StatusData.find((i) => i.id === status)?.title}
              </span>
            </>
          ) : (
            <>
              <span className="block font-medium text-gray-900 dark:text-white">
                {props.data.admin_name ?? "You"} commented
              </span>

              <span className="whitespace-pre-line">{props.data.comment}</span>
            </>
          )}
        </Text>

        <Text className="whitespace-nowrap">
          {date
            .toLocal()
            .toRelative()
            ?.replace(/ days?/, "d")
            .replace(/ weeks?/, "w")
            .replace(/ months?/, "mo")
            .replace(/ years?/, "y")
            .replace(/ hours?/, "h")
            .replace(/ minutes?/, "m")
            .replace(/ seconds?/, "s")}
        </Text>
      </div>
    </div>
  );
}
