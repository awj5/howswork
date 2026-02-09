"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { Select } from "@/components/ui/select";

type TeamProps = {
  val: string;
  setVal: Dispatch<SetStateAction<string>>;
};

type TeamType = {
  id: number;
  name: string;
};

export default function Team(props: TeamProps) {
  const supabase = createClient();
  const companies = useCompanies();
  const [teams, setTeams] = useState<TeamType[]>([]);

  useEffect(() => {
    if (!companies.length) return;

    const getTeams = async () => {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id, name")
        .eq("company_id", companies[0].id);

      if (teamsError) {
        console.error(teams);
        return;
      }

      setTeams(teamsData);
    };

    getTeams();
  }, [companies]);

  return (
    <Select value={props.val} onChange={(e) => props.setVal(e.target.value)} className={`${!teams.length && "hidden"}`}>
      <option value="">All teams</option>

      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </Select>
  );
}
