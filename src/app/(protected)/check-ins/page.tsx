"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClockIcon, UsersIcon } from "@heroicons/react/16/solid";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { DateTime } from "luxon";
import type { CheckInType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Heading, Subheading } from "@/components/ui/heading";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, Field, FieldGroup, Fieldset, Label } from "@/components/ui/fieldset";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import EmptyState from "@/components/EmptyState";
import { TablePagination } from "@/components/TablePagination";
import CheckIn from "@/components/check-ins/CheckIn";
import { scheduleCheckIn, removeCheckIn } from "./actions";

export default function CheckIns() {
  const supabase = createClient();
  const router = useRouter();
  const companies = useCompanies();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [repeat, setRepeat] = useState("14"); // Default
  const [scheduledError, setScheduledError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const [checkInToRemove, setCheckInToRemove] = useState<CheckInType>();
  const [pageCount, setPageCount] = useState(0);
  const [noStaffContacts, setNoStaffContacts] = useState(false);
  const pageSize = 10;
  const page = Number(searchParams.get("page")) || 1; // Default to page 1

  const removeCheckInClick = async () => {
    setAlertOpen(false);
    if (!checkInToRemove) return;
    setDisabled(true);
    const result = await removeCheckIn(checkInToRemove, companies[0].id);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Check-in removed.");
  };

  const confirmRemoveClick = (checkIn: CheckInType) => {
    setCheckInToRemove(checkIn);
    setAlertOpen(true);
  };

  const scheduleClick = async () => {
    setScheduledError(false);

    // Validate
    const nowUTC = DateTime.utc();
    const selectedDT = DateTime.fromISO(scheduled, { zone: companies[0]?.timezone }).toUTC(); // Convert to UTC date object

    // Check if in past
    if (!scheduled || selectedDT <= nowUTC) {
      setScheduledError(true);
      return;
    }

    // Schedule
    setDisabled(true);
    const result = await scheduleCheckIn(companies[0]?.id, scheduled, Number(repeat));
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
        .select("id, start, repeat, pin, status", {
          count: "exact",
        })
        .eq("company_id", companies[0].id)
        .order("start", { ascending: false })
        .range(from, to);

      if (checkInsError) {
        console.error(checkInsError);
        return;
      }

      if (!checkInsData.length) {
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

        if (!peopleData.contacts || !peopleData.contacts.length) {
          setNoStaffContacts(true);
          return;
        }
      }

      setCheckIns(checkInsData);
      setPageCount(Math.max(1, Math.ceil(checkInsCount! / pageSize)));
    };

    getCheckIns();
  }, [companies, disabled, page]);

  return (
    <div className="mx-auto max-w-6xl">
      {checkIns && checkIns.length ? (
        <>
          <div className="flex h-12 items-end justify-between gap-4 sm:h-10">
            <Heading>Check-ins</Heading>

            <Button
              onClick={() => setDialogOpen(true)}
              color="indigo"
              className={`${checkIns[0].repeat && "pointer-events-none invisible"}`}
              disabled={disabled}
            >
              <ClockIcon />
              Schedule
            </Button>
          </div>

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
              {checkIns.map((c) => (
                <CheckIn
                  key={c.start}
                  data={c}
                  timezone={companies[0].timezone}
                  disabled={disabled}
                  confirmRemoveClick={confirmRemoveClick}
                />
              ))}
            </TableBody>
          </Table>

          <TablePagination page={page} pageCount={pageCount} route="/check-ins" />
        </>
      ) : checkIns ? (
        <EmptyState>
          <CheckCircleIcon className="size-16 text-gray-400 sm:size-12 dark:text-gray-500" />
          <Subheading className="mt-2">No check-ins</Subheading>
          <Text className="mt-1 text-center">Get started by scheduling a check-in.</Text>

          <Button onClick={() => setDialogOpen(true)} color="indigo" className="mt-6" disabled={disabled}>
            <ClockIcon />
            Schedule
          </Button>
        </EmptyState>
      ) : (
        noStaffContacts && (
          <EmptyState>
            <Subheading className="mt-2">No staff contacts</Subheading>
            <Text className="mt-1 text-center">Add staff contacts before scheduling a check-in.</Text>

            <Button onClick={() => router.push("/people")} outline className="mt-6">
              <UsersIcon />
              Add staff contacts
            </Button>
          </EmptyState>
        )
      )}

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

          <Button onClick={() => scheduleClick()} color="indigo" disabled={disabled}>
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
