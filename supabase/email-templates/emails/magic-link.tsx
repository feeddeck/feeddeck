import {
  Button,
  Container,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

const InviteUser = () => {
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
            Click the <strong>"Sign In"</strong>{" "}
            button below, to automatically sign in to your FeedDeck account.
          </Text>
          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-[#49d3b4] rounded text-[#1f2229] text-xs font-semibold no-underline text-center"
              style={{ padding: "12px 20px" }}
              href="{{ .SiteURL }}/confirmation?template=magic-link&confirmation_url={{ .ConfirmationURL }}"
            >
              Sign In
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

export default InviteUser;
