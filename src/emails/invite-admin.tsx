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
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi there,</Text>

            <Text className="text-[16px]">
              <strong>{props.company}</strong> has invited you to access <strong>HowsWork</strong> as an administrator.
            </Text>

            <Button
              href={props.url}
              className="rounded-[6px] bg-indigo-500 px-[16px] py-[12px] text-[14px] font-semibold text-white"
            >
              Accept the invitation
            </Button>

            <Text className="text-[14px] leading-[20px] text-zinc-500">
              Didn&apos;t expect this invitation? You can safely ignore this email.
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
(InviteAdmin as any).PreviewProps = {
  company: "Acme, Inc.",
} as InviteAdminProps;
