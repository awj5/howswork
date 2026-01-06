import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type InviteAdminProps = {
  company: string;
  url: string;
};

export default function InviteAdmin(props: InviteAdminProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://www.howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi there,</Text>

            <Text className="text-[16px]">
              <strong>{props.company}</strong> has invited you to access <strong>HowsWork</strong> as an administrator.
            </Text>

            <Text className="text-[16px]">
              To accept the invitation and set up your account, use the secure link below:
            </Text>

            <Button
              href={props.url}
              className="rounded-[6px] bg-indigo-600 px-[14px] py-[10px] text-[14px] font-semibold text-white"
            >
              Accept the invitation
            </Button>

            <Text className="text-[14px] text-gray-600">
              If you were not expecting this invitation, you can safely ignore this email.
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
(InviteAdmin as any).PreviewProps = {
  company: "Acme, Inc.",
} as InviteAdminProps;
