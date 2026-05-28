import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { PageTransition } from "@/components/ui/PageTransition";
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import { PitchSplash } from "@/components/ui/PitchSplash";

export const viewport: Viewport = {
  themeColor: "#080B0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "DUGOUT — On-chain Fantasy Football",
    template: "%s · DUGOUT",
  },
  description:
    "Draft 5 World Cup 2026 players as NFTs. Stake OKB. Outscore your opponent on matchday. Live on X Layer.",
  applicationName: "DUGOUT",
  keywords: [
    "X Layer",
    "OKX",
    "fantasy football",
    "World Cup 2026",
    "NFT",
    "on-chain game",
    "web3 gaming",
    "OKB",
  ],
  authors: [{ name: "DUGOUT" }],
  openGraph: {
    title: "DUGOUT — On-chain Fantasy Football",
    description:
      "Draft 5 World Cup 2026 players. Stake OKB. Outscore your opponent. Live on X Layer.",
    siteName: "DUGOUT",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DUGOUT — On-chain Fantasy Football",
    description:
      "Draft 5 World Cup 2026 players. Stake OKB. Outscore your opponent. Live on X Layer.",
    creator: "@dugoutgg",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/logo.jpg", type: "image/jpeg" },
      { url: "/favicon.ico" },
    ],
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <PageTransition>{children}</PageTransition>
          <MusicPlayer />
          <PitchSplash />
        </Providers>
      </body>
    </html>
  );
}
