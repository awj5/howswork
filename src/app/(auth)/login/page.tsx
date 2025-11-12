"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./action";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("return_to", searchParams.get("return_to") ?? "/"); // Redirect URL on login
    const result = await login(formData);

    if (result.error) {
      console.error(result.error);
    } else {
      setSent(true);
    }

    setSubmitting(false);
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-10" />

        <div>
          <Heading>{sent ? "Magic link sent" : "Sign in to MoodCheck"}</Heading>

          <Text>
            {sent ? "Check your email to sign in securely." : "Access your wellbeing and compliance dashboard."}
          </Text>
        </div>

        {!sent && (
          <>
            <Field disabled={submitting}>
              <Label>Email</Label>
              <Input type="email" name="email" required />
            </Field>

            <Button type="submit" className="w-full" outline disabled={submitting}>
              Continue
            </Button>

            <Text>
              New to MoodCheck?{" "}
              <TextLink href="/sign-up">
                <Strong>Sign up</Strong>
              </TextLink>
            </Text>
          </>
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
