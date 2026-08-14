import type { Metadata } from "next";
import { Epilogue, Urbanist } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooterLoader } from "@/components/site-footer-loader";
import { getClerkFrontendApiOrigin } from "@/lib/clerk-config";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SkillsPhase — Skills first. Because life happens.",
  description:
    "Work changes. Life changes. Your skills don't disappear. Build a SkillsPhase profile around what you can do, the evidence behind it, and the impact you've made — then use it to apply for jobs.",
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
        className={`${epilogue.variable} ${urbanist.variable} flex min-h-screen flex-col antialiased`}
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
