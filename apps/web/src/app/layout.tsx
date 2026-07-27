import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { getClerkFrontendApiOrigin } from "@/lib/clerk-config";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-sans-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SkillsPhase — Skills first. Because life happens.",
  description:
    "A skills-first hiring platform where people are hired for ability and evidence — not judged by CV timelines. When skills come first, career gaps matter less.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkOrigin = getClerkFrontendApiOrigin();

  return (
    <html lang="en-GB">
      <head>
        {clerkOrigin ? (
          <>
            <link rel="preconnect" href={clerkOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={clerkOrigin} />
          </>
        ) : null}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
