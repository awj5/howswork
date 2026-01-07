import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type CheckInProps = {
  company: string;
};

export default function CheckIn(props: CheckInProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://www.howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi there,</Text>

            <Text className="text-[16px]">
              Your organisation has requested a <strong>HowsWork</strong> check-in.
            </Text>

            <Button
              href="{{ .ConfirmationURL }}"
              className="rounded-[6px] bg-indigo-600 px-[14px] py-[10px] text-[14px] font-semibold text-white"
            >
              Sign in to HowsWork
            </Button>

            <Text className="text-[14px] text-gray-600">
              This link is unique to you and will expire shortly for security reasons.
            </Text>

            <Text className="text-[14px] text-gray-600">
              If you didn't request this email, you can safely ignore it.
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
(CheckIn as any).PreviewProps = {
  company: "Acme, Inc.",
} as CheckInProps;
