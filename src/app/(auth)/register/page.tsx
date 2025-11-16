"use client";

import { Suspense, useState } from "react";
import { toast } from "sonner";
import { signUp } from "./actions";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Field, Label, Fieldset, ErrorMessage } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
import { Logo } from "@/components/Logo";

function RegisterForm() {
  const [disabled, setDisabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [companyError, setCompanyError] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFirstNameError(false);
    setLastNameError(false);
    setEmailError(false);
    setCompanyError(false);
    const formData = new FormData(e.currentTarget);

    // Validate
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const company = formData.get("company") as string;

    if (!firstName.trim()) {
      setFirstNameError(true);
      return;
    }

    if (!lastName.trim()) {
      setLastNameError(true);
      return;
    }

    if (!email.includes("@")) {
      setEmailError(true);
      return;
    }

    if (!company.trim()) {
      setCompanyError(true);
      return;
    }

    // Fetch
    setDisabled(true);
    const toastId = toast.loading("Creating...");
    const result = await signUp(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      setSubmitted(true);
    }

    toast.dismiss(toastId);
    setDisabled(false);
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-6" />

        <div className="flex flex-col gap-1">
          <Heading>{submitted ? "Set up complete!" : "Set up your company"}</Heading>
          {submitted && <Text>We've sent a secure sign-in link to your email.</Text>}
        </div>

        {!submitted && (
          <Fieldset className="flex flex-col gap-8" disabled={disabled}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
              <Field>
                <Label>First name</Label>
                <Input name="first_name" invalid={firstNameError} />
                {firstNameError && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>

              <Field>
                <Label>Last name</Label>
                <Input name="last_name" invalid={lastNameError} />
                {lastNameError && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>
            </div>

            <Field>
              <Label>Email</Label>
              <Input type="email" name="email" invalid={emailError} />
              {emailError && <ErrorMessage>This field is required.</ErrorMessage>}
            </Field>

            <Field>
              <Label>Company name</Label>
              <Input name="company" invalid={companyError} />
              {companyError && <ErrorMessage>This field is required.</ErrorMessage>}
            </Field>

            <Button type="submit" className="w-full" outline>
              Create account
            </Button>

            <Text>
              Already using PsychSignal?{" "}
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
