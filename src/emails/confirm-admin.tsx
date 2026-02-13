import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type ConfirmAdminProps = {
  company: string;
  name: string;
};

export default function ConfirmAdmin(props: ConfirmAdminProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://www.howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi {props.name},</Text>

            <Text className="text-[16px]">
              You&apos;ve been added as an administrator for <strong>{props.company}</strong> on{" "}
              <strong>HowsWork</strong>.
            </Text>

            <Button
              href="https://admin.howswork.app/"
              className="rounded-[6px] bg-indigo-600 px-[16px] py-[12px] text-[14px] font-semibold text-white"
            >
              Sign in to HowsWork
            </Button>

            <Text className="text-[14px] text-gray-600">
              Didn&apos;t expect this? You can safely ignore this email.
            </Text>
            <Hr className="border-gray-900/10" />

            <Text className="text-[12px] text-gray-600">
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
(ConfirmAdmin as any).PreviewProps = {
  company: "Acme, Inc.",
  name: "Adam",
} as ConfirmAdminProps;
