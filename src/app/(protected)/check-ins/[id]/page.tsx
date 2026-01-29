"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { Heading } from "@/components/ui/heading";
import Breadcrumb from "@/components/Breadcrumb";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { removeCheckIn } from "./actions";

export default function CheckIn() {
  const params = useParams<{ id: string }>();
  const companies = useCompanies();
  const [alertOpen, setAlertOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const removeCheckInClick = async () => {
    setAlertOpen(false);
    setDisabled(true);
    const result = await removeCheckIn(Number(params.id), companies[0].id);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Check-in removed");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumb href="/check-ins">Check-ins</Breadcrumb>

      <div className="flex h-12 items-end sm:h-auto lg:mt-8">
        <Heading>Check-In {params.id}</Heading>
      </div>

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
