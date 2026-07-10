import type { Metadata } from "next";
import type { Article, BreadcrumbList, Organization, WebSite, WithContext } from "schema-dts";
import type { ContentEntry } from "@/lib/content-schema";
import { absoluteUrl, getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const DEFAULT_OG_IMAGE = "/opengraph-image";

export function buildMetadata(entry: ContentEntry): Metadata {
  const path = `/${entry.slug}`;
  const image = absoluteUrl(entry.image || DEFAULT_OG_IMAGE);
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: path },
    robots: entry.index
      ? {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: true, nocache: true },
    openGraph: {
      type: "article",
      locale: "sv_SE",
      url: path,
      siteName: SITE_NAME,
      title: entry.title,
      description: entry.description,
      publishedTime: entry.publishedAt,
      modifiedTime: entry.reviewedAt,
      images: [{ url: image, width: 1200, height: 630, alt: entry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [image],
    },
  };
}

export function organizationJsonLd(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/site-assets/logo/icon-512.png"),
      width: "512",
      height: "512",
    },
    description: SITE_DESCRIPTION,
  };
}

export function websiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: "sv-SE",
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

function breadcrumbName(segment: string): string {
  const names: Record<string, string> = {
    vaktarprov: "Väktarprovet",
    vaktarutbildning: "Väktarutbildning",
    lagstod: "Lagstöd",
    "vu1-ovningsfragor": "VU1 övningsfrågor",
    "vu2-ovningsfragor": "VU2 övningsfrågor",
    vu1: "VU1",
    vu2: "VU2",
    envarsgripande: "Envarsgripande",
    "nodvarn-och-nod": "Nödvärn och nöd",
  };
  return names[segment] || segment.replaceAll("-", " ");
}

export function articleJsonLd(entry: ContentEntry): [WithContext<Article>, WithContext<BreadcrumbList>] {
  const segments = entry.slug.split("/");
  const linkableHubs = new Set(["vaktarprov", "vaktarutbildning"]);
  const breadcrumbs = [
    { "@type": "ListItem" as const, position: 1, name: "Start", item: absoluteUrl("/") },
    ...segments
      .map((segment, index) => ({ segment, index }))
      .filter(({ segment, index }) => index === segments.length - 1 || linkableHubs.has(segment))
      .map(({ segment, index }, breadcrumbIndex) => ({
        "@type": "ListItem" as const,
        position: breadcrumbIndex + 2,
        name: breadcrumbName(segment),
        item: absoluteUrl(`/${segments.slice(0, index + 1).join("/")}`),
      })),
  ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": absoluteUrl(`/${entry.slug}#article`),
      headline: entry.title,
      description: entry.description,
      inLanguage: "sv-SE",
      datePublished: entry.publishedAt,
      dateModified: entry.reviewedAt,
      mainEntityOfPage: absoluteUrl(`/${entry.slug}`),
      image: absoluteUrl(entry.image),
      author: { "@type": "Organization", name: entry.author, url: absoluteUrl("/redaktionell-policy") },
      publisher: { "@id": absoluteUrl("/#organization") },
      about: entry.primaryTopic,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs,
    },
  ];
}

export const metadataBase = getSiteUrl();
