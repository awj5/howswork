"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/16/solid";
import { updateAccount, deleteAccount } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/hooks/useUserContext";
import { Heading, Subheading } from "@/components/heading";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Text } from "@/components/text";
import { Divider } from "@/components/divider";
import { Input } from "@/components/input";
import { ErrorMessage, Field, Fieldset, Label } from "@/components/fieldset";
import { Button } from "@/components/button";

export default function Account() {
  const { user, setUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFirstNameError(false);
    setLastNameError(false);
    setEmailError(false);

    // Validate
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName) {
      setFirstNameError(true);
      return;
    }

    if (!cleanLastName) {
      setLastNameError(true);
      return;
    }

    if (!cleanEmail.includes("@")) {
      setEmailError(true);
      return;
    }

    // Update
    setDisabled(true);

    const result = await updateAccount({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
    });

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    if (result.emailChanged) {
      // Logout and reload if email changed
      logout();
      return;
    }

    // Update context
    setUser((prev) =>
      prev
        ? {
            ...prev,
            firstName: cleanFirstName,
            lastName: cleanLastName,
            email: cleanEmail,
          }
        : prev
    );

    // Success
    toast.success("Changes saved.");
    setDisabled(false);
  };

  const deleteClick = async () => {
    setDisabled(true);
    setConfirmDelete(false);
    const result = await deleteAccount();

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    //logout();
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
              invalid={firstNameError}
            />

            {firstNameError && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>

          <Field>
            <Label>Last name</Label>

            <Input
              name="last_name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              invalid={lastNameError}
            />

            {lastNameError && <ErrorMessage>This field is required.</ErrorMessage>}
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
              invalid={emailError}
            />

            {emailError && <ErrorMessage>This field is required.</ErrorMessage>}
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

            <AlertDescription>
              {user?.email
                ? "Deleting your account is permanent. If you are the only company admin, all company data will also be permanently deleted."
                : "This action cannot be undone. Your account will be permanently deleted."}
            </AlertDescription>

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
