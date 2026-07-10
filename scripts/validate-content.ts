import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { contentFrontmatterSchema, type ContentEntry } from "../lib/content-schema";

const contentDirectory = join(process.cwd(), "content", "guides");
const requiredCoreSlugs = new Set([
  "vaktarprov",
  "vaktarprov/vu1-ovningsfragor",
  "vaktarprov/vu2-ovningsfragor",
  "vaktarutbildning",
  "vaktarutbildning/vu1",
  "vaktarutbildning/vu2",
  "bli-vaktare",
  "vaktare-eller-ordningsvakt",
  "lagstod/envarsgripande",
  "lagstod/nodvarn-och-nod",
  "studieteknik",
]);
const trustedPrimaryHosts = ["riksdagen.se", "polisen.se", "bya.se", "arbetsformedlingen.se", "lansstyrelsen.se"];

if (!existsSync(contentDirectory)) throw new Error(`Missing content directory: ${contentDirectory}`);

const entries: ContentEntry[] = readdirSync(contentDirectory)
  .filter((fileName) => fileName.endsWith(".mdx"))
  .map((fileName) => {
    const parsed = matter(readFileSync(join(contentDirectory, fileName), "utf8"));
    const frontmatter = contentFrontmatterSchema.parse(parsed.data);
    const body = parsed.content.trim();
    if (/^#\s+/m.test(body)) throw new Error(`${fileName}: MDX body must not contain an H1.`);
    if (body.split(/\s+/).length < 80) throw new Error(`${fileName}: content is too thin (${body.split(/\s+/).length} words).`);
    return { ...frontmatter, body };
  });

for (const field of ["slug", "title", "description"] as const) {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const value = entry[field];
    const previous = seen.get(value);
    if (previous) throw new Error(`Duplicate ${field} in ${previous} and ${entry.slug}: ${value}`);
    seen.set(value, entry.slug);
  }
}

const allSlugs = new Set(entries.map((entry) => entry.slug));
for (const slug of requiredCoreSlugs) {
  if (!allSlugs.has(slug)) throw new Error(`Missing required core page: ${slug}`);
}

for (const entry of entries) {
  for (const related of entry.relatedSlugs) {
    if (!allSlugs.has(related)) throw new Error(`${entry.slug}: unknown related slug ${related}`);
  }
  if (["law", "education"].includes(entry.primaryTopic)) {
    for (const source of entry.sources) {
      const host = new URL(source.url).hostname.replace(/^www\./, "");
      if (!trustedPrimaryHosts.some((trusted) => host === trusted || host.endsWith(`.${trusted}`))) {
        throw new Error(`${entry.slug}: ${host} is not an approved primary-source host.`);
      }
    }
  }
}

console.log(`Validated ${entries.length} MDX pages, including ${requiredCoreSlugs.size + 1} core routes with the homepage.`);
