import { z } from "zod";

export const sourceSchema = z.object({
  title: z.string().min(3),
  publisher: z.string().min(2),
  url: z.string().url(),
  accessedAt: z.iso.date(),
});

export const contentFrontmatterSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/),
    title: z.string().min(20).max(68),
    description: z.string().min(90).max(165),
    summary: z.string().min(40).max(260),
    publishedAt: z.iso.date(),
    reviewedAt: z.iso.date(),
    author: z.literal("Vaktskolans redaktion"),
    primaryTopic: z.enum(["exam", "education", "career", "law", "study", "trust", "legal"]),
    image: z.string().startsWith("/"),
    sources: z.array(sourceSchema),
    relatedSlugs: z.array(z.string().regex(/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/)).max(6),
    index: z.boolean(),
  })
  .superRefine((data, context) => {
    if (["law", "education"].includes(data.primaryTopic) && data.sources.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Law and education pages require at least one primary source.",
      });
    }
    if (data.reviewedAt < data.publishedAt) {
      context.addIssue({
        code: "custom",
        path: ["reviewedAt"],
        message: "reviewedAt cannot be earlier than publishedAt.",
      });
    }
  });

export type ContentSource = z.infer<typeof sourceSchema>;
export type ContentFrontmatter = z.infer<typeof contentFrontmatterSchema>;

export type ContentEntry = ContentFrontmatter & {
  body: string;
};
