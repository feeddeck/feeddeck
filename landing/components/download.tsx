"use client";

import { getOSDownload, getOSLabel, getOSName } from "@/helpers/helpers";

export default function Download() {
  const osName = getOSName();
  const osLabel = getOSLabel(osName);
  const osDownload = getOSDownload(osName);

  if (!osLabel) {
    return (
      <a
        href="/download"
        className="px-8 py-4 text-lg font-medium text-center text-onsecondary bg-secondary rounded-full border shadow border-black"
      >
        Download
      </a>
    );
  }

  return (
    <a
      href={osDownload}
      target="_blank"
      rel="noopener noreferrer"
      className="px-8 py-4 text-lg font-medium text-center text-onsecondary bg-secondary rounded-full border shadow border-black"
    >
      Download for {osLabel}
    </a>
  );
}
