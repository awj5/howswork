"use client";

import { Fragment, useEffect, useState } from "react";
import { ClockIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { ErrorMessage, Field, FieldGroup, Fieldset, Label } from "@/components/fieldset";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
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
import { addCheckIn, removeCheckIn, updateCheckIn } from "./actions";

export type CheckInType = {
  id: number;
  scheduled: string;
  repeat: number;
  pin: number;
};

export default function CheckIns() {
  const supabase = createClient();
  const companies = useCompanies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [repeat, setRepeat] = useState("14"); // Default
  const [scheduledError, setScheduledError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const [checkInToRemove, setCheckInToRemove] = useState({ id: 0, cancelRepeat: false });
  const nowUTC = DateTime.utc();
  let foundInProgress = false;

  const removeCheckInClick = async () => {
    setAlertOpen(false);
    if (!checkInToRemove) return;
    setDisabled(true);

    // Update (remove repeat) if upcoming check-in
    const result = checkInToRemove.cancelRepeat
      ? await updateCheckIn(checkInToRemove.id)
      : await removeCheckIn(checkInToRemove.id);

    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Check-in removed.");
  };

  const confirmCancelClick = (checkIn: CheckInType, cancelRepeat?: boolean) => {
    setCheckInToRemove({ id: checkIn.id, cancelRepeat: !!cancelRepeat });
    setAlertOpen(true);
  };

  const scheduleClick = async () => {
    setScheduledError(false);

    // Validate
    const selectedDT = DateTime.fromISO(scheduled, { zone: companies[0].timezone }).toUTC(); // Convert to UTC date object

    // Check if in past
    if (!scheduled || selectedDT <= nowUTC) {
      setScheduledError(true);
      return;
    }

    // Add
    setDisabled(true);
    const result = await addCheckIn(companies[0].id, scheduled, Number(repeat));
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
        .select("id, scheduled, repeat, pin")
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
                <TableHeader>Repeats</TableHeader>
                <TableHeader>Pin</TableHeader>
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
                const repeatWeeks = c.repeat / 7;
                const repeatText = repeatWeeks === 1 ? "Weekly" : repeatWeeks ? `${repeatWeeks} weeks` : "None";

                return (
                  <Fragment key={`${c.scheduled}-${index}`}>
                    {/* Extra row showing next check-in when in progress repeats */}
                    {inProgress && nextScheduledDT && (
                      <TableRow>
                        <TableCell className="font-medium text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            {nextScheduledDT.setZone(companies[0].timezone).toFormat("dd LLL yyyy, h:mm a")}
                            <ArrowPathIcon className="size-5" />
                          </div>
                        </TableCell>

                        <TableCell className="text-zinc-500">{repeatText}</TableCell>
                        <TableCell className="text-zinc-500">-</TableCell>

                        <TableCell>
                          <Badge color="zinc">Upcoming</Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button onClick={() => confirmCancelClick(c, true)} disabled={disabled} outline>
                            <XCircleIcon />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow href={inFuture ? undefined : "#"}>
                      <TableCell className={`font-medium ${inFuture && "text-zinc-500"}`}>
                        <div className="flex items-center gap-1.5">
                          {scheduledDT.setZone(companies[0].timezone).toFormat("dd LLL yyyy, h:mm a")}
                          {c.repeat && inFuture ? <ArrowPathIcon className="size-5" /> : null}
                        </div>
                      </TableCell>

                      <TableCell className={`${inFuture && "text-zinc-500"}`}>{repeatText}</TableCell>
                      <TableCell className={`${inFuture && "text-zinc-500"}`}>{!inFuture ? c.pin : "-"}</TableCell>

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
                          Remove
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

                {scheduledError && <ErrorMessage>Start date &amp; time must be in the future.</ErrorMessage>}
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

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to remove this check-in?</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={removeCheckInClick} color="red">
            Remove
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
