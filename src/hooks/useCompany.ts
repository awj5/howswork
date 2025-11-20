"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export type CompanyType = {
  id: number;
  name: string;
};

export function useCompany() {
  const [company, setCompany] = useState<CompanyType | null>(null);

  useEffect(() => {
    async function getCompany() {
      const supabase = createClient();

      // Get auth user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

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
