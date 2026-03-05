import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { DateTime } from "luxon";
import { CheckInType } from "@/types";

type CheckInsProps = {
  data: CheckInType[] | undefined;
  timezone: string;
};

export default function CheckIns(props: CheckInsProps) {
  // Add sentiment score to data
  const chartData = props.data?.map((checkIn) => {
    const sentimentScore = checkIn.sentiments?.length
      ? Math.round(
          (checkIn.sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / (checkIn.sentiments.length * 5)) * 100
        )
      : null;

    return { ...checkIn, sentimentScore };
  });

  return (
    <div>
      <div className="text-lg/6 font-medium sm:text-sm/6">Check-ins</div>

      <AreaChart
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
          dataKey="start"
          padding={{ left: 28, right: 28 }}
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
          yAxisId="count"
          width="auto"
          tick={{ className: "fill-zinc-500 text-xs dark:fill-zinc-400" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <YAxis yAxisId="percentage" domain={[0, 100]} hide />
        <CartesianGrid yAxisId="count" vertical={false} stroke="var(--chart-grid)" />

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--chart-bg)",
            border: "none",
            borderRadius: "var(--radius-lg)",
          }}
          labelStyle={{ fontSize: "var(--text-sm)", padding: 0, paddingBottom: "calc(var(--spacing) * 1)" }}
          itemStyle={{ fontSize: "var(--text-xs)", padding: 0 }}
          labelFormatter={(val) => DateTime.fromISO(val, { zone: props.timezone }).toLocaleString(DateTime.DATE_FULL)}
          separator=": "
          cursor={{ stroke: "var(--chart-grid)" }}
        />

        <Legend wrapperStyle={{ fontSize: "var(--text-sm)", paddingTop: "calc(var(--spacing) * 2)" }} />

        <Area
          yAxisId="count"
          type="monotone"
          dataKey="contact_count"
          name="Invited"
          stroke="#71717a"
          fill="#71717a"
          fillOpacity={0.3}
          dot={{ r: 4, fill: "var(--chart-bg)", fillOpacity: 1 }}
          activeDot={{ r: 4, stroke: "#71717a", strokeWidth: 1 }}
        />

        <Area
          yAxisId="count"
          type="monotone"
          dataKey={(item: CheckInType) => item.sentiments?.length}
          name="Participated"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.3}
          dot={{ r: 4, fill: "var(--chart-bg)", fillOpacity: 1 }}
          activeDot={{ r: 4, stroke: "#6366f1", strokeWidth: 1 }}
        />

        <Area
          yAxisId="percentage"
          type="linear"
          dataKey="sentimentScore"
          name="Sentiment"
          unit="%"
          stroke="#eab308"
          fill="#eab308"
          fillOpacity={0}
          dot={({ cx = 0, cy = 0, key, payload }) => {
            if (!payload.sentimentScore) return <g key={key} />;
            const emoji = Math.min(5, Math.ceil(payload.sentimentScore / 20)) || 1; // eg. 0-20 = 1, 81-100 = 5
            return <image key={key} href={`/img/emoji-${emoji}.svg`} x={cx - 10} y={cy - 10} width={20} height={20} />;
          }}
          activeDot={false}
        />
      </AreaChart>
    </div>
  );
}
