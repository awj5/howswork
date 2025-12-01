"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { isValidEmail } from "@/utils/helpers";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Field, Label, Fieldset, ErrorMessage } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
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

    if (isInvite) {
      formData.set("email", inviteEmail);
      formData.set("company", inviteCompany);
    }

    const toastLoading = toast.loading("Creating...");
    const result = await signUp(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      setSubmitted(true);
    }

    toast.dismiss(toastLoading);
    setDisabled(false);
  };

  return (
    <AuthLayout>
      <form onSubmit={submitForm} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-6" />

        <div className="flex flex-col gap-1">
          <Heading>
            {submitted && isInvite
              ? "Invite accepted!"
              : submitted
                ? "Set up complete!"
                : isInvite
                  ? `Access your ${inviteCompany} dashboard`
                  : "Set up your company"}
          </Heading>

          {submitted && <Text>We've sent a secure sign-in link to your email.</Text>}
        </div>

        {!submitted && (
          <Fieldset className="flex flex-col gap-8" disabled={disabled}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
              <Field>
                <Label>First name</Label>
                <Input name="first_name" invalid={formErrors.first_name} />
                {formErrors.first_name && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>

              <Field>
                <Label>Last name</Label>
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

              {formErrors.email && <ErrorMessage>This field is required.</ErrorMessage>}
            </Field>

            {!isInvite && (
              <Field>
                <Label>Company name</Label>
                <Input name="company" invalid={formErrors.company} />
                {formErrors.company && <ErrorMessage>This field is required.</ErrorMessage>}
              </Field>
            )}

            <Button type="submit" className="w-full" color="indigo">
              {isInvite ? "Accept invite" : "Create account"}
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
