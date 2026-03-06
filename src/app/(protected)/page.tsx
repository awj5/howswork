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
  const nonScheduledCheckIns = checkIns?.filter((i) => i.status !== 1);

  useEffect(() => {
    if (!companies.length) return;

    const getData = async () => {
      const supabase = createClient();

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

      if (!peopleData.contacts.length) setNoStaffContacts(true);

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

      setRisks(risksData);

      // Get company check-ins
      const { data: checkInsData, error: checkInsError } = await supabase
        .from("check_ins")
        .select("id, start, repeat, status, contact_count")
        .eq("company_id", companies[0].id)
        .order("start", { ascending: true });

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
      const { data: concernsData, error: concernsError } = await supabase
        .from("concerns")
        .select("id, created_at, tracking, issues")
        .eq("company_id", companies[0].id)
        .order("created_at", { ascending: true });

      if (concernsError) {
        console.error(concernsError);
        return;
      }

      setConcerns(concernsData);

      // Count issues from feedback and concerns
      const issueCounts = [
        ...feedbackData.flatMap((feedback) => feedback.issues ?? []),
        ...concernsData.flatMap((concern) => concern.issues ?? []),
      ].reduce<Record<number, number>>((map, id) => {
        map[id] = (map[id] ?? 0) + 1;
        return map;
      }, {});

      setIssues(Object.entries(issueCounts).map(([id, count]) => ({ id: Number(id), count })));

      setCheckIns(
        checkInsData.map((checkIn) => ({
          ...checkIn,
          sentiments: sentimentsByCheckIn[checkIn.id] ?? [],
        }))
      );
    };

    getData();
  }, [companies]);

  return (
    <div className="mx-auto max-w-6xl">
      {nonScheduledCheckIns?.length ? (
        <div className="fade-in">
          <div className="flex h-12 items-end sm:h-10">
            <Heading>{companies[0]?.name}</Heading>
          </div>

          <Risks data={risks} />
          <Subheading className="mt-12">Engagement overview</Subheading>
          <Divider className="mt-4" />

          <div className="mt-6 flex flex-col gap-8">
            <CheckIns data={nonScheduledCheckIns} timezone={companies[0].timezone} />
            {!!concerns.length && <Concerns data={concerns} />}
            {!!issues.length && <Issues data={issues} />}
          </div>
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
