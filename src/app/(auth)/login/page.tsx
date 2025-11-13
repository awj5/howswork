"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { login } from "./action";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { ErrorMessage, Field, Fieldset, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setSubmitting(true);
    toast.loading("Verifying...");
    const formData = new FormData(e.currentTarget);
    formData.set("return_to", searchParams.get("return_to") ?? "/"); // Redirect URL on login
    const result = await login(formData);

    if (result.error) {
      setError(true);
      console.error(result.error);
    } else {
      setSent(true);
    }

    toast.dismiss();
    setSubmitting(false);
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-7" />

        <div className="flex flex-col gap-1">
          <Heading>{sent ? "Check your email" : "Sign in to your dashboard"}</Heading>
          {sent && <Text>We've sent you a secure sign-in link.</Text>}
        </div>

        {!sent && (
          <Fieldset className="flex flex-col gap-8" disabled={submitting}>
            <Field>
              <Label>Email</Label>
              <Input type="email" name="email" invalid={error} required />
              {error && <ErrorMessage>No account found for this email.</ErrorMessage>}
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
