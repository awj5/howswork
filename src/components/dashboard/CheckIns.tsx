import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceArea } from "recharts";
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

  // Use for staging
  /*const chartData = [
    {
      id: 1,
      start: "2026-02-05T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 40,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
      ],
      sentimentScore: 48,
    },
    {
      id: 2,
      start: "2026-02-12T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 42,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5,
      ],
      sentimentScore: 61,
    },
    {
      id: 3,
      start: "2026-02-19T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 41,
      sentiments: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      sentimentScore: 63,
    },
    {
      id: 4,
      start: "2026-02-26T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 44,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
      ],
      sentimentScore: 81,
    },
    {
      id: 5,
      start: "2026-03-05T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 44,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5,
      ],
      sentimentScore: 64,
    },
    {
      id: 6,
      start: "2026-03-12T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 44,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5,
      ],
      sentimentScore: 72,
    },
    {
      id: 7,
      start: "2026-03-19T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 48,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5,
      ],
      sentimentScore: 91,
    },
    {
      id: 8,
      start: "2026-03-26T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 48,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5,
      ],
      sentimentScore: 78,
    },
    {
      id: 9,
      start: "2026-04-02T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 48,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5,
      ],
      sentimentScore: 64,
    },
    {
      id: 10,
      start: "2026-04-09T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 47,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
      ],
      sentimentScore: 72,
    },
    {
      id: 11,
      start: "2026-04-16T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 48,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5,
      ],
      sentimentScore: 58,
    },
    {
      id: 12,
      start: "2026-04-23T00:00:00+00:00",
      repeat: 7,
      status: 3,
      contact_count: 49,
      sentiments: [
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
      ],
      sentimentScore: 68,
    },
  ];*/

  return (
    <div>
      <div className="text-lg/6 font-medium sm:text-sm/6">Assessment trends</div>

      <AreaChart
        className="mt-4 h-72 [&_*]:outline-none"
        margin={{
          top: 16,
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
          tickFormatter={(val) => {
            const dt = DateTime.fromISO(val, { zone: props.timezone });
            return dt.toLocaleString({
              ...(dt.year !== DateTime.now().year && { year: "2-digit" }),
              month: "numeric",
              day: "numeric",
            });
          }}
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
        <Legend wrapperStyle={{ fontSize: "var(--text-sm)", paddingTop: "calc(var(--spacing) * 2)" }} />

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--chart-bg)",
            border: "1px solid var(--chart-grid)",
            borderRadius: "var(--radius-lg)",
          }}
          labelStyle={{ fontSize: "var(--text-sm)", padding: 0, paddingBottom: "calc(var(--spacing) * 1)" }}
          itemStyle={{ fontSize: "var(--text-xs)", padding: 0 }}
          labelFormatter={(val) => DateTime.fromISO(val, { zone: props.timezone }).toLocaleString(DateTime.DATE_FULL)}
          separator=": "
          cursor={{ stroke: "var(--chart-grid)" }}
        />

        {chartData?.length === 1 && (
          <>
            <ReferenceArea
              yAxisId="count"
              y1={chartData[0].contact_count}
              shape={({ x, y, width, height }) => (
                <g>
                  <rect x={x} y={y} width={width} height={height} fill="url(#gradientInvited)" />
                  <line x1={x} y1={y} x2={x + width} y2={y} stroke="#a1a1aa" strokeWidth={1} />
                </g>
              )}
            />

            <ReferenceArea
              yAxisId="count"
              y1={chartData[0].sentiments?.length}
              shape={({ x, y, width, height }) => (
                <g>
                  <rect x={x} y={y} width={width} height={height} fill="url(#gradientParticipated)" />
                  <line x1={x} y1={y} x2={x + width} y2={y} stroke="#6366f1" strokeWidth={1} />
                </g>
              )}
            />

            <ReferenceArea
              yAxisId="percentage"
              y1={chartData[0].sentimentScore!}
              shape={({ x, y, width }) => (
                <g>
                  <line x1={x} y1={y} x2={x + width} y2={y} stroke="#FACC15" strokeWidth={2} />
                </g>
              )}
            />
          </>
        )}

        <defs>
          <linearGradient id="gradientInvited" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0.1} />
          </linearGradient>

          <linearGradient id="gradientParticipated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <Area
          yAxisId="count"
          type="natural"
          dataKey="contact_count"
          name="Invited"
          stroke="#a1a1aa"
          fill="url(#gradientInvited)"
          fillOpacity={1}
          dot={() => null}
          activeDot={{ stroke: "#a1a1aa" }}
        />

        <Area
          yAxisId="count"
          type="natural"
          dataKey={(item: CheckInType) => item.sentiments?.length}
          name="Participated"
          stroke="#6366f1"
          fill="url(#gradientParticipated)"
          fillOpacity={1}
          dot={() => null}
          activeDot={{ stroke: "#6366f1" }}
        />

        {(chartData?.length !== 1 || chartData[0].sentiments?.length) && (
          <Area
            yAxisId="percentage"
            type="linear"
            dataKey="sentimentScore"
            name="Sentiment"
            unit="%"
            stroke="#FACC15"
            strokeWidth={2}
            fill="none"
            dot={sentimentDot}
            activeDot={sentimentDot}
          />
        )}
      </AreaChart>
    </div>
  );
}

function sentimentDot({
  cx = 0,
  cy = 0,
  key,
  payload,
}: {
  cx?: number;
  cy?: number;
  key?: React.Key | null;
  payload: { sentimentScore: number };
}) {
  if (!payload.sentimentScore) return <g key={key} />;
  const emoji = Math.min(5, Math.ceil(payload.sentimentScore / 20)); // eg. 0-20 = 1, 81-100 = 5
  return <image key={key} href={`/img/emoji-${emoji}.svg`} x={cx - 10} y={cy - 10} width={20} height={20} />;
}
