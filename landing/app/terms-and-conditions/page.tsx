import type { Metadata } from "next";

import { generalMetadata } from "@/helpers/metadata";

export const metadata: Metadata = {
  ...generalMetadata,
  title: "FeedDeck - Terms & Conditions",
};

export default function TermsAndConditions() {
  return (
    <main>
      <div className="container p-8 mx-auto">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-bold">Terms &amp; Conditions</h1>
          <p className="py-4">
            By downloading or using the app, these terms will automatically
            apply to you – you should make sure therefore that you read them
            carefully before using the app. You&apos;re not allowed to copy or
            modify the app, any part of the app, or our trademarks in any way.
            You&apos;re not allowed to attempt to extract the source code of the
            app, and you also shouldn&apos;t try to translate the app into other
            languages or make derivative versions. The app itself, and all the
            trademarks, copyright, database rights, and other intellectual
            property rights related to it, still belong to Rico Berger.
          </p>
          <p className="py-4">
            Rico Berger is committed to ensuring that the app is as useful and
            efficient as possible. For that reason, we reserve the right to make
            changes to the app or to charge for its services, at any time and
            for any reason. We will never charge you for the app or its services
            without making it very clear to you exactly what you&apos;re paying
            for.
          </p>
          <p className="py-4">
            The FeedDeck app stores and processes personal data that you have
            provided to us, to provide my Service. It&apos;s your responsibility
            to keep your phone and access to the app secure. We therefore
            recommend that you do not jailbreak or root your phone, which is the
            process of removing software restrictions and limitations imposed by
            the official operating system of your device. It could make your
            phone vulnerable to malware/viruses/malicious programs, compromise
            your phone&apos;s security features and it could mean that the
            FeedDeck app won&apos;t work properly or at all.
          </p>
          <p className="py-4">
            You should be aware that there are certain things that Rico Berger
            will not take responsibility for. Certain functions of the app will
            require the app to have an active internet connection. The
            connection can be Wi-Fi or provided by your mobile network provider,
            but Rico Berger cannot take responsibility for the app not working
            at full functionality if you don&apos;t have access to Wi-Fi, and
            you don&apos;t have any of your data allowance left.
          </p>
          <p className="py-4">
            If you&apos;re using the app outside of an area with Wi-Fi, you
            should remember that the terms of the agreement with your mobile
            network provider will still apply. As a result, you may be charged
            by your mobile provider for the cost of data for the duration of the
            connection while accessing the app, or other third-party charges. In
            using the app, you&apos;re accepting responsibility for any such
            charges, including roaming data charges if you use the app outside
            of your home territory (i.e. region or country) without turning off
            data roaming. If you are not the bill payer for the device on which
            you&apos;re using the app, please be aware that we assume that you
            have received permission from the bill payer for using the app.
          </p>
          <p className="py-4">
            Along the same lines, Rico Berger cannot always take responsibility
            for the way you use the app i.e. You need to make sure that your
            device stays charged – if it runs out of battery and you can&apos;t
            turn it on to avail the Service, Rico Berger cannot accept
            responsibility.
          </p>
          <p className="py-4">
            With respect to Rico Berger&apos;s responsibility for your use of
            the app, when you&apos;re using the app, it&apos;s important to bear
            in mind that although we endeavor to ensure that it is updated and
            correct at all times, we do rely on third parties to provide
            information to us so that we can make it available to you. Rico
            Berger accepts no liability for any loss, direct or indirect, you
            experience as a result of relying wholly on this functionality of
            the app.
          </p>
          <p className="py-4">
            At some point, we may wish to update the app. The app is currently
            available on iOS – the requirements for the system(and for any
            additional systems we decide to extend the availability of the app
            to) may change, and you&apos;ll need to download the updates if you
            want to keep using the app. Rico Berger does not promise that it
            will always update the app so that it is relevant to you and/or
            works with the iOS version that you have installed on your device.
            However, you promise to always accept updates to the application
            when offered to you, We may also wish to stop providing the app, and
            may terminate use of it at any time without giving notice of
            termination to you. Unless we tell you otherwise, upon any
            termination, (a) the rights and licenses granted to you in these
            terms will end; (b) you must stop using the app, and (if needed)
            delete it from your device.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">
              Changes to This Terms and Conditions
            </h2>
          </p>
          <p className="py-4">
            I may update our Terms and Conditions from time to time. Thus, you
            are advised to review this page periodically for any changes. I will
            notify you of any changes by posting the new Terms and Conditions on
            this page.
          </p>
          <p className="py-4">
            These terms and conditions are effective as of 2023-06-22
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Contact Us</h2>
          </p>
          <p className="py-4">
            If you have any questions or suggestions about my Terms and
            Conditions, do not hesitate to contact me at{" "}
            <a
              className="underline"
              href="mailto:admin@feeddeck.app?subject=[Terms and Conditions]"
            >
              admin@feeddeck.app
            </a>.
          </p>
        </div>
      </div>
    </main>
  );
}
