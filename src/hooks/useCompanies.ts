"use client";

import { useEffect, useState } from "react";
import type { CompanyType } from "@/types";
import { createClient } from "@/utils/supabase/client";

export function useCompanies() {
  const supabase = createClient();
  const [companies, setCompanies] = useState<CompanyType[]>([]);

  useEffect(() => {
    async function getCompany() {
      // Get auth user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return;

      // Get users companies (may have more than one)
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", authData.user.id);

      if (companyUsersError) {
        console.error(companyUsersError.message);
        return;
      }

      if (!companyUsersData.length) return; // User not in any companies
      const companyIDs = companyUsersData.map((u) => u.company_id);

      // Get companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIDs);

      if (companiesError) {
        console.error(companiesError);
        return;
      }

      const selected = localStorage.getItem("company");

      // Sort locally stored first, then alphabetically
      const sorted = [...companiesData].sort((a, b) => {
        if (a.id.toString() === selected) return -1;
        if (b.id.toString() === selected) return 1;
        return a.name.localeCompare(b.name);
      });

      setCompanies(sorted);
    }

    getCompany();
  }, []);

  return companies;
}
