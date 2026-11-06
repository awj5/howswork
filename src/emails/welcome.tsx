import { Body, Container, Html, Tailwind, Img, Text, Hr, Link } from "@react-email/components";

type WelcomeProps = {
  company: string;
};

export default function Welcome(props: WelcomeProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi there,</Text>

            <Text className="text-[16px]">
              <strong>{props.company}</strong> uses <strong>HowsWork</strong> to give you a safe, anonymous way to share
              how things are going at work and raise any concerns.
            </Text>

            <Text className="text-[16px]">
              You&apos;ll receive a quick check-in soon. After your first check-in, you can also raise a concern at any
              time. Your responses are always anonymous and can never be traced back to you.
            </Text>

            <Text className="text-[16px] text-indigo-500">
              <strong>No login. No tracking. Fully encrypted.</strong>
            </Text>

            <Text className="text-[14px] leading-[20px]">
              <Link
                href="https://howswork.app/articles/how-howswork-protects-your-privacy/"
                className="text-indigo-500"
              >
                Learn more about how HowsWork protects your privacy
              </Link>
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
(Welcome as any).PreviewProps = {
  company: "Acme, Inc.",
} as WelcomeProps;
