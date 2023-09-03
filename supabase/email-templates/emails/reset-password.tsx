import {
  Button,
  Container,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

const ResetPassword = () => {
  return (
    <Tailwind>
      <Container className="bg-white my-auto mx-auto font-sans">
        <Container className="my-10 mx-auto p-5 w-[465px]">
          <Section className="mt-8">
            <Img
              src="https://feeddeck-emails.pages.dev/feeddeck.png"
              width="80"
              height="80"
              alt="Logo Example"
              className="my-0 mx-auto"
            />
          </Section>
          <Text className="text-sm">
            Hi {`{{ .Email }}`},
          </Text>
          <Text className="text-sm">
            Someone recently requested a password change for your FeedDeck
            account. If this was you, you can set a new password by clicking on
            the <strong>"Reset Password"</strong> button below.
          </Text>
          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              pX={20}
              pY={12}
              className="bg-[#49d3b4] rounded text-[#1f2229] text-xs font-semibold no-underline text-center"
              href="{{ .SiteURL }}/confirmation?template=reset-password&confirmation_url={{ .ConfirmationURL }}"
            >
              Reset Password
            </Button>
          </Section>
          <Text className="text-sm">
            Cheers,
            <br />
            The FeedDeck Team
          </Text>
        </Container>
      </Container>
    </Tailwind>
  );
};

export default ResetPassword;
