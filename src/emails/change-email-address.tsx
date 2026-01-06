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
            <Img src="https://www.howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi {props.name},</Text>

            <Text className="text-[16px]">
              We received a request to change the email address associated with your <strong>HowsWork</strong> account.
            </Text>

            <Text className="text-[16px]">To confirm this change, use the secure link below:</Text>

            <Button
              href="{{ .ConfirmationURL }}"
              className="rounded-[6px] bg-indigo-600 px-[14px] py-[10px] text-[14px] font-semibold text-white"
            >
              Confirm email change
            </Button>

            <Text className="text-[16px]">
              This will update your email from <strong>{props.email}</strong> to <strong>{props.newEmail}</strong>.
            </Text>

            <Text className="text-[14px] text-gray-600">
              If you did not request this change, do not click the link. Your existing email address will remain active.
            </Text>

            <Hr className="border-gray-900/10" />
            <Text className="text-[12px] text-gray-600">HowsWork Pty Ltd, 32 York St, Sydney 2000</Text>
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
