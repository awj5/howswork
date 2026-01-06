import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type MagicLinkProps = {
  name: string;
};

export default function MagicLink(props: MagicLinkProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-6">
            <Img src="https://www.howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-base">Hi {props.name},</Text>

            <Text className="text-base">
              Use the secure link below to sign in to your <strong>HowsWork</strong> dashboard.
            </Text>

            <Button
              href="{{ .ConfirmationURL }}"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white"
            >
              Sign in to HowsWork
            </Button>

            <Text className="text-sm text-gray-600">
              This link is unique to you and will expire shortly for security reasons.
            </Text>

            <Text className="text-sm text-gray-600">If you didn't request this email, you can safely ignore it.</Text>
            <Hr className="border-gray-900/10" />
            <Text className="text-xs text-gray-600">HowsWork Pty Ltd, 32 York St, Sydney 2000</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// eslint-disable-next-line
(MagicLink as any).PreviewProps = {
  name: "Adam",
} as MagicLinkProps;
