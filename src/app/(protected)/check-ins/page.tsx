"use client";

import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { scheduleCheckIn, removeCheckIn, updateCheckIn } from "./actions";

export type CheckInType = {
  id: number;
  scheduled: string;
  repeat: number;
  pin: number;
};

export default function CheckIns() {
  const supabase = createClient();
  const companies = useCompanies();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [repeat, setRepeat] = useState("14"); // Default
  const [scheduledError, setScheduledError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const [checkInToRemove, setCheckInToRemove] = useState({ id: 0, cancelRepeat: false });
  const [pageCount, setPageCount] = useState(0);
  const nowUTC = DateTime.utc();
  let foundInProgress = false;
  const pageSize = 5;
  const page = Number(searchParams.get("page")) || 1; // Default to page 1

  const removeCheckInClick = async () => {
    setAlertOpen(false);
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

  const confirmRemoveClick = (checkIn: CheckInType, cancelRepeat?: boolean) => {
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

    // Schedule
    setDisabled(true);
    const result = await scheduleCheckIn(companies[0].id, scheduled, Number(repeat));
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
      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get check-ins
      const {
        data: checkInsData,
        error: checkInsError,
        count: checkInsCount,
      } = await supabase
        .from("check_ins")
        .select("id, scheduled, repeat, pin", {
          count: "exact",
        })
        .eq("company_id", companies[0].id)
        .order("scheduled", { ascending: false })
        .range(from, to);

      if (checkInsError) {
        console.error(checkInsError);
        return;
      }

      setCheckIns(checkInsData);
      setPageCount(Math.max(1, Math.ceil(checkInsCount! / pageSize)));
    };

    getCheckIns();
  }, [companies, disabled, page]);

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
              {checkIns.map((c, i) => {
                const scheduledDT = DateTime.fromISO(c.scheduled).toUTC(); // Convert to date object (UTC)
                const inFuture = scheduledDT.toMillis() > nowUTC.toMillis(); // Check if scheduled for future
                const inProgress = !foundInProgress && !inFuture; // Check if currently in progress
                if (inProgress) foundInProgress = true; // Only one check-in can be in progress
                const nextScheduledDT = c.repeat ? scheduledDT.plus({ days: c.repeat }) : null;
                const repeatWeeks = c.repeat / 7;
                const repeatText = repeatWeeks === 1 ? "Weekly" : repeatWeeks ? `${repeatWeeks} weeks` : "None";

                return (
                  <Fragment key={`${c.scheduled}-${i}`}>
                    {/* Extra row previewing next check-in when in progress repeats */}
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
                          <Button onClick={() => confirmRemoveClick(c, true)} disabled={disabled} outline>
                            <XCircleIcon />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow href={inFuture ? undefined : `/check-ins/${c.id}`}>
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
                          onClick={() => confirmRemoveClick(c)}
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
            <PaginationPrevious href={page !== 1 ? `/check-ins?page=${page - 1}` : undefined} />

            <PaginationList>
              {Array.from({ length: Math.min(4, pageCount) }, (_, i) => {
                const pageNumber = i + 1;

                return (
                  <PaginationPage key={pageNumber} href={`/check-ins?page=${pageNumber}`} current={pageNumber === page}>
                    {pageNumber}
                  </PaginationPage>
                );
              })}

              {pageCount > 4 && (
                <>
                  {pageCount > 6 && <PaginationGap />}

                  {pageCount === 5 && (
                    <PaginationPage href={`/check-ins?page=${pageCount}`} current={page === pageCount}>
                      {pageCount}
                    </PaginationPage>
                  )}

                  {pageCount >= 6 &&
                    [pageCount - 1, pageCount].map((pageNumber) => (
                      <PaginationPage
                        key={pageNumber}
                        href={`/check-ins?page=${pageNumber}`}
                        current={pageNumber === page}
                      >
                        {pageNumber}
                      </PaginationPage>
                    ))}
                </>
              )}
            </PaginationList>

            <PaginationNext href={page !== pageCount ? `/check-ins?page=${page + 1}` : undefined} />
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
                  <option value="56">Every 8 weeks</option>
                  <option value="84">Every 12 weeks</option>
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
