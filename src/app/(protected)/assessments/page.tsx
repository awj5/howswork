"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClockIcon, UsersIcon } from "@heroicons/react/16/solid";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import EmptyState from "@/components/EmptyState";
import { TablePagination } from "@/components/TablePagination";
import CheckIn from "@/components/check-ins/CheckIn";
import Doodle from "@/components/Doodle";
import { scheduleCheckIn } from "./actions";

export default function CheckIns() {
  const companies = useCompanies();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [repeat, setRepeat] = useState("28"); // Default
  const [scheduledError, setScheduledError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInType[]>();
  const [noStaffContacts, setNoStaffContacts] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [doodleLoaded, setDoodleLoaded] = useState(false);
  const pageSize = 50;
  const page = Number(searchParams.get("page")) || 1; // Default to page 1

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
    toast.success("Check-in scheduled");
    setDialogOpen(false);
    getCheckIns(); // Reload list
  };

  const getCheckIns = async () => {
    if (!companies.length) return;
    const supabase = createClient();

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

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
      setCheckIns(undefined);
      return;
    }

    // Get check-ins
    const {
      data: checkInsData,
      error: checkInsError,
      count: checkInsCount,
    } = await supabase
      .from("check_ins")
      .select("id, start, repeat, status, contact_count", {
        count: "exact",
      })
      .eq("company_id", companies[0].id)
      .order("start", { ascending: false })
      .range(from, to);

    if (checkInsError) {
      console.error(checkInsError);
      return;
    }

    setCheckIns(checkInsData);
    setPageCount(Math.max(1, Math.ceil(checkInsCount! / pageSize)));
  };

  useEffect(() => {
    getCheckIns();
  }, [companies, page]);

  return (
    <div className="mx-auto max-w-6xl">
      {checkIns && checkIns.length ? (
        <div className="fade-in">
          <div className="flex h-12 items-end justify-between gap-4 sm:h-10">
            <Heading>Check-ins</Heading>

            <Button
              onClick={() => setDialogOpen(true)}
              color="indigo"
              className={`${checkIns[0].repeat && "hidden!"}`}
              disabled={disabled}
            >
              <ClockIcon />
              Schedule
            </Button>
          </div>

          <Table striped className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
              <TableRow>
                <TableHeader>Date &amp; Time</TableHeader>
                <TableHeader>Repeats</TableHeader>
                <TableHeader>Invited</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {checkIns.map((checkIn) => (
                <CheckIn key={checkIn.id} data={checkIn} timezone={companies[0].timezone} disabled={disabled} />
              ))}
            </TableBody>
          </Table>

          <TablePagination page={page} pageCount={pageCount} route="/assessments" />
        </div>
      ) : checkIns ? (
        <EmptyState className={doodleLoaded ? "fade-in" : "opacity-0"}>
          <Doodle doodles={28} onLoad={() => setDoodleLoaded(true)} />
          <Subheading className="mt-4">No check-ins scheduled</Subheading>

          <Text className="mt-1 text-center">
            Schedule your first check-in to start collecting early risk signals and enable concern reporting.
          </Text>

          <Button onClick={() => setDialogOpen(true)} color="indigo" className="mt-6" disabled={disabled}>
            <ClockIcon />
            Schedule check-in
          </Button>
        </EmptyState>
      ) : (
        noStaffContacts && (
          <EmptyState className={doodleLoaded ? "fade-in" : "opacity-0"}>
            <Doodle doodles={25} onLoad={() => setDoodleLoaded(true)} />
            <Subheading className="mt-4">No staff contacts</Subheading>
            <Text className="mt-1 text-center">Add staff contacts to enable check-ins.</Text>

            <Button href="/people" outline className="mt-6">
              <UsersIcon />
              Add staff contacts
            </Button>
          </EmptyState>
        )
      )}

      <Dialog open={dialogOpen} onClose={setDialogOpen}>
        <DialogTitle>Schedule a check-in</DialogTitle>

        <DialogDescription className="text-wrap!">
          Employees will be notified when the check-in begins and can respond anonymously using a shared access PIN.
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
                  <option value="7">Every week</option>
                  <option value="14">Every 2 weeks</option>
                  <option value="28">Every 4 weeks</option>
                  <option value="56">Every 8 weeks</option>
                  <option value="84">Every 12 weeks</option>
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

          <Button onClick={() => scheduleClick()} color="indigo" disabled={disabled || !scheduled}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
