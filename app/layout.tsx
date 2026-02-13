import type { Metadata } from "next";
import { Anonymous_Pro } from "next/font/google";
import "./globals.css";

const anonymousPro = Anonymous_Pro({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-anonymous-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Kaleb Nim | Kebab Neural Interface",
  description: "Operating Model: kaleb-nim-400b-0706 - Powered by Kebab Neural Interface",
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
        {children}
      </body>
    </html>
  );
}
