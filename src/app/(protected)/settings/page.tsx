"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/16/solid";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { Heading, Subheading } from "@/components/heading";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Text } from "@/components/text";
import { Divider } from "@/components/divider";
import { Input } from "@/components/input";
import { ErrorMessage, Field, Fieldset } from "@/components/fieldset";
import { Button } from "@/components/button";
import { deleteCompany, updateCompany } from "./actions";

type FormErrorsType = {
  name?: boolean;
};

export default function Settings() {
  const companies = useCompanies();
  const nameRef = useRef("");
  const [name, setName] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [alertOpen, setAlertOpen] = useState(false);

  useUnsavedWarning([[name, nameRef.current]]);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate
    const errors: FormErrorsType = {};
    if (!name.trim()) errors.name = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Update
    setDisabled(true);
    const result = await updateCompany(companies[0].id, name);

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    // Success
    toast.success("Changes saved!");
    nameRef.current = name;
    setDisabled(false);
  };

  const deleteCompanyClick = async () => {
    setDisabled(true);
    setAlertOpen(false); // Close
    const result = await deleteCompany(companies[0].id);

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    // Success (clear and keep disabled)
    setName("");
    nameRef.current = "";
  };

  useEffect(() => {
    if (!companies.length) return;
    setName(companies[0].name);
    nameRef.current = companies[0].name;
    setDisabled(false);
  }, [companies]);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <Heading>Settings</Heading>
      <Divider className="mt-6 mb-10" />

      <Fieldset disabled={disabled}>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Company Name</Subheading>
            <Text>This name will appear to everyone in your organisation.</Text>
          </div>

          <Field>
            <Input
              aria-label="Company Name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              invalid={formErrors.name}
            />

            {formErrors.name && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>
        </section>

        <Divider className="my-10" soft />

        <div className="flex flex-col-reverse items-end justify-between gap-10 sm:flex-row">
          <Button type="button" onClick={() => setAlertOpen(true)} outline>
            <TrashIcon />
            Delete company
          </Button>

          <Button type="submit" color="indigo">
            Save changes
          </Button>
        </div>
      </Fieldset>

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to delete your company?</AlertTitle>
        <AlertDescription>This action cannot be undone. Your company will be permanently deleted.</AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={deleteCompanyClick} color="red">
            Delete
          </Button>
        </AlertActions>
      </Alert>
    </form>
  );
}
