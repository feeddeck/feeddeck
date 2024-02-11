import type { Metadata, Viewport } from "next";

import { generalMetadata, generalViewport } from "@/helpers/metadata";

export const metadata: Metadata = {
  ...generalMetadata,
  title: "FeedDeck - Support",
};

export const viewport: Viewport = generalViewport;

export default function Support() {
  return (
    <main>
      <div className="container p-8 mx-auto">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-bold">Support</h1>
          <p className="py-4">
            If you have problems or questions, please search through{" "}
            <a
              className="underline"
              href="https://github.com/feeddeck/feeddeck/issues"
              target="_blank"
            >
              existing open and closed GitHub Issues
            </a>{" "}
            for the answer first. If you find a relevant topic, please comment
            on the issue. If none of the issues are relevant, please add an
            issue to{" "}
            <a
              className="underline"
              href="https://github.com/feeddeck/feeddeck/issues"
              target="_blank"
            >
              GitHub issues
            </a>{" "}
            or start a new{" "}
            <a
              className="underline"
              href="https://github.com/feeddeck/feeddeck/discussions"
              target="_blank"
            >
              discussions
            </a>. Please use the issue templates and provide any relevant
            information.
          </p>
          <p className="py-4">
            If you do not have an GitHub Account you can also contact me via
            {" "}
            <a
              className="underline"
              href="mailto:admin@feeddeck.app?subject=[Support]"
            >
              admin@feeddeck.app
            </a>.
          </p>
        </div>
      </div>
    </main>
  );
}
