import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/guide-page";
import { getAllContent, getContentBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getAllContent().map((entry) => ({ slug: entry.slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const entry = getContentBySlug((await params).slug);
  if (!entry) return {};
  return buildMetadata(entry);
}

export default async function ContentPage({ params }: PageProps) {
  const entry = getContentBySlug((await params).slug);
  if (!entry) notFound();
  return <GuidePage entry={entry} />;
}
