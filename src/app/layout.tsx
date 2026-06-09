import type { Metadata } from "next";
import { Inter, Anta } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { BottomBar } from "@/components/layout/bottom-bar";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});


const antaFont = Anta({
  weight: "400",
  variable: "--font-anta",
  subsets: ["latin"],
});

const sergenaFont = localFont({
  src: "../../surgena-bold.otf",
  variable: "--font-sergena",
});

export const metadata: Metadata = {
  title: 'Distill AI — Turn Standups into Jira Tickets Automatically',
  description: 'Upload standup audio, get structured Jira/Linear tickets in 30 seconds. BYOK, no audio retention, open source. Built for agile teams.',
  metadataBase: new URL('https://distill-ai-zeta.vercel.app'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Distill AI — Turn Standups into Jira Tickets',
    description: 'Automate the worst part of agile. Upload audio, get tickets. Open source, BYOK, no audio retention.',
    url: 'https://distill-ai-zeta.vercel.app',
    siteName: 'Distill AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Distill AI — Standup to Jira automation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Distill AI — Turn Standups into Jira Tickets',
    description: 'Automate Jira ticket creation from standup recordings. Open source, BYOK.',
    images: ['/og-image.png'],
    creator: '@Jeetheshwar',
  },
};

import { NavigationWrapper } from "@/components/layout/navigation-wrapper";
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interFont.variable} ${antaFont.variable} ${sergenaFont.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-background text-foreground antialiased relative"
        suppressHydrationWarning
      >
        <NavigationWrapper navbar={<Navbar />}>
          {children}
        </NavigationWrapper>
        <Analytics />
      </body>
    </html>
  );
}
