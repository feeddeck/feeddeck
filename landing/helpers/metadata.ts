import type { Metadata, Viewport } from "next";

export const generalMetadata: Metadata = {
  description: "Follow your RSS and Social Media Feeds",
  applicationName: "FeedDeck",
  authors: {
    name: "Rico Berger",
  },
  keywords: ["FeedDeck", "RSS", "Social Media", "Feeds"],
  metadataBase: process.env.NEXT_PUBLIC_METADATA_BASE
    ? new URL(process.env.NEXT_PUBLIC_METADATA_BASE)
    : process.env.NODE_ENV === "development"
      ? new URL("http://localhost:3000")
      : new URL("https://feeddeck.app"),
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "57x57",
      url: "/apple-icon-57x57.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "60x60",
      url: "/apple-icon-60x60.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "72x72",
      url: "/apple-icon-72x72.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "76x76",
      url: "/apple-icon-76x76.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "114x114",
      url: "/apple-icon-114x114.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "120x120",
      url: "/apple-icon-120x120.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "144x144",
      url: "/apple-icon-144x144.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "152x152",
      url: "/apple-icon-152x152.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/apple-icon-180x180.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "192x192",
      url: "/android-icon-192x192.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "96x96",
      url: "/favicon-96x96.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "FeedDeck",
    siteName: "FeedDeck",
    description: "Follow your RSS and Social Media Feeds",
    images: {
      url: "/og.png",
    },
  },
  twitter: {
    card: "summary_large_image",
    site: "@feeddeckapp",
    creator: "@feeddeckapp",
    title: "FeedDeck",
    description: "Follow your RSS and Social Media Feeds",
    images: {
      url: "/og.png",
    },
  },
  itunes: {
    appId: "6451055362",
  },
  other: {
    "google-play-app": "app-id=app.feeddeck.feeddeck",
    "msApplication-ID": "26077RicoBerger.FeedDeck",
    "msApplication-PackageFamilyName": "26077RicoBerger.FeedDeck_2w82je6nmmv2c",
  },
};

export const generalViewport: Viewport = {
  themeColor: "#1f2229",
}
