import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { guideImageUrls } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentPages: MetadataRoute.Sitemap = getAllContent()
    .filter((entry) => entry.index)
    .map((entry) => ({
      url: absoluteUrl(`/${entry.slug}`),
      lastModified: new Date(`${entry.reviewedAt}T12:00:00+02:00`),
      images: guideImageUrls(entry),
    }));

  return [
    { url: absoluteUrl("/"), lastModified: new Date("2026-07-16T12:00:00+02:00") },
    { url: absoluteUrl("/plattformen"), lastModified: new Date("2026-07-22T12:00:00+02:00") },
    { url: absoluteUrl("/priser"), lastModified: new Date("2026-07-22T12:00:00+02:00") },
    ...contentPages,
  ];
}
