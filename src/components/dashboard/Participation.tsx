import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { DateTime } from "luxon";
import { CheckInType } from "@/types";

type ParticipationProps = {
  checkIns: CheckInType[] | undefined;
  timezone: string;
};

export default function Participation(props: ParticipationProps) {
  const data = props.checkIns?.filter((i) => i.status !== 1); // Exclude scheduled

  return (
    <div>
      <div className="text-lg/6 font-medium sm:text-sm/6">Participation</div>

      <AreaChart
        className="mt-6 h-64 [&_*]:outline-none"
        margin={{
          top: 12,
          right: 8,
          left: 12,
          bottom: 0,
        }}
        responsive
        data={data}
      >
        <XAxis
          dataKey="start"
          tickFormatter={(val) =>
            DateTime.fromISO(val, { zone: props.timezone }).toLocaleString({
              year: "2-digit",
              month: "numeric",
              day: "numeric",
            })
          }
          tick={{ dy: 8, className: "fill-zinc-500 text-xs dark:fill-zinc-400 font-medium" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          width="auto"
          tick={{ className: "fill-zinc-500 text-xs dark:fill-zinc-400" }}
          axisLine={false}
          tickLine={false}
        />

        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--chart-tooltip-bg)",
            border: "none",
            borderRadius: "var(--radius-lg)",
          }}
          labelStyle={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}
          itemStyle={{ fontSize: "var(--text-sm)" }}
          labelFormatter={(val) => DateTime.fromISO(val, { zone: props.timezone }).toLocaleString(DateTime.DATE_FULL)}
          separator=": "
          cursor={{ stroke: "var(--chart-grid)" }}
        />

        <Legend wrapperStyle={{ fontSize: "var(--text-sm)" }} />
        <Area dataKey="contact_count" name="Invited" stroke="#71717a" fill="#71717a" fillOpacity={0.2} />
        <Area dataKey="feedback" name="Participated" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
      </AreaChart>
    </div>
  );
}
