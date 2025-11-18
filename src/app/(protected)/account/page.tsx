"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/16/solid";
import { updateAccount, deleteAccount } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { isValidEmail } from "@/utils/helpers";
import { useUserContext } from "@/hooks/useUserContext";
import { Heading, Subheading } from "@/components/heading";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Text } from "@/components/text";
import { Divider } from "@/components/divider";
import { Input } from "@/components/input";
import { ErrorMessage, Field, Fieldset, Label } from "@/components/fieldset";
import { Button } from "@/components/button";

type FormErrorsType = {
  first_name?: boolean;
  last_name?: boolean;
  email?: boolean;
};

export default function Account() {
  const { user, setUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload(); // Refresh page
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      firstName,
      lastName,
      email,
    });

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    // Logout and reload if email changed
    if (result.emailChanged) {
      logout();
      return;
    }

    // Update context
    setUser((prev) =>
      prev
        ? {
            ...prev,
            firstName,
            lastName,
            email,
          }
        : prev
    );

    // Success
    toast.success("Changes saved.");
    setDisabled(false);
  };

  const deleteClick = async () => {
    setDisabled(true);
    setConfirmDelete(false); // Close
    const result = await deleteAccount();

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    logout();
  };

  useEffect(() => {
    // Get user details from context
    setEmail(user?.email ?? "");
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setDisabled(false);
  }, []);

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl">
      <Heading>My Account</Heading>
      <Divider className="mt-6 mb-10" />

      <Fieldset disabled={disabled}>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field>
            <Label>First name</Label>

            <Input
              name="first_name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              invalid={formErrors.first_name}
            />

            {formErrors.first_name && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>

          <Field>
            <Label>Last name</Label>

            <Input
              name="last_name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              invalid={formErrors.last_name}
            />

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
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              invalid={formErrors.email}
            />

            {formErrors.email && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>
        </section>

        <Divider className="my-10" soft />

        <div className="flex flex-col-reverse items-end justify-between gap-10 sm:flex-row">
          <Button type="button" onClick={() => setConfirmDelete(true)} color="red">
            <TrashIcon />
            Delete account
          </Button>

          <Alert open={confirmDelete} onClose={setConfirmDelete}>
            <AlertTitle>Are you sure you want to delete your account?</AlertTitle>

            <AlertDescription>This action cannot be undone. Your account will be permanently deleted.</AlertDescription>

            <AlertActions>
              <Button plain onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>

              <Button onClick={deleteClick} color="red">
                Delete
              </Button>
            </AlertActions>
          </Alert>

          <Button type="submit" outline>
            Save changes
          </Button>
        </div>
      </Fieldset>
    </form>
  );
}
