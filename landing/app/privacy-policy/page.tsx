import type { Metadata } from "next";

import { generalMetadata } from "@/helpers/metadata";

export const metadata: Metadata = {
  ...generalMetadata,
  title: "FeedDeck - Privacy Policy",
};

export default function PrivacyPolicy() {
  return (
    <main>
      <div className="container p-8 mx-auto">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="py-4">
            Rico Berger built the FeedDeck app as a Commercial app. This SERVICE
            is provided by Rico Berger and is intended for use as is.
          </p>
          <p className="py-4">
            This page is used to inform visitors regarding my policies with the
            collection, use, and disclosure of Personal Information if anyone
            decided to use my Service.
          </p>
          <p className="py-4">
            If you choose to use my Service, then you agree to the collection
            and use of information in relation to this policy. The Personal
            Information that I collect is used for providing and improving the
            Service. I will not use or share your information with anyone except
            as described in this Privacy Policy.
          </p>
          <p className="py-4">
            The terms used in this Privacy Policy have the same meanings as in
            our Terms and Conditions, which are accessible at FeedDeck unless
            otherwise defined in this Privacy Policy.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">
              Information Collection and Use
            </h2>
          </p>
          <p className="py-4">
            For a better experience, while using our Service, I may require you
            to provide us with certain personally identifiable information,
            including but not limited to your email address, first name, last
            name and credit card.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Log Data</h2>
          </p>
          <p className="py-4">
            I want to inform you that whenever you use my Service, in a case of
            an error in the app I collect data and information (through
            third-party products) on your phone called Log Data. This Log Data
            may include information such as your device Internet Protocol
            (&quot;IP&quot;) address, device name, operating system version, the
            configuration of the app when utilizing my Service, the time and
            date of your use of the Service, and other statistics.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Cookies</h2>
          </p>
          <p className="py-4">
            Cookies are files with a small amount of data that are commonly used
            as anonymous unique identifiers. These are sent to your browser from
            the websites that you visit and are stored on your device&apos;s
            internal memory.
          </p>
          <p className="py-4">
            This Service does not use these &quot;cookies&quot; explicitly.
            However, the app may use third-party code and libraries that use
            &quot;cookies&quot; to collect information and improve their
            services. You have the option to either accept or refuse these
            cookies and know when a cookie is being sent to your device. If you
            choose to refuse our cookies, you may not be able to use some
            portions of this Service.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Service Providers</h2>
          </p>
          <p className="py-4">
            I may employ third-party companies and individuals due to the
            following reasons:
          </p>
          <ul className="pl-16 list-disc">
            <li>To facilitate our Service;</li>
            <li>To provide the Service on our behalf;</li>
            <li>To perform Service-related services; or</li>
            <li>To assist us in analyzing how our Service is used.</li>
          </ul>
          <p className="py-4">
            I want to inform users of this Service that these third parties have
            access to their Personal Information. The reason is to perform the
            tasks assigned to them on our behalf. However, they are obligated
            not to disclose or use the information for any other purpose.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Security</h2>
          </p>
          <p className="py-4">
            I value your trust in providing us your Personal Information, thus
            we are striving to use commercially acceptable means of protecting
            it. But remember that no method of transmission over the internet,
            or method of electronic storage is 100% secure and reliable, and I
            cannot guarantee its absolute security.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Links to Other Sites</h2>
          </p>
          <p className="py-4">
            This Service may contain links to other sites. If you click on a
            third-party link, you will be directed to that site. Note that these
            external sites are not operated by me. Therefore, I strongly advise
            you to review the Privacy Policy of these websites. I have no
            control over and assume no responsibility for the content, privacy
            policies, or practices of any third-party sites or services.
          </p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Children&apos;s Privacy</h2>
          </p>
          <div>
            <p className="py-4">
              I do not knowingly collect personally identifiable information
              from children. I encourage all children to never submit any
              personally identifiable information through the Application and/or
              Services. I encourage parents and legal guardians to monitor their
              children&apos;s Internet usage and to help enforce this Policy by
              instructing their children never to provide personally
              identifiable information through the Application and/or Services
              without their permission. If you have reason to believe that a
              child has provided personally identifiable information to us
              through the Application and/or Services, please contact us. You
              must also be at least 16 years of age to consent to the processing
              of your personally identifiable information in your country (in
              some countries we may allow your parent or guardian to do so on
              your behalf).
            </p>
          </div>{" "}
          <p className="py-4">
            <h2 className="text-xl font-bold">
              Changes to This Privacy Policy
            </h2>
          </p>
          <p className="py-4">
            I may update our Privacy Policy from time to time. Thus, you are
            advised to review this page periodically for any changes. I will
            notify you of any changes by posting the new Privacy Policy on this
            page.
          </p>
          <p className="py-4">This policy is effective as of 2023-06-22</p>
          <p className="py-4">
            <h2 className="text-xl font-bold">Contact Us</h2>
          </p>
          <p className="py-4">
            If you have any questions or suggestions about my Privacy Policy, do
            not hesitate to contact me at{" "}
            <a
              className="underline"
              href="mailto:admin@feeddeck.app?subject=[Privacy Policy]"
            >
              admin@feeddeck.app
            </a>.
          </p>
        </div>
      </div>
    </main>
  );
}
