import {
  Button,
  Container,
  Heading,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

const ConfirmSignup = () => {
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
          <Heading className="text-2xl font-normal text-center p-0 my-8 mx-0">
            Welcome to <strong>FeedDeck</strong>!
          </Heading>
          <Text className="text-sm">
            Hi {`{{ .Email }}`},
          </Text>
          <Text className="text-sm">
            We're excited to have you onboard at{" "}
            <strong>FeedDeck</strong>. We hope you enjoy your journey with us.
            If you have any questions or need assistance, feel free to reach
            out.
          </Text>
          <Text className="text-sm">
            Before you can start using FeedDeck you have to confirm your
            registration by clicking on <strong>"Confirm Sign Up"</strong>{" "}
            the button below.
          </Text>
          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-[#49d3b4] rounded text-[#1f2229] text-xs font-semibold no-underline text-center"
              style={{ padding: "12px 20px" }}
              href="{{ .SiteURL }}/confirmation?template=confirm-signup&confirmation_url={{ .ConfirmationURL }}"
            >
              Confirm Sign Up
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

export default ConfirmSignup;
