"use client";

import { useEffect, useState } from "react";
import type { CheckInType, RiskSummaryType, ConcernType, CheckInIssueType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Heading, Subheading } from "@/components/ui/heading";
import Risks from "@/components/dashboard/Risks";
import Instructions from "@/components/dashboard/Instructions";
import CheckIns from "@/components/dashboard/CheckIns";
import { Divider } from "@/components/ui/divider";
import Doodle from "@/components/Doodle";
import { Text } from "@/components/ui/text";
import { Select } from "@/components/ui/select";
import Concerns from "@/components/dashboard/Concerns";
import Issues from "@/components/dashboard/Issues";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const companies = useCompanies();
  const [risks, setRisks] = useState<RiskSummaryType[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const [concerns, setConcerns] = useState<ConcernType[]>([]);
  const [issues, setIssues] = useState<CheckInIssueType[]>([]);
  const [noStaffContacts, setNoStaffContacts] = useState(false);
  const [doodleLoaded, setDoodleLoaded] = useState(false);
  const [filter, setFilter] = useState<string>();
  const nonScheduledCheckIns = checkIns?.filter((i) => i.status !== 1);

  useEffect(() => {
    if (!companies.length) return;

    const getDateRange = (range?: string) => {
      const now = new Date();
      const year = now.getFullYear();
      const today = now.toISOString().split("T")[0] + "T23:59:59";
      if (range === "ty") return { start: `${year}-01-01`, end: today }; // This year
      if (range === "ly") return { start: `${year - 1}-01-01`, end: `${year - 1}-12-31T23:59:59` }; // Last year
      if (range === "at") return { start: null, end: null }; // All time
      const date = new Date();

      if (range === "p6") {
        date.setMonth(date.getMonth() - 6); // 6 months
      } else if (range === "p3") {
        date.setMonth(date.getMonth() - 3); // 3 months
      } else {
        date.setFullYear(date.getFullYear() - 1); // 12 months (default)
      }

      return { start: date.toISOString().split("T")[0] + "T00:00:00", end: today };
    };

    const getData = async () => {
      const supabase = createClient();
      const dateRange = getDateRange(filter);

      // Check if company has staff contacts
      const { data: peopleData, error: peopleError } = await supabase
        .from("people")
        .select("contacts")
        .eq("company_id", companies[0].id)
        .single();

      if (peopleError) {
        console.error(peopleError);
        return;
      }

      // Get company risks
      const { data: risksData, error: risksError } = await supabase
        .from("risks")
        .select("id, status, date_raised, date_reviewed, date_resolved")
        .eq("company_id", companies[0].id)
        .order("date_raised", { ascending: true });

      if (risksError) {
        console.error(risksError);
        return;
      }

      // Get company check-ins
      let checkInsQuery = supabase
        .from("check_ins")
        .select("id, start, repeat, status, contact_count")
        .eq("company_id", companies[0].id)
        .order("start", { ascending: true });

      if (dateRange.start) checkInsQuery = checkInsQuery.gte("start", dateRange.start);
      if (dateRange.end) checkInsQuery = checkInsQuery.lte("start", dateRange.end);
      const { data: checkInsData, error: checkInsError } = await checkInsQuery;

      if (checkInsError) {
        console.error(checkInsError);
        return;
      }

      const checkInIDs = checkInsData.map((item) => item.id);

      // Get check-in feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("id, check_in_id, sentiment, issues")
        .in("check_in_id", checkInIDs);

      if (feedbackError) {
        console.error(feedbackError);
        return;
      }

      // Group feedback sentiments by check-in
      const sentimentsByCheckIn = feedbackData.reduce<Record<number, number[]>>((map, feedback) => {
        (map[feedback.check_in_id] ??= []).push(feedback.sentiment);
        return map;
      }, {});

      // Get company concerns
      let concernsQuery = supabase
        .from("concerns")
        .select("id, created_at, tracking, issues")
        .eq("company_id", companies[0].id)
        .order("created_at", { ascending: true });

      if (dateRange.start) concernsQuery = concernsQuery.gte("created_at", dateRange.start);
      if (dateRange.end) concernsQuery = concernsQuery.lte("created_at", dateRange.end);
      const { data: concernsData, error: concernsError } = await concernsQuery;

      if (concernsError) {
        console.error(concernsError);
        return;
      }

      // Count issues from feedback and concerns
      const issueCounts = [
        ...feedbackData.flatMap((feedback) => feedback.issues ?? []),
        ...concernsData.flatMap((concern) => concern.issues ?? []),
      ].reduce<Record<number, number>>((map, id) => {
        map[id] = (map[id] ?? 0) + 1;
        return map;
      }, {});

      if (!peopleData.contacts || !peopleData.contacts.length) setNoStaffContacts(true);
      setRisks(risksData);
      setConcerns(concernsData);
      setIssues(Object.entries(issueCounts).map(([id, count]) => ({ id: Number(id), count })));

      setCheckIns(
        checkInsData.map((checkIn) => ({
          ...checkIn,
          sentiments: sentimentsByCheckIn[checkIn.id] ?? [],
        }))
      );
    };

    getData();
  }, [companies, filter]);

  return (
    <div className="mx-auto max-w-6xl">
      {nonScheduledCheckIns?.length || filter !== undefined ? (
        <div className="fade-in">
          <div className="flex h-12 items-end sm:h-10">
            <Heading>{companies[0]?.name}</Heading>
          </div>

          <Risks data={risks} />

          <div className="mt-12 flex items-end justify-between">
            <Subheading>
              Engagement<span className="hidden sm:inline"> overview</span>
            </Subheading>

            <div>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="p12">Past 12 months</option>
                <option value="p6">Past 6 months</option>
                <option value="p3">Past 3 months</option>
                <option value="ty">This year</option>
                <option value="ly">Last year</option>
                <option value="at">All time</option>
              </Select>
            </div>
          </div>

          <Divider className="mt-4" />

          {nonScheduledCheckIns?.length ? (
            <div className="mt-6 flex flex-col gap-12">
              <CheckIns data={nonScheduledCheckIns} timezone={companies[0].timezone} />
              {!!concerns.length && <Concerns data={concerns} />}
              {!!issues.length && <Issues data={issues} />}
            </div>
          ) : (
            <Text className="mt-6">No data found</Text>
          )}
        </div>
      ) : checkIns?.length ? (
        <EmptyState className={doodleLoaded ? "fade-in" : "opacity-0"}>
          <Doodle doodles={24} onLoad={() => setDoodleLoaded(true)} />
          <Subheading className="mt-4">Nothing here yet</Subheading>

          <Text className="mt-1 text-center">
            Once check-ins come in, you&apos;ll see risks, trends, and how your workplace is tracking over time.
          </Text>
        </EmptyState>
      ) : (
        checkIns !== undefined && <Instructions noStaffContacts={noStaffContacts} />
      )}
    </div>
  );
}
