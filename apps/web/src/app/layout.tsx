import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooterLoader } from "@/components/site-footer-loader";
import { getClerkFrontendApiOrigin } from "@/lib/clerk-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SkillsPhase — Skills first, because life happens",
  description:
    "Your ability isn't defined by a perfect CV. Build an evidence-based skills profile that helps employers see what you're capable of through your experience, projects and achievements.",
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
        className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooterLoader />
          </div>
        </Providers>
      </body>
    </html>
  );
}
