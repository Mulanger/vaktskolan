import type { Metadata } from "next";
import type { Article, BreadcrumbList, Organization, WebPage, WebSite, WithContext } from "schema-dts";
import type { ContentEntry } from "@/lib/content-schema";
import { absoluteUrl, getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const DEFAULT_OG_IMAGE = "/opengraph-image";
const GUIDE_IMAGE_RATIOS = ["16x9", "4x3", "1x1"] as const;

const TOPIC_LABELS: Record<ContentEntry["primaryTopic"], string> = {
  exam: "Väktarprovet",
  education: "Väktarutbildning",
  career: "Väktaryrket",
  law: "Lagstöd",
  study: "Studieteknik",
  trust: "Om Vaktskolan",
  legal: "Juridisk information",
};

function editorialDateTime(value: string): string {
  const utcNoon = new Date(`${value}T12:00:00Z`);
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Stockholm",
    timeZoneName: "longOffset",
  }).formatToParts(utcNoon).find((part) => part.type === "timeZoneName")?.value;
  const offset = timeZoneName?.replace("GMT", "") || "+01:00";
  return `${value}T12:00:00${offset}`;
}

function organizationEntity(): Organization {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    alternateName: "vaktskolan.se",
    url: absoluteUrl("/"),
    email: "kontakt@vaktskolan.se",
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/site-assets/logo/icon-512.png"),
      width: "512",
      height: "512",
    },
    description: SITE_DESCRIPTION,
  };
}

export function guideImageUrls(entry: ContentEntry): string[] {
  if (entry.image !== DEFAULT_OG_IMAGE) return [absoluteUrl(entry.image)];
  return GUIDE_IMAGE_RATIOS.map((ratio) => absoluteUrl(`/guide-image/${entry.slug}/${ratio}`));
}

export function primaryTopicLabel(topic: ContentEntry["primaryTopic"]): string {
  return TOPIC_LABELS[topic];
}

export function buildMetadata(entry: ContentEntry): Metadata {
  const path = `/${entry.slug}`;
  const image = guideImageUrls(entry)[0];
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
      publishedTime: editorialDateTime(entry.publishedAt),
      modifiedTime: editorialDateTime(entry.reviewedAt),
      images: [{ url: image, width: 1200, height: 675, alt: entry.title }],
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
  return Object.assign(
    { "@context": "https://schema.org" as const },
    organizationEntity(),
  ) as WithContext<Organization>;
}

export function websiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    alternateName: "vaktskolan.se",
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

export function contentPageJsonLd(entry: ContentEntry): [
  WithContext<Article> | WithContext<WebPage>,
  WithContext<BreadcrumbList>,
] {
  const segments = entry.slug.split("/");
  const linkableHubs = new Set(["vaktarprov", "vaktarutbildning"]);
  const pageUrl = absoluteUrl(`/${entry.slug}`);
  const images = guideImageUrls(entry);
  const datePublished = editorialDateTime(entry.publishedAt);
  const dateModified = editorialDateTime(entry.reviewedAt);
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

  const isEditorialGuide = !["trust", "legal"].includes(entry.primaryTopic);
  const pageData: WithContext<Article> | WithContext<WebPage> = isEditorialGuide
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: entry.title,
        description: entry.description,
        inLanguage: "sv-SE",
        datePublished,
        dateModified,
        mainEntityOfPage: pageUrl,
        image: images,
        author: {
          "@type": "Organization",
          name: entry.author,
          url: absoluteUrl("/redaktionell-policy"),
        },
        publisher: organizationEntity(),
        articleSection: primaryTopicLabel(entry.primaryTopic),
        isAccessibleForFree: true,
        about: { "@type": "Thing", name: primaryTopicLabel(entry.primaryTopic) },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: entry.title,
        description: entry.description,
        inLanguage: "sv-SE",
        datePublished,
        dateModified,
        isPartOf: { "@id": absoluteUrl("/#website") },
        primaryImageOfPage: { "@type": "ImageObject", url: images[0] },
        publisher: organizationEntity(),
      };

  return [
    pageData,
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs,
    },
  ];
}

export const metadataBase = getSiteUrl();
