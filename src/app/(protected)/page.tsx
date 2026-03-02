"use client";

import { useEffect, useState } from "react";
import type { CheckInType, RiskSummaryType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Heading } from "@/components/ui/heading";
import Risks from "@/components/dashboard/Risks";
import Instructions from "@/components/dashboard/Instructions";

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
        .select("id, start, repeat, status")
        .eq("company_id", companies[0].id);

      if (checkInsError) {
        console.error(checkInsError);
        return;
      }

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
      setCheckIns(checkInsData);
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
        </div>
      ) : (
        risks !== undefined && checkIns !== undefined && <Instructions noStaffContacts={noStaffContacts} />
      )}
    </div>
  );
}
