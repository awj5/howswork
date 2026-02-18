import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { addEditRisk, getRiskData } from "@/app/(protected)/risk-register/actions";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Divider } from "@/components/ui/divider";
import { ErrorMessage, Field, Label } from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Issues from "./risk-dialog/Issues";

type RiskDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  getRisks: () => Promise<void>;
  id: number;
};

type FormErrorsType = {
  dateRaised?: boolean;
  dateReviewed?: string;
  description?: boolean;
};

export default function RiskDialog(props: RiskDialogProps) {
  const companies = useCompanies();
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [dateRaised, setDateRaised] = useState("");
  const [dateReviewed, setDateReviewed] = useState("");
  const [issues, setIssues] = useState<number[]>([]);
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (!companies.length) return;

    // Validate
    const errors: FormErrorsType = {};
    if (!dateRaised) errors.dateRaised = true;

    if (!dateReviewed) {
      errors.dateReviewed = "This field is required.";
    } else if (dateReviewed < dateRaised) {
      errors.dateReviewed = "Must be after date raised.";
    }

    if (!description.trim()) errors.description = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Add risk
    props.setDisabled(true);

    const result = await addEditRisk(
      companies[0].id,
      {
        date_raised: dateRaised,
        date_reviewed: dateReviewed,
        issues,
        description,
      },
      props.id ?? undefined
    );

    props.setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success(props.id ? "Risk updated" : "Risk added");
    props.setOpen(false); // Close
    props.getRisks(); // Reload risk list
  };

  useEffect(() => {
    if (!props.open) return;

    const getRisk = async () => {
      props.setDisabled(true);
      const result = await getRiskData(props.id);
      props.setDisabled(false);

      if (result.error) {
        toast.error(result.error);
        props.setOpen(false); // Close
        return;
      }

      setDateRaised(result.data?.date_raised?.slice(0, 10));
      setDateReviewed(result.data?.date_reviewed?.slice(0, 10));
      setIssues(result.data?.issues ?? []);
      setDescription(result.data?.description);
    };

    // Reset on open
    setDateRaised("");
    setDateReviewed("");
    setIssues([]);
    setDescription("");
    setFormErrors({});

    if (props.id) getRisk(); // Edit risk
  }, [props.open]);

  return (
    <Dialog open={props.open} onClose={props.setOpen} size="2xl">
      <DialogTitle>{props.id ? "Edit" : "Add a"} risk</DialogTitle>

      <DialogDescription className="text-wrap!">
        {props.id
          ? "Edit the details of this risk. Changes won't affect linked concerns or check-in data."
          : "Manually add a risk identified outside of HowsWork, such as from a workplace observation, incident, or team meeting."}
      </DialogDescription>

      <DialogBody>
        <Divider className="mb-8" />

        <div className="grid grid-cols-2 gap-4">
          <Field disabled={props.disabled}>
            <Label>Date raised</Label>

            <Input
              type="date"
              value={dateRaised}
              onChange={(e) => setDateRaised(e.target.value)}
              invalid={formErrors.dateRaised}
            />

            {formErrors.dateRaised && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>

          <Field disabled={props.disabled}>
            <Label>Review date</Label>

            <Input
              type="date"
              value={dateReviewed}
              onChange={(e) => setDateReviewed(e.target.value)}
              invalid={!!formErrors.dateReviewed}
            />

            {formErrors.dateReviewed && <ErrorMessage>{formErrors.dateReviewed}</ErrorMessage>}
          </Field>
        </div>

        <Divider className="my-8" soft />
        <Issues val={issues} setVal={setIssues} disabled={props.disabled} />
        <Divider className="my-8" soft />

        <Field disabled={props.disabled}>
          <Label>Description</Label>

          <Textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={"What's happening, who's affected, and how was it identified?"}
            invalid={formErrors.description}
          />

          {formErrors.description && <ErrorMessage>This field is required.</ErrorMessage>}
        </Field>

        <Divider className="mt-8" soft />
      </DialogBody>

      <DialogActions>
        <Button plain onClick={() => props.setOpen(false)}>
          Cancel
        </Button>

        <Button onClick={submit} color="indigo" disabled={props.disabled}>
          {props.id ? "Save changes" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
