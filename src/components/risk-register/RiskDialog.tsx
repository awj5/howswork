import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import StatusData from "@/data/status.json";
import { addEditRisk, getRiskData } from "@/app/(protected)/risk-register/actions";
import { useCompanies } from "@/hooks/useCompanies";
import { useUserContext } from "@/hooks/useUserContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Divider } from "@/components/ui/divider";
import { ErrorMessage, Field, Label } from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import Issues from "./risk-dialog/Issues";
import Owner from "./risk-dialog/Owner";

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
  response?: boolean;
  dateResolved?: string;
};

export default function RiskDialog(props: RiskDialogProps) {
  const companies = useCompanies();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserContext();
  const aiDescriptionRef = useRef("");
  const aiResponseRef = useRef("");
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [dateRaised, setDateRaised] = useState("");
  const [dateReviewed, setDateReviewed] = useState("");
  const [issues, setIssues] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("2");
  const [status, setStatus] = useState("1");
  const [owner, setOwner] = useState("");
  const [response, setResponse] = useState("");
  const [concernID, setConcernID] = useState(0);
  const [dateResolved, setDateResolved] = useState("");

  const dateReviewedChange = (val: string) => {
    setDateReviewed(val);
    if (status === "1") setStatus("2");
  };

  const dateResolvedChange = (val: string) => {
    setDateResolved(val);
    if (val) setStatus("4");
  };

  const submit = async () => {
    if (!companies.length) return;

    // Validate
    const errors: FormErrorsType = {};
    if (!dateRaised) errors.dateRaised = true;

    if (status !== "1" && !dateReviewed) {
      errors.dateReviewed = "Required when status is not Open.";
    } else if (dateReviewed && dateReviewed < dateRaised) {
      errors.dateReviewed = "Cannot be before date raised.";
    }

    if (!description.trim()) errors.description = true;
    if (Number(status) > 2 && !response.trim()) errors.response = true; // Response required when status is beyond under review

    if (status === "4" && !dateResolved) {
      errors.dateResolved = "Required when status is Resolved.";
    } else if (status !== "4" && dateResolved) {
      errors.dateResolved = "Status is not Resolved.";
    } else if (dateResolved && dateResolved < dateRaised) {
      errors.dateResolved = "Cannot be before date raised.";
    } else if (dateResolved && dateResolved < dateReviewed) {
      errors.dateResolved = "Cannot be before date reviewed.";
    }

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
        level: Number(level),
        status: Number(status),
        owner,
        response,
        ai_description: !!(aiDescriptionRef.current && aiDescriptionRef.current === description),
        concern_id: concernID,
        date_resolved: dateResolved,
        ai_response: !!(aiResponseRef.current && aiResponseRef.current === response),
      },
      props.id
    );

    props.setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success(props.id ? "Risk updated" : "Risk added");
    props.setOpen(false); // Close

    if (searchParams.get("page") && searchParams.get("page") !== "1" && searchParams.get("issue")) {
      router.push(`/risk-register?issue=${searchParams.get("issue")}`); // Clear page param
    } else {
      props.getRisks(); // Reload list
    }
  };

  useEffect(() => {
    if (!props.open || !user) return;

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
      setDateReviewed(result.data?.date_reviewed?.slice(0, 10) ?? "");
      setIssues(result.data?.issues ?? []);
      aiDescriptionRef.current = result.data?.ai_description ? result.data.description : "";
      setDescription(result.data?.description);
      setLevel(String(result.data?.level));
      setStatus(String(result.data?.status));
      setOwner(result.data?.owner ?? "");
      aiResponseRef.current = result.data?.ai_response ? result.data.response : "";
      setResponse(result.data?.response ?? "");
      setConcernID(result.data?.concern_id ?? 0);
      setDateResolved(result.data?.date_resolved?.slice(0, 10) ?? "");
    };

    // Reset on open
    setDateRaised("");
    setDateReviewed("");
    setIssues([]);
    aiDescriptionRef.current = "";
    setDescription("");
    setLevel("2");
    setStatus("1");
    setOwner(`${user.first_name} ${user.last_name}`); // Set to auth user
    aiResponseRef.current = "";
    setResponse("");
    setConcernID(0);
    setFormErrors({});
    setDateResolved("");

    if (props.id) getRisk(); // Edit risk
  }, [props.open, user]);

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
          <Field disabled={props.disabled || !!concernID}>
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
            <Label>Risk level</Label>

            <Select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </Select>
          </Field>
        </div>

        <Divider className="my-8" soft />
        <Issues val={issues} setVal={setIssues} disabled={props.disabled} />
        <Divider className="my-8" soft />

        <Field disabled={props.disabled}>
          <Label>Description</Label>

          <Textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={"What's happening, who's affected, and how was it identified?"}
            invalid={formErrors.description}
          />

          {formErrors.description && <ErrorMessage>This field is required.</ErrorMessage>}
        </Field>

        <Divider className="my-8" soft />

        <div className="grid grid-cols-2 gap-4">
          <Field disabled={props.disabled || !!concernID}>
            <Label className="inline-flex items-center gap-1.5">Status</Label>

            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {StatusData.slice(1, -1).map((status) => (
                <option key={status.id} value={status.id} disabled={status.id === 1 && !!dateReviewed}>
                  {status.title.replace("New response", "Open")}
                </option>
              ))}
            </Select>
          </Field>

          <Field disabled={props.disabled || !!concernID}>
            <Label>Review date</Label>

            <Input
              type="date"
              value={dateReviewed}
              onChange={(e) => dateReviewedChange(e.target.value)}
              invalid={!!formErrors.dateReviewed}
            />

            {formErrors.dateReviewed && <ErrorMessage>{formErrors.dateReviewed}</ErrorMessage>}
          </Field>
        </div>

        {!!concernID && (
          <div className="mt-6 flex items-center gap-1.5">
            <ExclamationCircleIcon aria-hidden="true" className="size-5" />
            <Text>Status is managed from the linked concern.</Text>
          </div>
        )}

        <Divider className="my-8" soft />

        <Field disabled={props.disabled}>
          <Label>Response</Label>

          <Textarea
            rows={6}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={"What controls or actions are being taken to address this risk?"}
            invalid={formErrors.response}
          />

          {formErrors.response && <ErrorMessage>Required when status is Action planned or Resolved.</ErrorMessage>}
        </Field>

        <Divider className="my-8" soft />

        <div className="grid grid-cols-2 gap-4">
          <Field disabled={props.disabled || !!concernID}>
            <Label>Resolved date</Label>

            <Input
              type="date"
              value={dateResolved}
              onChange={(e) => dateResolvedChange(e.target.value)}
              invalid={!!formErrors.dateResolved}
            />

            {formErrors.dateResolved && <ErrorMessage>{formErrors.dateResolved}</ErrorMessage>}
          </Field>

          <Owner val={owner} setVal={setOwner} disabled={props.disabled} />
        </div>

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
