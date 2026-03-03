"use client";

import { useEffect, useState } from "react";
import type { CheckInType, RiskSummaryType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Heading, Subheading } from "@/components/ui/heading";
import Risks from "@/components/dashboard/Risks";
import Instructions from "@/components/dashboard/Instructions";
import Participation from "@/components/dashboard/Participation";
import { Divider } from "@/components/ui/divider";

export default function Home() {
  const companies = useCompanies();
  const [risks, setRisks] = useState<RiskSummaryType[]>();
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const [noStaffContacts, setNoStaffContacts] = useState(false);

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
        .select("id, check_in_id")
        .in("check_in_id", checkInIDs);

      if (feedbackError) {
        console.error(feedbackError);
        return;
      }

      // Count feedback for each check-in
      const feedbackByCheckIn = feedbackData.reduce<Record<number, number>>((map, feedback) => {
        map[feedback.check_in_id] = (map[feedback.check_in_id] ?? 0) + 1;
        return map;
      }, {});

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
      setCheckIns(checkInsData.map((i) => ({ ...i, feedback: feedbackByCheckIn[i.id] ?? 0 }))); // Add feedback count
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
          <Subheading className="mt-12">Check-in trends</Subheading>
          <Divider className="mt-4" />

          <div className="mt-6 flex flex-col gap-8">
            <Participation checkIns={checkIns} timezone={companies[0].timezone} />
          </div>
        </div>
      ) : (
        risks !== undefined && checkIns !== undefined && <Instructions noStaffContacts={noStaffContacts} />
      )}
    </div>
  );
}
