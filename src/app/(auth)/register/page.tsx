"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signup } from "./action";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Field, Label, Fieldset, ErrorMessage } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
import { Logo } from "@/components/Logo";

function RegisterForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("return_to", searchParams.get("return_to") ?? "/"); // Redirect URL on login
    const result = await signup(formData);

    if (result.error) {
      setError(true);
      console.error(result.error);
    } else {
      setSent(true);
    }

    setSubmitting(false);
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-7" />

        <div className="flex flex-col gap-1">
          <Heading>{sent ? "Set up complete!" : "Set up your company"}</Heading>
          {sent && <Text>A secure sign in link has been sent to your email.</Text>}
        </div>

        {!sent && (
          <Fieldset className="flex flex-col gap-8" disabled={submitting}>
            <Field>
              <Label>Email</Label>
              <Input type="email" name="email" invalid={error} required />
              {error && <ErrorMessage>This email already has an account.</ErrorMessage>}
            </Field>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
              <Field>
                <Label>First name</Label>
                <Input name="first_name" required />
              </Field>

              <Field>
                <Label>Last name</Label>
                <Input name="last_name" required />
              </Field>
            </div>

            <Field>
              <Label>Company name</Label>
              <Input name="company" required />
            </Field>

            <Button type="submit" className="w-full" outline>
              Create account
            </Button>

            <Text>
              Already using MoodCheck?{" "}
              <TextLink href="/login">
                <Strong>Sign in</Strong>
              </TextLink>
            </Text>
          </Fieldset>
        )}
      </form>
    </AuthLayout>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div />}>
      <RegisterForm />
    </Suspense>
  );
}
