import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { contentFrontmatterSchema, type ContentEntry } from "@/lib/content-schema";

const contentDirectory = join(process.cwd(), "content", "guides");

function loadContentFile(fileName: string): ContentEntry {
  const file = readFileSync(join(contentDirectory, fileName), "utf8");
  const parsed = matter(file);
  const frontmatter = contentFrontmatterSchema.parse(parsed.data);
  return { ...frontmatter, body: parsed.content.trim() };
}

export function getAllContent(): ContentEntry[] {
  if (!existsSync(contentDirectory)) return [];
  return readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(loadContentFile)
    .sort((a, b) => a.slug.localeCompare(b.slug, "sv"));
}

export function getContentBySlug(slugParts: string[]): ContentEntry | undefined {
  const slug = slugParts.join("/");
  return getAllContent().find((entry) => entry.slug === slug);
}

export function getRelatedContent(entry: ContentEntry): ContentEntry[] {
  const entries = getAllContent();
  return entry.relatedSlugs
    .map((slug) => entries.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is ContentEntry => Boolean(candidate));
}

export function formatEditorialDate(value: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Stockholm",
  }).format(new Date(`${value}T12:00:00+02:00`));
}
