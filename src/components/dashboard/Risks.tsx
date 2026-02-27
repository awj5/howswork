import { DateTime } from "luxon";
import { ClipboardIcon } from "@heroicons/react/16/solid";
import { RiskSummaryType, DashboardStatType } from "@/types";
import { Subheading } from "@/components/ui/heading";
import Stat from "@/components/dashboard/risks/Stat";
import { Button } from "@/components/ui/button";

type RisksProps = {
  data: RiskSummaryType[] | undefined;
};

export default function Risks(props: RisksProps) {
  const stats: DashboardStatType[] = [];

  // Awaiting
  const awaitingReview = props.data?.filter((i) => i.status === 1) ?? [];
  const oldestRaised = awaitingReview[0] ? DateTime.fromISO(awaitingReview[0].date_raised) : null;
  const raisedDaysAgo = oldestRaised ? Math.floor(DateTime.now().diff(oldestRaised.toLocal(), "days").days) : 0;

  stats.push({
    title: "Awaiting review",
    primary: awaitingReview.length,
    secondary: raisedDaysAgo ? `${raisedDaysAgo} day${raisedDaysAgo !== 1 ? "s" : ""}` : undefined,
    secondaryText: "oldest awaiting review",
    badgeColor: raisedDaysAgo ? (raisedDaysAgo <= 3 ? "green" : raisedDaysAgo <= 7 ? "amber" : "red") : undefined,
  });

  // Open
  const open =
    props.data
      ?.filter((i) => i.status === 2 || i.status === 3)
      .sort((a, b) => new Date(a.date_reviewed!).getTime() - new Date(b.date_reviewed!).getTime()) ?? []; // Order by date reviewed

  const oldestReviewed = open[0] ? DateTime.fromISO(open[0].date_reviewed!) : null;
  const reviewedDaysAgo = oldestReviewed ? Math.floor(DateTime.now().diff(oldestReviewed.toLocal(), "days").days) : 0;

  stats.push({
    title: "Open",
    primary: open.length,
    secondary: reviewedDaysAgo ? `${reviewedDaysAgo} day${reviewedDaysAgo !== 1 ? "s" : ""}` : undefined,
    secondaryText: "longest open",
    badgeColor: reviewedDaysAgo
      ? reviewedDaysAgo <= 7
        ? "green"
        : reviewedDaysAgo <= 14
          ? "amber"
          : "red"
      : undefined,
  });

  // Resolved
  const resolved = props.data?.filter((i) => i.status === 4) ?? [];

  const avgDays = resolved.length
    ? Math.round(
        resolved.reduce((sum, risk) => {
          return sum + DateTime.fromISO(risk.date_resolved!).diff(DateTime.fromISO(risk.date_raised), "days").days;
        }, 0) / resolved.length
      )
    : 0;

  stats.push({
    title: "Resolved",
    primary: resolved.length,
    secondary: avgDays ? `${avgDays} day${avgDays !== 1 ? "s" : ""}` : undefined,
    secondaryText: "avg to resolve",
    badgeColor: avgDays ? (avgDays <= 14 ? "green" : avgDays <= 30 ? "amber" : "red") : undefined,
  });

  return (
    <>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Risk summary</Subheading>

        <Button href="/risk-register" outline>
          <ClipboardIcon />
          View Risk Register
        </Button>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <Stat key={stat.title} data={stat} />
        ))}
      </div>
    </>
  );
}
