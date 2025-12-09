"use client";

import { Fragment, useEffect, useState } from "react";
import { ClockIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { ErrorMessage, Field, FieldGroup, Fieldset, Label } from "@/components/fieldset";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Badge } from "@/components/badge";
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from "@/components/pagination";
import { addCheckIn } from "./actions";

export type CheckInType = {
  scheduled: string;
  repeat: number;
};

export default function CheckIns() {
  const supabase = createClient();
  const companies = useCompanies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [repeat, setRepeat] = useState("14"); // Default
  const [scheduledError, setScheduledError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const nowUTC = DateTime.utc();
  let foundInProgress = false;

  const confirmCancelClick = (checkIn: CheckInType) => {
    //
  };

  const scheduleClick = async () => {
    setScheduledError(false);

    // Validate
    if (!scheduled) {
      setScheduledError(true);
      return;
    }

    // Add
    setDisabled(true);
    const result = await addCheckIn(companies[0].id, { scheduled, repeat: Number(repeat) });
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Check-in scheduled!");
    setDialogOpen(false);
  };

  useEffect(() => {
    if (!companies.length || disabled) return;

    const getCheckIns = async () => {
      const { data: checkInsData, error: checkInsError } = await supabase
        .from("check_ins")
        .select("scheduled, repeat")
        .eq("company_id", companies[0].id)
        .order("scheduled", { ascending: false });

      if (checkInsError) {
        console.error(checkInsError);
        return;
      }

      setCheckIns(checkInsData);
    };

    getCheckIns();
  }, [companies, disabled]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-4">
        <Heading>Check-ins</Heading>

        <Button
          onClick={() => setDialogOpen(true)}
          color="indigo"
          className={`${(!checkIns || (checkIns && checkIns.length && checkIns[0].repeat !== 0)) && "pointer-events-none invisible"}`}
          disabled={disabled}
        >
          <ClockIcon />
          Schedule
        </Button>
      </div>

      {checkIns && checkIns.length ? (
        <>
          <Table className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
              <TableRow>
                <TableHeader>Date &amp; Time</TableHeader>
                <TableHeader>Responses</TableHeader>
                <TableHeader>Status</TableHeader>

                <TableHeader className="relative w-0">
                  <span className="sr-only">Actions</span>
                </TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {checkIns.map((c, index) => {
                const scheduledDT = DateTime.fromISO(c.scheduled).toUTC(); // Convert to date object (UTC)
                const inFuture = scheduledDT.toMillis() > nowUTC.toMillis(); // Check if scheduled for future
                const inProgress = !foundInProgress && !inFuture; // Check if currently in progress
                if (inProgress) foundInProgress = true; // Only one check-in can be in progress
                const nextScheduledDT = c.repeat ? scheduledDT.plus({ days: c.repeat }) : null;

                return (
                  <Fragment key={`${c.scheduled}-${index}`}>
                    {/* Extra row showing next check-in when in progress repeats */}
                    {inProgress && nextScheduledDT && (
                      <TableRow>
                        <TableCell className="font-medium text-zinc-500">
                          {nextScheduledDT.setZone(companies[0].timezone).toFormat("dd LLL yyyy, h:mm a")}
                        </TableCell>

                        <TableCell className="text-zinc-500">-</TableCell>

                        <TableCell>
                          <Badge color="zinc">Upcoming</Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button onClick={() => confirmCancelClick(c)} disabled={disabled} outline>
                            <XCircleIcon />
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow href={inFuture ? undefined : "#"}>
                      <TableCell className={`font-medium ${inFuture && "text-zinc-500"}`}>
                        {scheduledDT.setZone(companies[0].timezone).toFormat("dd LLL yyyy, h:mm a")}
                      </TableCell>

                      <TableCell className={`${inFuture && "text-zinc-500"}`}>{inFuture ? "-" : "0"}</TableCell>

                      <TableCell>
                        {inProgress ? (
                          <Badge color="amber">Open</Badge>
                        ) : inFuture ? (
                          <Badge color="zinc">Scheduled</Badge>
                        ) : (
                          <Badge color="green">Closed</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          onClick={() => confirmCancelClick(c)}
                          className={`${!inFuture && "pointer-events-none invisible"}`}
                          disabled={disabled}
                          outline
                        >
                          <XCircleIcon />
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>

          <Pagination className="mt-6">
            <PaginationPrevious href="?page=2" />
            <PaginationList>
              <PaginationPage href="?page=1">1</PaginationPage>
              <PaginationPage href="?page=2">2</PaginationPage>
              <PaginationPage href="?page=3" current>
                3
              </PaginationPage>
              <PaginationPage href="?page=4">4</PaginationPage>
              <PaginationGap />
              <PaginationPage href="?page=65">65</PaginationPage>
              <PaginationPage href="?page=66">66</PaginationPage>
            </PaginationList>
            <PaginationNext href="?page=4" />
          </Pagination>
        </>
      ) : null}

      <Dialog open={dialogOpen} onClose={setDialogOpen}>
        <DialogTitle>Schedule a check-in</DialogTitle>

        <DialogDescription>
          Employees will be notified when the check-in begins and respond anonymously using a shared access pin.
        </DialogDescription>

        <DialogBody>
          <Fieldset disabled={disabled}>
            <FieldGroup>
              <Field>
                <Label>Start date &amp; time</Label>

                <Input
                  type="datetime-local"
                  value={scheduled}
                  onChange={(e) => setScheduled(e.target.value)}
                  invalid={scheduledError}
                />

                {scheduledError && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>

              <Field>
                <Label>Repeat</Label>

                <Select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
                  <option value="14">Every 2 weeks</option>
                  <option value="28">Every 4 weeks</option>
                  <option value="7">Every week</option>
                  <option value="0">None</option>
                </Select>
              </Field>
            </FieldGroup>
          </Fieldset>
        </DialogBody>

        <DialogActions>
          <Button plain onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>

          <Button onClick={() => scheduleClick()} color="indigo">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

/*
- Cycles
- Show access pin for each cycle
- Up next and in progress badges
- Participation stats
- Cadence settings (fortnightly or monthly)
*/
