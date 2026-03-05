import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DateTime } from "luxon";
import { ConcernType } from "@/types";

type ConcernsProps = {
  data: ConcernType[];
};

export default function Concerns(props: ConcernsProps) {
  // Group concerns by date
  const chartData = Object.entries(
    props.data.reduce(
      (counts, concern) => {
        const date = DateTime.fromISO(concern.created_at).toLocal().toISODate()!;
        counts[date] = (counts[date] ?? 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    )
  ).map(([date, count]) => ({ date, count }));

  return (
    <div>
      <div className="text-lg/6 font-medium sm:text-sm/6">Concerns</div>

      <BarChart
        className="mt-6 h-72 [&_*]:outline-none"
        margin={{
          top: 12,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        responsive
        data={chartData}
      >
        <XAxis
          dataKey="date"
          padding={{ left: 28, right: 28 }}
          tickFormatter={(val) =>
            DateTime.fromISO(val).toLocaleString({
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
          allowDecimals={false}
        />

        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--chart-bg)",
            border: "none",
            borderRadius: "var(--radius-lg)",
          }}
          labelStyle={{ fontSize: "var(--text-sm)", padding: 0, paddingBottom: "calc(var(--spacing) * 1)" }}
          itemStyle={{ fontSize: "var(--text-xs)", padding: 0 }}
          labelFormatter={(val) => DateTime.fromISO(val).toLocaleString(DateTime.DATE_FULL)}
          separator=": "
          cursor={false}
        />

        <Bar dataKey="count" name="Concerns" fill="#6366f1" fillOpacity={0.7} radius={[8, 8, 0, 0]} />
      </BarChart>
    </div>
  );
}
