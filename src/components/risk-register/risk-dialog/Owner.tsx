"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import type { UserType } from "@/types";
import { Field, Label } from "@/components/ui/fieldset";
import { Select } from "@/components/ui/select";

type OwnerProps = {
  val: string;
  setVal: Dispatch<SetStateAction<string>>;
  disabled: boolean;
};

export default function Owner(props: OwnerProps) {
  const companies = useCompanies();
  const [users, setUsers] = useState<UserType[]>([]);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (!companies.length) return;

    const getUsers = async () => {
      const supabase = createClient();

      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from("company_users")
        .select("user_id")
        .eq("company_id", companies[0].id);

      if (companyUsersError) {
        console.error(companyUsersError);
        return;
      }

      const userIDs = companyUsersData.map((i) => i.user_id).filter(Boolean); // Registered user IDs

      // Get profiles (don't show super admins unless it's their company)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIDs)
        .or(`super_admin_company_id.is.null,super_admin_company_id.eq.${companies[0].id}`)
        .order("first_name", { ascending: true });

      if (profilesError) {
        console.error(profilesError);
        return;
      }

      setUsers(profilesData);
      setDisabled(false);
    };

    getUsers();
  }, [companies]);

  return (
    <Field disabled={props.disabled || disabled}>
      <Label>Owner</Label>

      <Select value={props.val} onChange={(e) => props.setVal(e.target.value)}>
        <option value="">Unassigned</option>

        {users.map((user) => (
          <option
            key={user.user_id}
            value={`${user.first_name} ${user.last_name}`}
          >{`${user.first_name} ${user.last_name}`}</option>
        ))}
      </Select>
    </Field>
  );
}
