"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ExportDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function ExportDialog(props: ExportDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.setOpen}>
      <DialogTitle>Export risk register</DialogTitle>

      <DialogDescription className="text-wrap!">
        Download your risk register as an .xlsx or .csv file. Optionally filter by date range.
      </DialogDescription>

      <DialogBody></DialogBody>

      <DialogActions>
        <Button plain onClick={() => props.setOpen(false)}>
          Cancel
        </Button>

        <Button onClick={() => null} color="indigo" disabled={props.disabled}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
