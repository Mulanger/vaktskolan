import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { metadataBase } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "optional", preload: false });

export const metadata: Metadata = {
  metadataBase,
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "education",
  icons: {
    icon: "/site-assets/logo/favicon.png",
    apple: "/site-assets/logo/icon-512.png",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className={`${inter.variable} ${hanken.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Hoppa till innehållet</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
