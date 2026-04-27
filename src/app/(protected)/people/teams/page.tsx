"use client";

import { useEffect, useState } from "react";
import { UserGroupIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Heading, Subheading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Field, Label } from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { removeTeam, addTeam } from "./actions";
import { Strong } from "@/components/ui/text";
import EmptyState from "@/components/EmptyState";
import { Text } from "@/components/ui/text";
import Doodle from "@/components/Doodle";

type TeamType = {
  id: number;
  name: string;
};

export default function Teams() {
  const companies = useCompanies();
  const [teams, setTeams] = useState<TeamType[]>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamToRemove, setTeamToRemove] = useState<TeamType>();
  const [teamName, setTeamName] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [doodleLoaded, setDoodleLoaded] = useState(false);

  const addClick = async () => {
    if (!teamName.trim()) return; // Validate
    setDisabled(true);
    const result = await addTeam(teamName, companies[0]);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Team added");
    setDialogOpen(false);
    setTeamName(""); // Reset
    getTeams(); // Reload list
  };

  const removeTeamClick = async () => {
    if (!teamToRemove) return;
    setAlertOpen(false);
    setDisabled(true);
    const result = await removeTeam(teamToRemove.id);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Team removed");
    getTeams(); // Reload list
  };

  const confirmRemoveClick = (team: TeamType) => {
    setTeamToRemove(team);
    setAlertOpen(true);
  };

  const getTeams = async () => {
    if (!companies.length) return;
    const supabase = createClient();

    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("company_id", companies[0].id)
      .order("name", { ascending: true });

    if (teamsError) {
      console.error(teamsError);
      return;
    }

    setTeams(teamsData);
  };

  useEffect(() => {
    getTeams();
  }, [companies]);

  return (
    <div className="mx-auto max-w-6xl">
      {teams && teams.length ? (
        <div className="fade-in">
          <div className="flex h-12 items-end justify-between gap-4 sm:h-10">
            <Heading>Teams</Heading>

            <Button onClick={() => setDialogOpen(true)} color="indigo" disabled={disabled || !companies.length}>
              <UserGroupIcon />
              Add team
            </Button>
          </div>

          <Table className="fade-in mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>

                <TableHeader className="relative w-0">
                  <span className="sr-only">Actions</span>
                </TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>

                  <TableCell className="text-right">
                    <Button onClick={() => confirmRemoveClick(team)} disabled={disabled} plain>
                      <XCircleIcon />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        teams && (
          <EmptyState className={doodleLoaded ? "fade-in" : "opacity-0"}>
            <Doodle doodles={6} onLoad={() => setDoodleLoaded(true)} />
            <Subheading className="mt-4">No teams yet</Subheading>

            <Text className="mt-1 text-center">
              Teams are optional. They let staff choose which team they belong to during check-ins, without being
              identified.
            </Text>

            <Button onClick={() => setDialogOpen(true)} color="indigo" className="mt-6" disabled={disabled}>
              <UserGroupIcon />
              Add team
            </Button>
          </EmptyState>
        )
      )}

      <Dialog open={dialogOpen} onClose={setDialogOpen}>
        <DialogTitle>Add new team</DialogTitle>

        <DialogDescription className="text-wrap!">
          Team names are visible to all employees at <Strong>{companies[0]?.name.replace(/\.$/, "")}</Strong>.
        </DialogDescription>

        <DialogBody>
          <Field>
            <Label>Name</Label>
            <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={disabled} />
          </Field>
        </DialogBody>

        <DialogActions>
          <Button plain onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>

          <Button onClick={addClick} disabled={disabled || !teamName.trim()} color="indigo">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to remove {teamToRemove?.name}?</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={removeTeamClick} color="red">
            Remove
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
