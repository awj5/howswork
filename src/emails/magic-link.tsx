import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type MagicLinkProps = {
  name: string;
};

export default function MagicLink(props: MagicLinkProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi {props.name},</Text>

            <Text className="text-[16px]">
              Click the link below to access your <strong>HowsWork</strong> dashboard.
            </Text>

            <Button
              href="{{ .ConfirmationURL }}"
              className="rounded-[6px] bg-indigo-600 px-[16px] py-[12px] text-[14px] font-semibold text-white"
            >
              Sign in to HowsWork
            </Button>

            <Text className="text-[14px] leading-[20px] text-gray-600">This link expires in 1 hour.</Text>

            <Text className="text-[14px] leading-[20px] text-gray-600">
              If you didn&apos;t request this email, you can safely ignore it.
            </Text>

            <Hr className="border-gray-900/10" />

            <Text className="text-[12px] leading-[16px] text-gray-600">
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
(MagicLink as any).PreviewProps = {
  name: "Adam",
} as MagicLinkProps;
