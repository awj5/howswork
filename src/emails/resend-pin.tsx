import { Body, Container, Html, Tailwind, Img, Text, Hr, CodeInline, Link } from "@react-email/components";

type ResendPINProps = {
  company: string;
  code: number;
  slug: string;
};

export default function ResendPIN(props: ResendPINProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi there,</Text>

            <Text className="text-[16px]">
              <strong>{props.company}</strong> is using <strong>HowsWork</strong>, a safe, anonymous way to share how
              you&apos;re really doing and raise workplace concerns.
            </Text>

            <Text className="text-[16px]">
              Access code for all <strong>{props.company}</strong> employees:
            </Text>

            <CodeInline className="rounded-[6px] bg-gray-200 px-[4px] py-[2px] text-[20px]">{props.code}</CodeInline>

            <Text className="text-[16px] text-indigo-600">
              <strong>No login. No tracking. Fully encrypted.</strong>
            </Text>

            <Text className="text-[16px]">
              You can visit https://howswork.app/{props.slug} anytime to raise concerns anonymously.
            </Text>

            <Text className="text-[14px]">
              <Link href="https://articles.howswork.app/how-howswork-protects-your-privacy/">
                Learn more about how HowsWork protects your privacy
              </Link>
            </Text>

            <Text className="text-[14px] text-gray-600">Please do not share externally.</Text>
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
(ResendPIN as any).PreviewProps = {
  company: "Acme, Inc.",
  code: 123456,
  slug: "acmeinc",
} as ResendPINProps;
