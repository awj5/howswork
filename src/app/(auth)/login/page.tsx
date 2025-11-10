import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";
import { Logo } from "@/components/Logo";

export default function Login() {
  return (
    <AuthLayout>
      <form action={""} method="POST" className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Logo className="h-10" />

        <hgroup>
          <Heading>Sign in to MoodCheck</Heading>
          <Text>Employer dashboard access only.</Text>
        </hgroup>

        <Field>
          <Label>Email</Label>
          <Input type="email" name="email" required />
        </Field>

        <Button type="submit" className="w-full" outline>
          Login
        </Button>

        <Text>
          New to MoodCheck?{" "}
          <TextLink href="#">
            <Strong>Set up your organisation</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
