import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/16/solid";
import { openStripe } from "@/app/(protected)/settings/actions";
import { useCompanies } from "@/hooks/useCompanies";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ViewSummaryProps = {
  disabled: boolean;
};

export default function ViewSummary(props: ViewSummaryProps) {
  const companies = useCompanies();
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setAlertOpen(true)} className="gradient-text" outline disabled={props.disabled}>
        <SparklesIcon className="fill-indigo-500" />
        View summary
      </Button>

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle className="gradient-text pointer-events-none inline">Unlock AI features</AlertTitle>

        <AlertDescription>
          Get auto-generated risk descriptions and response notes. Available on paid plans.
        </AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={() => (companies.length ? openStripe(companies[0].stripe_customer_id!) : null)}
            color="indigo"
          >
            Upgrade
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
