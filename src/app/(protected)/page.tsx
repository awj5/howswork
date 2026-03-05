"use client";

import { useEffect, useState } from "react";
import type { CheckInType, RiskSummaryType, ConcernType } from "@/types";
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

export default function Home() {
  const companies = useCompanies();
  const [risks, setRisks] = useState<RiskSummaryType[]>();
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const [concerns, setConcerns] = useState<ConcernType[]>([]);
  const [noStaffContacts, setNoStaffContacts] = useState(false);
  const nonScheduledCheckIns = checkIns?.filter((i) => i.status !== 1);

  useEffect(() => {
    if (!companies.length) return;

    const getRisks = async () => {
      const supabase = createClient();

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
        .select("id, check_in_id, sentiment")
        .in("check_in_id", checkInIDs);

      if (feedbackError) {
        console.error(feedbackError);
        return;
      }

      // Group sentiments by check-in
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
      setRisks(risksData);

      setCheckIns(
        checkInsData.map((checkIn) => ({
          ...checkIn,
          sentiments: sentimentsByCheckIn[checkIn.id] ?? [],
        }))
      );
    };

    getRisks();
  }, [companies]);

  return (
    <div className="mx-auto max-w-6xl">
      {risks?.length || checkIns?.length ? (
        <div className="fade-in">
          <div className="flex h-12 items-end sm:h-10">
            <Heading>{companies[0]?.name}</Heading>
          </div>

          <Risks data={risks} />
          <Subheading className="mt-12">Engagement overview</Subheading>
          <Divider className="mt-4" />

          {nonScheduledCheckIns?.length ? (
            <div className="mt-6 flex flex-col gap-8">
              <CheckIns data={nonScheduledCheckIns} timezone={companies[0].timezone} />
              <Concerns data={concerns} />
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center">
              <Doodle doodles={24} />
              <Subheading className="mt-4">No data yet</Subheading>

              <Text className="mt-1 text-center">
                Schedule a check-in to start collecting early risk signals and enable concern reporting.
              </Text>
            </div>
          )}
        </div>
      ) : (
        risks !== undefined && checkIns !== undefined && <Instructions noStaffContacts={noStaffContacts} />
      )}
    </div>
  );
}
