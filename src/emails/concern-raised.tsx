import { Body, Button, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type ConcernRaisedProps = {
  company: string;
};

export default function ConcernRaised(props: ConcernRaisedProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">
              An employee at <strong>{props.company}</strong> has raised a concern and it has been added to the risk
              register.
            </Text>

            <Button
              href="https://admin.howswork.app/concerns/0"
              className="rounded-[6px] bg-indigo-600 px-[16px] py-[12px] text-[14px] font-semibold text-white"
            >
              View concern
            </Button>

            <Text className="text-[14px] text-gray-600">Response recommended within 48 hours.</Text>
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
(ConcernRaised as any).PreviewProps = {
  company: "Acme, Inc.",
} as ConcernRaisedProps;
