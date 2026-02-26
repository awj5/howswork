import { Dispatch, SetStateAction, useState } from "react";
import { DateTime } from "luxon";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { toLocalMidnightISO, toLocalEndOfDayISO } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ErrorMessage, Field, FieldGroup, Fieldset, Label } from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ExportDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
};

type FormErrorsType = {
  start?: string;
  end?: string;
};

export default function ExportDialog(props: ExportDialogProps) {
  const companies = useCompanies();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [format, setFormat] = useState("xlsx"); // Default
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});

  const submit = async () => {
    if (!companies.length) return;

    // Validate
    const errors: FormErrorsType = {};
    const now = DateTime.now().startOf("day");
    const startDT = DateTime.fromISO(start);
    const endDT = DateTime.fromISO(end);

    if (end && !start) {
      errors.start = "Required when end date is set.";
    } else if (start && startDT > now) {
      errors.start = "Date cannot be in the future.";
    }

    if (start && !end) {
      errors.end = "Required when start date is set.";
    } else if (end && endDT < startDT) {
      errors.end = "Date must be after start date.";
    } else if (end && endDT > now) {
      errors.end = "Date cannot be in the future.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    props.setDisabled(true);
    const loadingToast = toast.loading("Exporting...");

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyID: companies[0].id,
          start: start ? toLocalMidnightISO(start) : undefined,
          end: end ? toLocalEndOfDayISO(end) : undefined,
          format,
        }),
      });

      if (!response.ok) throw new Error();

      // Trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `risk-register.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      props.setOpen(false); // Close dialog
      toast.success("Risk register exported");

      // Reset
      setStart("");
      setEnd("");
      setFormat("xlsx");
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    } finally {
      props.setDisabled(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <Dialog open={props.open} onClose={props.setOpen}>
      <DialogTitle>Export risk register</DialogTitle>

      <DialogDescription className="text-wrap!">
        Download the risk register as an .xlsx or .csv file. Optionally filter by date range.
      </DialogDescription>

      <DialogBody>
        <Fieldset disabled={props.disabled}>
          <FieldGroup>
            <Field>
              <Label>Start date</Label>

              <Input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                invalid={!!formErrors.start}
              />

              {formErrors.start && <ErrorMessage>{formErrors.start}</ErrorMessage>}
            </Field>

            <Field>
              <Label>End date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} invalid={!!formErrors.end} />
              {formErrors.end && <ErrorMessage>{formErrors.end}</ErrorMessage>}
            </Field>

            <Field>
              <Label>Format</Label>

              <Select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="xlsx">.xlsx</option>
                <option value="csv">.csv</option>
              </Select>
            </Field>
          </FieldGroup>
        </Fieldset>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={() => props.setOpen(false)}>
          Cancel
        </Button>

        <Button onClick={submit} color="indigo" disabled={props.disabled}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
