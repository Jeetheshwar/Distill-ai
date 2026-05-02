import type { Metadata } from "next";
import { Sulphur_Point, Doto, Anta } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { BottomBar } from "@/components/layout/bottom-bar";

const sulphurPoint = Sulphur_Point({
  weight: ["300", "400", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

const pixelFont = Doto({
  weight: "variable",
  variable: "--font-pixel",
  subsets: ["latin"],
  axes: ["ROND"],
});

const antaFont = Anta({
  weight: "400",
  variable: "--font-anta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Distill.ai | Effortless Extraction for Developers",
  description: "The first audio intelligence platform that allows you to transcribe, process, and extract actionable JSON from sensitive conversations — entirely locally.",
};

import { NavigationWrapper } from "@/components/layout/navigation-wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sulphurPoint.variable} ${pixelFont.variable} ${antaFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-background text-foreground antialiased relative"
        suppressHydrationWarning
      >
        <NavigationWrapper navbar={<Navbar />}>
          {children}
        </NavigationWrapper>
      </body>
    </html>
  );
}
