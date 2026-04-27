import { DashboardStatType } from "@/types";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";

type StatProps = {
  data: DashboardStatType;
};

export default function Stat(props: StatProps) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{props.data.title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{props.data.primary}</div>

      {props.data.secondary && (
        <div className="mt-3 flex items-center gap-1">
          <Badge color={props.data.badgeColor}>{props.data.secondary}</Badge>
          <span className="text-sm/6 text-zinc-500 sm:text-xs/6 dark:text-zinc-400">{props.data.secondaryText}</span>
        </div>
      )}
    </div>
  );
}
