import { ReactNode } from "react";
import type { Metadata } from "next";

import { generalMetadata } from "@/helpers/metadata";

export const metadata: Metadata = {
  ...generalMetadata,
  title: "FeedDeck - Pricing",
};

export default function Pricing() {
  return (
    <main>
      <div
        className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6"
        style={{ minHeight: "calc(100vh - 108px)" }}
      >
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold">
            Follow your RSS and Social Media Feeds
          </h2>
          <p className="mb-5 font-light text-gray-400 sm:text-xl">
            Follow your favorite RSS and social media feeds in one place on all
            platforms for just 5€ per month or host it by yourself.
          </p>
        </div>

        <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
          <div className="flex flex-col p-6 mx-auto max-w-lg text-center bg-secondary text-onsecondary rounded-lg xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Trial</h3>
            <p className="font-light text-gray-400 sm:text-lg">
              Best option to try out FeedDeck as your next RSS and social media
              reader.
            </p>
            <div className="flex justify-center items-baseline my-8">
              <span className="mr-2 text-5xl font-extrabold">Free</span>
            </div>

            <ul role="list" className="mb-8 space-y-4 text-left">
              <Feature>
                Up to <span className="font-semibold">10 sources</span>
              </Feature>
              <Feature>
                Try out FeedDeck for{" "}
                <span className="font-semibold">
                  7 days
                </span>
              </Feature>
              <Feature>No credit card required</Feature>
            </ul>
            <a
              href="https://app.feeddeck.com"
              className="text-onprimary bg-primary font-medium rounded-full text-sm px-5 py-2.5 text-center"
            >
              Get Started
            </a>
          </div>

          <div className="flex flex-col p-6 mx-auto max-w-lg text-center bg-secondary text-onsecondary rounded-lg xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Premium</h3>
            <p className="font-light text-gray-400 sm:text-lg">
              The premium experience for just 5€ per month without any hidden
              fees.
            </p>
            <div className="flex justify-center items-baseline my-8">
              <span className="mr-2 text-5xl font-extrabold">5€</span>
              <span className="text-gray-400">
                /month
              </span>
            </div>

            <ul role="list" className="mb-8 space-y-4 text-left">
              <Feature>
                Up to <span className="font-semibold">1000 sources</span>
              </Feature>
              <Feature>
                Unlimited{" "}
                <span className="font-semibold">decks and columns</span>
              </Feature>
              <Feature>
                Available for{" "}
                <span className="font-semibold">
                  mobile and desktop
                </span>
              </Feature>
            </ul>
            <a
              href="https://app.feeddeck.com"
              className="text-onprimary bg-primary font-medium rounded-full text-sm px-5 py-2.5 text-center"
            >
              Get Started
            </a>
          </div>

          <div className="flex flex-col p-6 mx-auto max-w-lg text-center bg-secondary text-onsecondary rounded-lg xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Self Hosted</h3>
            <p className="font-light text-gray-400 sm:text-lg">
              The full FeedDeck experience for hobbyist without any limitations.
            </p>
            <div className="flex justify-center items-baseline my-8">
              <span className="mr-2 text-5xl font-extrabold">Free</span>
            </div>

            <ul role="list" className="mb-8 space-y-4 text-left">
              <Feature>Self hosted without any limitations</Feature>
              <Feature>
                Use our binaries or build it by yourself
              </Feature>
              <Feature>
                Support the development via{" "}
                <a
                  className="underline"
                  href="https://github.com/sponsors/ricoberger"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  donations
                </a>
              </Feature>
            </ul>
            <a
              href="https://github.com/feeddeck/feeddeck"
              target="_blank"
              rel="noopener noreferrer"
              className="text-onprimary bg-primary font-medium rounded-full text-sm px-5 py-2.5 text-center"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

const Feature = ({ children }: { children: ReactNode }) => (
  <li className="flex items-center space-x-3">
    <svg
      className="flex-shrink-0 w-5 h-5 text-primary"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clip-rule="evenodd"
      >
      </path>
    </svg>
    <span>{children}</span>
  </li>
);
