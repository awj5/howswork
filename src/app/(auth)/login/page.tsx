"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { isValidEmail } from "@/utils/helpers";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { ErrorMessage, Field, Fieldset, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
import { Logo } from "@/components/Logo";
import { login } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const [disabled, setDisabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(false);
    const formData = new FormData(e.currentTarget);

    // Validate
    const email = formData.get("email") as string;

    if (!isValidEmail(email)) {
      setEmailError(true);
      return;
    }

    // Fetch
    setDisabled(true);
    formData.set("return_to", searchParams.get("return_to") ?? "/"); // Redirect URL on login
    const loadingToast = toast.loading("Verifying...");
    const result = await login(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      setSubmitted(true);
    }

    toast.dismiss(loadingToast);
    setDisabled(false);
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-6" />

        <div className="flex flex-col gap-1">
          <Heading>{submitted ? "Check your email" : "Sign in to your dashboard"}</Heading>
          {submitted && <Text>We've sent you a secure sign-in link.</Text>}
        </div>

        {!submitted && (
          <Fieldset className="flex flex-col gap-8" disabled={disabled}>
            <Field>
              <Label>Email</Label>
              <Input type="email" name="email" invalid={emailError} />
              {emailError && <ErrorMessage>This field is required.</ErrorMessage>}
            </Field>

            <Button type="submit" className="w-full" outline>
              Continue
            </Button>

            <Text>
              New to MoodCheck?{" "}
              <TextLink href="/register">
                <Strong>Set up your company</Strong>
              </TextLink>
            </Text>
          </Fieldset>
        )}
      </form>
    </AuthLayout>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}
