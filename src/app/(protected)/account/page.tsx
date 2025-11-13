"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { UserContext } from "@/context/user";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";
import { Divider } from "@/components/divider";
import { Input } from "@/components/input";
import { Field, Fieldset, Label } from "@/components/fieldset";
import { Button } from "@/components/button";

export default function Account() {
  const user = useContext(UserContext);
  const [email, setEmail] = useState<string | undefined>("");
  const [firstName, setFirstName] = useState<string | undefined>("");
  const [lastName, setLastName] = useState<string | undefined>("");
  const [submitting, setSubmitting] = useState(true);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(false);
    setSubmitting(true);
    const supabase = createClient();

    // Update profile
    const { error: updateProfilesError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: firstName,
      })
      .eq("id", user?.id);

    if (updateProfilesError) {
      toast.error(updateProfilesError.message);
      console.error(updateProfilesError);
      setSubmitting(false);
      return;
    }

    // Update user
    /*const { error } = await supabase.auth.updateUser({
      email: email,
    });*/

    // Success
    toast.success("Changes saved.");
    setSubmitting(false);
  };

  useEffect(() => {
    // Get user details from context
    setEmail(user?.email);
    setFirstName(user?.firstName);
    setLastName(user?.lastName);
    setSubmitting(false);
  }, []);

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl">
      <Heading>My Account</Heading>
      <Divider className="mt-6 mb-10" />

      <Fieldset disabled={submitting}>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field>
            <Label>First name</Label>
            <Input
              name="first_name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label>Last name</Label>
            <Input name="last_name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
          </Field>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Email</Subheading>
            <Text>You'll need to sign in again if you change this.</Text>
          </div>

          <div>
            <Input
              type="email"
              aria-label="Email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
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
