import { DateTime } from "luxon";
import { RiskSummaryType, DashboardStatType } from "@/types";
import { Subheading } from "@/components/ui/heading";
import Stat from "@/components/dashboard/risks/Stat";

type RisksProps = {
  data: RiskSummaryType[] | undefined;
};

export default function Risks(props: RisksProps) {
  const stats: DashboardStatType[] = [];

  // Awaiting
  const awaitingReview = props.data?.filter((i) => i.status === 1) ?? [];
  const oldestRaised = awaitingReview[0] ? DateTime.fromISO(awaitingReview[0].date_raised) : null;

  stats.push({
    title: "Awaiting review",
    primary: awaitingReview.length,
    secondary: oldestRaised?.toLocal().toRelative()?.replace(/ ago$/, "") ?? undefined,
    secondaryText: "oldest awaiting review",
  });

  // Open
  const open =
    props.data
      ?.filter((i) => i.status === 2 || i.status === 3)
      .sort((a, b) => new Date(a.date_reviewed!).getTime() - new Date(b.date_reviewed!).getTime()) ?? []; // Order by date reviewed

  const oldestReviewed = open[0] ? DateTime.fromISO(open[0].date_reviewed!) : null;

  stats.push({
    title: "Open",
    primary: open.length,
    secondary: oldestReviewed?.toLocal().toRelative()?.replace(/ ago$/, "") ?? undefined,
    secondaryText: "longest open",
  });

  // Resolved
  const resolved = props.data?.filter((i) => i.status === 4) ?? [];

  const avgDays = resolved.length
    ? Math.round(
        resolved.reduce((sum, risk) => {
          return sum + DateTime.fromISO(risk.date_resolved!).diff(DateTime.fromISO(risk.date_raised), "days").days;
        }, 0) / resolved.length
      )
    : undefined;

  stats.push({
    title: "Resolved",
    primary: resolved.length,
    secondary: avgDays ? `${avgDays} day${avgDays !== 1 ? "s" : ""}` : undefined,
    secondaryText: "avg to resolve",
  });

  return (
    <>
      <Subheading className="mt-8">Risks</Subheading>

      <div className="mt-4 grid gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <Stat key={stat.title} data={stat} />
        ))}
      </div>
    </>
  );
}
