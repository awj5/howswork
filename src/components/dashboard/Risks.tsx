import { Dispatch, SetStateAction, useEffect } from "react";
import { DateTime } from "luxon";
import { createClient } from "@/utils/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { DashboardStatType } from "@/types";
import { Subheading } from "@/components/ui/heading";
import Stat from "@/components/dashboard/risks/Stat";

type RisksProps = {
  data: DashboardStatType[];
  setData: Dispatch<SetStateAction<DashboardStatType[]>>;
};

export default function Risks(props: RisksProps) {
  const companies = useCompanies();

  useEffect(() => {
    if (!companies.length) return;

    const getStats = async () => {
      const supabase = createClient();

      const { data: risksData, error: risksError } = await supabase
        .from("risks")
        .select("id, status, date_raised, date_reviewed, date_resolved")
        .eq("company_id", companies[0].id)
        .order("date_raised", { ascending: true });

      if (risksError) {
        console.error(risksError);
        return;
      }

      const stats: DashboardStatType[] = [];

      // Awaiting
      const awaitingReview = risksData.filter((i) => i.status === 1);
      const oldestRaised = awaitingReview[0] ? DateTime.fromISO(awaitingReview[0].date_raised) : null;

      stats.push({
        title: "Awaiting review",
        primary: awaitingReview.length,
        secondary: oldestRaised?.toLocal().toRelative()?.replace(/ ago$/, "") ?? undefined,
        secondaryText: "oldest awaiting review",
      });

      // Open
      const open = risksData
        .filter((i) => i.status === 2 || i.status === 3)
        .sort((a, b) => new Date(a.date_reviewed).getTime() - new Date(b.date_reviewed).getTime()); // Order by date reviewed

      const oldestReviewed = open[0] ? DateTime.fromISO(open[0].date_reviewed) : null;

      stats.push({
        title: "Open",
        primary: open.length,
        secondary: oldestReviewed?.toLocal().toRelative()?.replace(/ ago$/, "") ?? undefined,
        secondaryText: "longest open",
      });

      // Resolved
      const resolved = risksData.filter((i) => i.status === 4);

      const avgDays = resolved.length
        ? Math.round(
            resolved.reduce((sum, risk) => {
              return sum + DateTime.fromISO(risk.date_resolved).diff(DateTime.fromISO(risk.date_raised), "days").days;
            }, 0) / resolved.length
          )
        : undefined;

      stats.push({
        title: "Resolved",
        primary: resolved.length,
        secondary: avgDays ? `${avgDays} day${avgDays !== 1 ? "s" : ""}` : undefined,
        secondaryText: "avg to resolve",
      });

      props.setData(stats);
    };

    getStats();
  }, [companies]);

  return (
    <>
      <Subheading className="mt-8">Risks</Subheading>

      <div className="mt-4 grid gap-8 sm:grid-cols-3">
        {props.data.map((stat) => (
          <Stat key={stat.title} data={stat} />
        ))}
      </div>
    </>
  );
}
