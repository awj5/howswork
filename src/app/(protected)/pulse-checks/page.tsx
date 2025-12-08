"use client";

import { useState } from "react";
import { ClockIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Field, FieldGroup, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Select } from "@/components/select";

export default function PulseChecks() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [repeat, setRepeat] = useState("");

  const scheduleClick = async () => {
    console.log(scheduled);
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-4">
        <Heading>Pulse Checks</Heading>

        <Button onClick={() => setDialogOpen(true)} color="indigo">
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
          <FieldGroup>
            <Field>
              <Label>Start date & time</Label>

              <Input type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} />
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
