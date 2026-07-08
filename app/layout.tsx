import type { Metadata } from "next";
import { Anonymous_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const anonymousPro = Anonymous_Pro({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-anonymous-pro',
  display: 'swap',
});

const SITE_URL = "https://www.kalebnim.dev";
const SITE_TITLE = "Kaleb Nim | AI Engineer & AI Voice Clone Portfolio";
const SITE_DESCRIPTION =
  "Kaleb Nim is an AI Engineer from Singapore studying Business AI Systems at NUS and Head of Community at Singapore Youth AI. Talk to his AI voice-clone portfolio.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Kaleb Nim",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kaleb Nim",
  url: SITE_URL,
  jobTitle: "AI Engineer",
  sameAs: [
    "https://www.linkedin.com/in/kaleb-nim/",
    "https://github.com/Kaleb-Nim",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anonymousPro.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          // Static, hardcoded object with no user/runtime input — safe to serialize directly.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
