"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { isValidEmail } from "@/utils/helpers";
import { AuthLayout } from "@/components/ui/auth-layout";
import { Button } from "@/components/ui/button";
import { Field, Label, Fieldset, ErrorMessage, Description } from "@/components/ui/fieldset";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Strong, Text, TextLink } from "@/components/ui/text";
import { Logo } from "@/components/Logo";
import { signUp } from "./actions";

type FormErrorsType = {
  first_name?: boolean;
  last_name?: boolean;
  email?: boolean;
  company?: boolean;
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const [disabled, setDisabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const inviteEmail = searchParams.get("email") || "";
  const inviteCompany = searchParams.get("company") || "";
  const isInvite = !!(inviteEmail && inviteCompany);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate
    const errors: FormErrorsType = {};
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const company = formData.get("company") as string;
    if (!firstName.trim()) errors.first_name = true;
    if (!lastName.trim()) errors.last_name = true;
    if (!isInvite && !isValidEmail(email)) errors.email = true;
    if (!isInvite && !company.trim()) errors.company = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Sign up
    setDisabled(true);

    // Detect browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    formData.set("timezone", timezone);

    if (isInvite) {
      formData.set("email", inviteEmail);
      formData.set("company", inviteCompany);
    }

    const toastLoading = toast.loading("Creating...");
    const result = await signUp(formData);
    toast.dismiss(toastLoading);

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    // Success
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <form onSubmit={submitForm} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-6" />

        <Heading>
          {submitted && isInvite
            ? "Invite accepted!"
            : submitted
              ? "Set up complete!"
              : isInvite
                ? `Join ${inviteCompany}`
                : "Set up your company"}
        </Heading>

        {submitted && (
          <>
            <Text>
              <Strong>We've sent a secure sign-in link to your email to access your dashboard.</Strong>
            </Text>

            <Text>If you don't see the email, check your spam or junk folder.</Text>
          </>
        )}

        {!submitted && (
          <Fieldset className="flex flex-col gap-8" disabled={disabled}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
              <Field>
                <Label>First Name</Label>
                <Input name="first_name" invalid={formErrors.first_name} />
                {formErrors.first_name && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>

              <Field>
                <Label>Last Name</Label>
                <Input name="last_name" invalid={formErrors.last_name} />
                {formErrors.last_name && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>
            </div>

            <Field>
              <Label>Email</Label>

              <Input
                type="email"
                name="email"
                defaultValue={inviteEmail}
                invalid={formErrors.email}
                disabled={isInvite}
              />

              {formErrors.email && <ErrorMessage>Enter a valid email address.</ErrorMessage>}
            </Field>

            {!isInvite && (
              <Field>
                <Label>Company Name</Label>
                <Input name="company" invalid={formErrors.company} />
                {formErrors.company && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>
            )}

            <Button type="submit" className="w-full" color="indigo">
              {isInvite ? "Accept invite" : "Create company"}
            </Button>

            {!isInvite && (
              <Text>
                Already using HowsWork?{" "}
                <TextLink href="/login">
                  <Strong>Sign in</Strong>
                </TextLink>
              </Text>
            )}
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
