"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/hooks/useUserContext";
import { Heading, Subheading } from "@/components/heading";
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
    const supabase = createClient();

    // Update profile
    const { error: updateProfilesError } = await supabase
      .from("profiles")
      .update({
        first_name: cleanFirstName,
        last_name: cleanLastName,
      })
      .eq("id", user?.id);

    if (updateProfilesError) {
      toast.error(updateProfilesError.message);
      setDisabled(false);
      return;
    }

    // Update user if email changed
    if (cleanEmail !== user?.email) {
      const { error: authUserError } = await supabase.auth.updateUser({
        email: cleanEmail,
      });

      if (authUserError) {
        toast.error(authUserError.message);
        setDisabled(false);
        return;
      }

      // Logout
      await supabase.auth.signOut();
      window.location.reload();
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
            <Text>You'll need to sign in again if you change this.</Text>
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

        <div className="flex justify-end gap-4">
          <Button type="submit" outline>
            Save changes
          </Button>
        </div>
      </Fieldset>
    </form>
  );
}
