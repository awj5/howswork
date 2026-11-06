import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type CheckInFlaggedProps = {
  company: string;
};

export default function CheckInFlagged(props: CheckInFlaggedProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">
              A recent check-in with <strong>{props.company}</strong> has identified workplace issues and has been added
              to the risk register.
            </Text>

            <Button
              href="https://admin.howswork.app/check-ins/0"
              className="rounded-[6px] bg-indigo-500 px-[16px] py-[12px] text-[14px] font-semibold text-white"
            >
              View check-in
            </Button>

            <Text className="text-[14px] leading-[20px] text-zinc-500">Review recommended within 7 days.</Text>
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
(CheckInFlagged as any).PreviewProps = {
  company: "Acme, Inc.",
} as CheckInFlaggedProps;
