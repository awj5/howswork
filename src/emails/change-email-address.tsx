import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type ChangeEmailAddressProps = {
  name: string;
  email: string;
  newEmail: string;
};

export default function ChangeEmailAddress(props: ChangeEmailAddressProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi {props.name},</Text>

            <Text className="text-[16px]">
              We received a request to change the email address for your <strong>HowsWork</strong> account.
            </Text>

            <Text className="text-[16px]">To confirm this change, click the button below:</Text>

            <Button
              href="{{ .ConfirmationURL }}"
              className="rounded-[6px] bg-indigo-500 px-[16px] py-[12px] text-[14px] font-semibold text-white"
            >
              Confirm email change
            </Button>

            <Text className="text-[16px]">
              This will update your email from <strong>{props.email}</strong> to <strong>{props.newEmail}</strong>.
            </Text>

            <Text className="text-[14px] leading-[20px] text-zinc-500">This link expires in 1 hour.</Text>

            <Text className="text-[14px] leading-[20px] text-zinc-500">
              If you didn&apos;t request this change, you can safely ignore this email. Your existing email address will
              remain active.
            </Text>

            <Hr className="border-zinc-950/10" />

            <Text className="text-[12px] leading-[16px] text-zinc-500">
              HowsWork
              <br />
              Questions? Contact us at support@howswork.app
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// eslint-disable-next-line
(ChangeEmailAddress as any).PreviewProps = {
  name: "Adam",
  email: "adam@howswork.app",
  newEmail: "adam@howswork.app",
} as ChangeEmailAddressProps;
