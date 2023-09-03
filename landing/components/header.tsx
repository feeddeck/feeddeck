"use client";

import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";

export default function Header() {
  const navigation = [
    {
      title: "Features",
      href: "/#features",
      isExternal: false,
    },
    {
      title: "Pricing",
      href: "/pricing",
      isExternal: false,
    },
    {
      title: "Download",
      href: "/download",
      isExternal: false,
    },
    {
      title: "GitHub",
      href: "https://github.com/feeddeck/feeddeck",
      isExternal: true,
    },
  ];

  return (
    <div className="w-full">
      <nav className="container relative flex flex-wrap items-center justify-between p-8 mx-auto lg:justify-between xl:px-0">
        <Disclosure>
          {({ open }) => (
            <>
              <div className="flex flex-wrap items-center justify-between w-full lg:w-auto">
                <Link href="/">
                  <span className="flex items-center space-x-2 text-2xl font-medium">
                    <span>
                      <Image
                        src="/logo.svg"
                        alt="N"
                        width="32"
                        height="32"
                        className="w-8 rounded-full"
                      />
                    </span>
                    <span>FeedDeck</span>
                  </span>
                </Link>

                <Disclosure.Button
                  aria-label="Toggle Menu"
                  className="px-2 py-1 ml-auto rounded-md lg:hidden hover:text-primary focus:text-primary"
                >
                  <svg
                    className="w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {open && (
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                      />
                    )}
                    {!open && (
                      <path
                        fillRule="evenodd"
                        d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                      />
                    )}
                  </svg>
                </Disclosure.Button>

                <Disclosure.Panel className="flex flex-wrap w-full my-5 lg:hidden">
                  <>
                    {navigation.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        target={item.isExternal ? "_blank" : undefined}
                        rel={item.isExternal
                          ? "noopener noreferrer"
                          : undefined}
                        className="w-full px-4 py-2 -ml-4 hover:text-primary focus:text-primary"
                      >
                        {item.title}
                      </Link>
                    ))}

                    <Link
                      href="https://app.feeddeck.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-6 py-2 mt-3 font-medium text-center text-onprimary bg-primary rounded-full lg:ml-5"
                    >
                      Sign In
                    </Link>
                  </>
                </Disclosure.Panel>
              </div>
            </>
          )}
        </Disclosure>

        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((item, index) => (
              <li className="mr-3 nav__item" key={index}>
                <Link
                  href={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="inline-block px-4 py-2 text-lg font-normal no-underline hover:text-primary focus:text-primary"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden mr-3 space-x-4 lg:flex nav__item">
          <Link
            href="https://app.feeddeck.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 font-medium text-onprimary bg-primary rounded-full md:ml-5"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </div>
  );
}
