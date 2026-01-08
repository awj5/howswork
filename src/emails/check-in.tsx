import { Body, Button, Container, Html, Tailwind, Img, Text, Hr, CodeInline, Link } from "@react-email/components";

type CheckInProps = {
  company: string;
  code: number;
  slug: string;
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
              <strong>{props.company}</strong> is using <strong>HowsWork</strong>, a safe, anonymous way to share how
              you're really doing and raise workplace concerns.
            </Text>

            <Text className="text-[16px]">
              Access code for all <strong>{props.company}</strong> employees:
            </Text>

            <CodeInline className="rounded-[6px] bg-gray-200 px-[4px] py-[2px] text-[20px]">{props.code}</CodeInline>

            <Text className="text-[16px] text-indigo-600">
              <strong>No login, no tracking, fully encrypted.</strong>
            </Text>

            <Text className="text-[16px]">
              <strong>{props.company}</strong> has requested a check-in to understand how things are going.
            </Text>

            <Button
              href={`https://howswork.app/${props.slug}`}
              className="block rounded-[6px] bg-indigo-600 px-[14px] py-[10px] text-center text-[14px] font-semibold text-white"
            >
              Complete check-in
            </Button>

            <Text className="text-[16px]">
              You can also visit https://howswork.app/{props.slug} anytime to raise concerns anonymously.
            </Text>

            <Text className="text-[14px]">
              <Link href="https://articles.howswork.app/how-howswork-protects-your-privacy/">
                Learn more about how HowsWork protects your privacy
              </Link>
            </Text>

            <Text className="text-[14px] text-gray-600">
              Please do not share externally. A new access code is sent with each check-in request.
            </Text>

            <Hr className="border-gray-900/10" />

            <Text className="text-[12px] text-gray-600">
              HowsWork Pty Ltd, 32 York St, Sydney 2000
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
(CheckIn as any).PreviewProps = {
  company: "Acme, Inc.",
  code: 123456,
  slug: "acmeinc",
} as CheckInProps;
