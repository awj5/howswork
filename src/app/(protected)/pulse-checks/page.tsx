"use client";

import { useState } from "react";
import { ClockIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { ErrorMessage, Field, FieldGroup, Fieldset, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { addPulseCheck } from "./actions";

export type PulseCheckType = {
  company_id: number;
  scheduled: string;
  repeat: number;
};

export default function PulseChecks() {
  const companies = useCompanies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [repeat, setRepeat] = useState("");
  const [scheduledError, setScheduledError] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const scheduleClick = async () => {
    setScheduledError(false);

    // Validate
    if (!scheduled) {
      setScheduledError(true);
      return;
    }

    // Add
    setDisabled(true);
    const result = await addPulseCheck({ company_id: companies[0].id, scheduled, repeat: Number(repeat) });
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Pulse check scheduled!");
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-4">
        <Heading>Pulse Checks</Heading>

        <Button onClick={() => setDialogOpen(true)} color="indigo" disabled={disabled || !companies.length}>
          <ClockIcon />
          Schedule
        </Button>
      </div>

      <Dialog open={dialogOpen} onClose={setDialogOpen}>
        <DialogTitle>Schedule a pulse check</DialogTitle>

        <DialogDescription>
          Employees will be notified when the pulse check begins and respond anonymously using a shared access pin.
        </DialogDescription>

        <DialogBody>
          <Fieldset disabled={disabled}>
            <FieldGroup>
              <Field>
                <Label>Start date & time</Label>

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
                  <option value="0">Never</option>
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
