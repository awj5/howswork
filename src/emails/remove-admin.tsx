import { Body, Container, Html, Tailwind, Img, Text, Hr } from "@react-email/components";

type RemoveAdminProps = {
  company: string;
  name: string;
  removedBy: string;
};

export default function RemoveAdmin(props: RemoveAdminProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="font-sans">
          <Container className="py-[24px]">
            <Img src="https://howswork.app/img/email-icon.png" width="32" height="32" alt="HowsWork" />

            <Text className="text-[16px]">Hi {props.name},</Text>

            <Text className="text-[16px]">
              You were removed as an administrator for <strong>{props.company}</strong> on <strong>HowsWork</strong> by{" "}
              {props.removedBy}.
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
(RemoveAdmin as any).PreviewProps = {
  company: "Acme, Inc.",
  name: "Adam",
  removedBy: "Adam Johnson",
} as RemoveAdminProps;
