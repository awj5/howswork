"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Field, Label, Fieldset } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
import { Logo } from "@/components/Logo";

export default function SignUp() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    //
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-10" />

        <div>
          <Heading>Create your company account</Heading>
          <Text>Set up your company's dashboard for psychological safety and risk reporting.</Text>
        </div>

        <Fieldset className="flex flex-col gap-8" disabled={submitting}>
          <Field>
            <Label>Email</Label>
            <Input type="email" name="email" />
          </Field>

          <Field>
            <Label>First name</Label>
            <Input name="first_name" />
          </Field>

          <Field>
            <Label>Last name</Label>
            <Input name="last_name" />
          </Field>

          <Field>
            <Label>Company name</Label>
            <Input name="company" />
          </Field>

          <Button type="submit" className="w-full" outline>
            Create company account
          </Button>
        </Fieldset>

        <Text>
          Already using MoodCheck?{" "}
          <TextLink href="/login">
            <Strong>Sign in</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
