import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { SparklesIcon, ArrowPathIcon } from "@heroicons/react/16/solid";
import { suggestActions } from "@/utils/ai";
import { getRiskData } from "@/app/(protected)/risk-register/actions";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type SuggestActionsProps = {
  riskID: number;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function SuggestActions(props: SuggestActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  const generateClick = async () => {
    props.setDisabled(true);
    const loadingToast = toast.loading("Thinking...");

    try {
      const riskData = await getRiskData(props.riskID);
      if (riskData.error) throw riskData.error;
      const result = await suggestActions(riskData.data?.description);
      if (result.error) throw result.error;

      // Success
      setSuggestion(result);
      setDialogOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      props.setDisabled(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <>
      <Button
        onClick={generateClick}
        className={`bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent! ${!props.disabled && "hover:from-indigo-400 hover:to-fuchsia-400 hover:[&>svg]:fill-indigo-400"}`}
        outline
      >
        <SparklesIcon className="fill-indigo-500" />
        Suggest actions
      </Button>

      <Dialog open={dialogOpen} onClose={setDialogOpen} size="2xl">
        <DialogTitle>Suggested actions</DialogTitle>

        <DialogDescription className="text-wrap!">
          These suggestions are based on best practice. Adjust them to fit your workplace and record any actions taken.
        </DialogDescription>

        <DialogBody className="text-sm/6 whitespace-pre-line text-zinc-900 dark:text-white">{suggestion}</DialogBody>

        <DialogActions>
          <Button
            onClick={generateClick}
            className={`bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent! ${!props.disabled && "hover:from-indigo-400 hover:to-fuchsia-400 hover:[&>svg]:fill-indigo-400"}`}
            outline
            disabled={props.disabled}
          >
            <ArrowPathIcon className="fill-indigo-500" />
            Regenerate
          </Button>

          <Button onClick={() => setDialogOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
