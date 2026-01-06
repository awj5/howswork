"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/16/solid";
import { createClient } from "@/utils/supabase/client";
import { isValidEmail } from "@/utils/helpers";
import { useUserContext } from "@/hooks/useUserContext";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { Heading, Subheading } from "@/components/ui/heading";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { ErrorMessage, Field, Fieldset, Label } from "@/components/ui/fieldset";
import { Button } from "@/components/ui/button";
import { updateAccount, deleteAccount } from "./actions";

type FormErrorsType = {
  first_name?: boolean;
  last_name?: boolean;
  email?: boolean;
};

export default function Account() {
  const supabase = createClient();
  const { user, setUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [alertOpen, setAlertOpen] = useState(false);

  useUnsavedWarning([
    [firstName, user?.first_name],
    [lastName, user?.last_name],
    [email, user?.email],
  ]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Refresh page
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate
    const errors: FormErrorsType = {};
    if (!firstName.trim()) errors.first_name = true;
    if (!lastName.trim()) errors.last_name = true;
    if (!isValidEmail(email)) errors.email = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Update
    setDisabled(true);

    const result = await updateAccount({
      user_id: user?.user_id ?? "",
      first_name: firstName,
      last_name: lastName,
      email,
    });

    // Logout and reload if email changed
    if (result.emailChanged) {
      logout();
      return;
    }

    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Update context
    setUser((prev) =>
      prev
        ? {
            ...prev,
            first_name: firstName,
            last_name: lastName,
            email,
          }
        : prev
    );

    // Success
    toast.success("Changes saved!");
  };

  const deleteAccountClick = async () => {
    setDisabled(true);
    setAlertOpen(false); // Close
    const result = await deleteAccount();

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    logout(); // Success
  };

  useEffect(() => {
    // Get user details from context
    setEmail(user?.email ?? "");
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setDisabled(false);
  }, []);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <div className="flex h-12 items-end sm:h-10">
        <Heading>My Account</Heading>
      </div>

      <Divider className="mt-6 mb-10" />

      <Fieldset disabled={disabled}>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field>
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} invalid={formErrors.first_name} />
            {formErrors.first_name && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>

          <Field>
            <Label>Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} invalid={formErrors.last_name} />
            {formErrors.last_name && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Email</Subheading>

            <Text>
              Changing your email will log you out. You'll need to confirm your new email address before signing back
              in.
            </Text>
          </div>

          <Field>
            <Input
              type="email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={formErrors.email}
            />

            {formErrors.email && <ErrorMessage>Enter a valid email address.</ErrorMessage>}
          </Field>
        </section>

        <Divider className="my-10" soft />

        <div className="flex flex-col-reverse items-end justify-between gap-10 sm:flex-row">
          <Button type="button" onClick={() => setAlertOpen(true)} outline>
            <TrashIcon />
            Delete my account
          </Button>

          <Button type="submit" color="indigo">
            Save changes
          </Button>
        </div>
      </Fieldset>

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to delete your account?</AlertTitle>
        <AlertDescription>This action cannot be undone. Your account will be permanently deleted.</AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={deleteAccountClick} color="red">
            Delete
          </Button>
        </AlertActions>
      </Alert>
    </form>
  );
}
