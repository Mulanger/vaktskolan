import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentPages: MetadataRoute.Sitemap = getAllContent()
    .filter((entry) => entry.index)
    .map((entry) => ({
      url: absoluteUrl(`/${entry.slug}`),
      lastModified: new Date(`${entry.reviewedAt}T12:00:00+02:00`),
      changeFrequency: entry.primaryTopic === "law" || entry.primaryTopic === "education" ? "monthly" : "yearly",
      priority: entry.slug.split("/").length === 1 ? 0.8 : 0.7,
    }));

  return [
    { url: absoluteUrl("/"), lastModified: new Date("2026-07-10T12:00:00+02:00"), changeFrequency: "weekly", priority: 1 },
    ...contentPages,
  ];
}
