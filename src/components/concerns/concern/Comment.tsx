import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { addComment } from "@/app/(protected)/concerns/[id]/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/fieldset";
import { Textarea } from "@/components/ui/textarea";

type CommentProps = {
  concernID: number;
  dialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  getConcern: () => Promise<void>;
};

export default function Comment(props: CommentProps) {
  const companies = useCompanies();
  const [val, setVal] = useState("");

  const submit = async () => {
    if (!companies.length) return;
    props.setDisabled(true);
    const result = await addComment(props.concernID, val, companies[0].id);

    if (result.error) {
      toast.error(result.error);
      props.setDisabled(false);
      return;
    }

    // Success
    toast.success("Comment added");
    props.setDialogOpen(false); // Close
    props.getConcern();
  };

  useEffect(() => {
    if (!props.dialogOpen) return;
    setVal(""); // Reset on open
  }, [props.dialogOpen]);

  return (
    <Dialog open={props.dialogOpen} onClose={props.setDialogOpen}>
      <DialogTitle>Add a comment</DialogTitle>

      <DialogDescription className="text-wrap!">
        Add updates or questions to help resolve this concern. The employee and other admins will be able to see it.
      </DialogDescription>

      <DialogBody>
        <Field>
          <Textarea
            rows={5}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={"Share your update&hellip;"}
            disabled={props.disabled}
            maxLength={800}
          />
        </Field>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={() => props.setDialogOpen(false)}>
          Cancel
        </Button>

        <Button onClick={submit} color="indigo" disabled={!val.trim().length || props.disabled}>
          Add comment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
