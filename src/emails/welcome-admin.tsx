import {
  Body,
  Container,
  Html,
  Tailwind,
  Img,
  Text,
  Hr,
  Link,
  Button,
  Heading,
  Section,
  Row,
  Column,
} from "@react-email/components";

type WelcomeAdminProps = {
  name: string;
  company: string;
};

export default function WelcomeAdmin(props: WelcomeAdminProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi {props.name},</Text>

            <Text className="text-[16px]">
              Your <strong>HowsWork</strong> account for <strong>{props.company}</strong> is set up and ready to go.
            </Text>

            <Text className="mb-[24px] text-[20px] leading-[28px] text-indigo-600">
              <strong>How to get started:</strong>
            </Text>

            {[
              {
                number: 1,
                title: "Add staff contacts",
                description: "Add your team's email addresses or mobile numbers.",
              },
              {
                number: 2,
                title: "Schedule first check-in",
                description: "Choose a check-in frequency. HowsWork handles the rest.",
              },
              {
                number: 3,
                title: "Review your risk register",
                description: "Once responses come in, HowsWork flags any psychosocial risks and recommends actions.",
              },
            ].map((feature) => (
              <Section className="mb-[24px]">
                <Row>
                  <Column width="24" height="24" align="center" valign="top" className="h-[24px] w-[24px] pr-[16px]">
                    <Row>
                      <Column
                        align="center"
                        valign="middle"
                        width="24"
                        height="24"
                        className="h-[24px] w-[24px] rounded-full bg-indigo-600 text-[12px] leading-none font-semibold text-white"
                      >
                        {feature.number}
                      </Column>
                    </Row>
                  </Column>

                  <Column valign="top">
                    <Text className="m-[0px] text-[16px]">
                      <strong>{feature.title}</strong>
                    </Text>

                    <Text className="m-[0px] text-[14px] leading-[20px] text-gray-500">{feature.description}</Text>
                  </Column>
                </Row>
              </Section>
            ))}

            <Button
              href="https://admin.howswork.app/"
              className="rounded-[6px] bg-indigo-600 px-[16px] py-[12px] text-[14px] font-semibold text-white"
            >
              Go to your dashboard
            </Button>

            <Text className="text-[14px] leading-[20px]">
              <Link href="https://articles.howswork.app/how-howswork-uses-ai-to-help-employers-act-faster/">
                Learn more about how HowsWork uses AI to help employers act faster
              </Link>
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
(WelcomeAdmin as any).PreviewProps = {
  name: "Adam",
  company: "Acme, Inc.",
} as WelcomeAdminProps;
