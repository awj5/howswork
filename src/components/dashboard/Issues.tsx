import { Legend, Pie, PieChart, Tooltip } from "recharts";
import IssuesData from "@/data/issues.json";
import { CheckInIssueType } from "@/types";
import { useIsMobile } from "@/hooks/useIsMobile";

type IssuesProps = {
  data: CheckInIssueType[];
};

export default function Issues(props: IssuesProps) {
  const isMobile = useIsMobile();

  // Order issues by count
  const chartData = props.data
    .map((item) => {
      const issue = IssuesData.find((i) => i.id === item.id)!;
      return { name: issue.name, value: item.count, fill: issue.color };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <div className="text-lg/6 font-medium sm:text-sm/6">Issues flagged</div>

      <PieChart
        className="mt-6 h-72 [&_*]:outline-none"
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        responsive
      >
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          wrapperStyle={{
            top: "50%",
            left: "50%",
            transform: "translate(0, -50%)",
            fontSize: "var(--text-xs)",
          }}
          itemSorter={(item) => {
            return chartData.findIndex((i) => i.name === item.value);
          }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--chart-bg)",
            border: "none",
            borderRadius: "var(--radius-lg)",
          }}
          itemStyle={{ fontSize: "var(--text-xs)", padding: 0, color: "var(--text-foreground)" }}
          separator=": "
        />

        <Pie
          data={chartData}
          dataKey="value"
          cx="25%"
          outerRadius={isMobile ? 60 : undefined}
          stroke="var(--chart-bg)"
          startAngle={90}
          endAngle={-270}
        />
      </PieChart>
    </div>
  );
}
