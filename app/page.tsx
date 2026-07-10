import type { Metadata } from "next";
import Script from "next/script";
import { JsonLd } from "@/components/json-ld";
import { getOriginalLanding } from "@/lib/original-landing";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Träna inför väktarprovet – VU1 & VU2 | Vaktskolan" },
  description: "Träna inför väktarprovet med gratis övningsfrågor, tydliga förklaringar och källstödda guider för VU1, VU2 och väktaryrket.",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "/",
    siteName: "Vaktskolan",
    title: "Träna inför väktarprovet – VU1 & VU2",
    description: "Gratis provträning och källstödda guider inför väktarutbildningen.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Vaktskolan – träna inför väktarprovet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Träna inför väktarprovet – VU1 & VU2",
    description: "Gratis provträning och källstödda guider inför väktarutbildningen.",
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  const original = getOriginalLanding();

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <style dangerouslySetInnerHTML={{ __html: original.styles }} />
      <div
        className="original-landing-shell font-sans bg-white text-vaktarDark antialiased overflow-x-hidden"
        dangerouslySetInnerHTML={{ __html: original.markup }}
      />
      <Script id="original-landing-interactions" strategy="afterInteractive">
        {original.script}
      </Script>
    </>
  );
}
