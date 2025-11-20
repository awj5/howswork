"use client";

import { useEffect, useState } from "react";
import type { CompanyType } from "@/types";
import { createClient } from "@/utils/supabase/client";

export function useCompany() {
  const supabase = createClient();
  const [company, setCompany] = useState<CompanyType>();

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

      // Get company
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", companyUsersData[0].company_id)
        .single();

      if (companyError) {
        console.error(companyError);
        return;
      }

      setCompany({
        id: companyData.id,
        name: companyData.name,
      });
    }

    getCompany();
  }, []);

  return company;
}
