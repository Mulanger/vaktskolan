import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef } from "react";
import type { ContentEntry } from "@/lib/content-schema";
import { formatEditorialDate, getRelatedContent } from "@/lib/content";
import { articleJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

function SmartLink(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href || "#";
  if (href.startsWith("/")) return <Link {...props} href={href} />;
  return <a {...props} href={href} rel="noopener noreferrer" target="_blank" />;
}

const mdxComponents = {
  a: SmartLink,
};

export function GuidePage({ entry }: { entry: ContentEntry }) {
  const related = getRelatedContent(entry);
  const breadcrumbs = entry.slug.split("/");
  const linkableHubs = new Set(["vaktarprov", "vaktarutbildning"]);

  return (
    <>
      <JsonLd data={articleJsonLd(entry)} />
      <main className="guide-shell">
        <nav className="breadcrumbs" aria-label="Brödsmulor">
          <Link href="/">Start</Link>
          {breadcrumbs.map((segment, index) => {
            const path = `/${breadcrumbs.slice(0, index + 1).join("/")}`;
            const isCurrent = index === breadcrumbs.length - 1;
            const label = segment.replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase());
            return isCurrent || !linkableHubs.has(segment)
              ? <span key={path}>{label}</span>
              : <Link key={path} href={path}>{label}</Link>;
          })}
        </nav>

        <article className="guide-article">
          <header className="guide-header">
            <p className="eyebrow">{entry.primaryTopic === "law" ? "Lagstöd" : "Vaktskolans guide"}</p>
            <h1>{entry.title}</h1>
            <p className="guide-lead">{entry.summary}</p>
            <div className="guide-byline">
              <span>Av {entry.author}</span>
              <span>Granskad {formatEditorialDate(entry.reviewedAt)}</span>
            </div>
          </header>

          <div className="article-prose">
            <MDXRemote source={entry.body} components={mdxComponents} />
          </div>

          {entry.sources.length > 0 && (
            <section className="source-list" aria-labelledby="sources-heading">
              <p className="eyebrow">Primärkällor</p>
              <h2 id="sources-heading">Kontrollera uppgifterna</h2>
              <ol>
                {entry.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} rel="noopener noreferrer" target="_blank">{source.title}</a>
                    <span>{source.publisher} · hämtad {formatEditorialDate(source.accessedAt)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {related.length > 0 && (
            <nav className="related-guides" aria-label="Relaterade guider">
              <p className="eyebrow">Läs vidare</p>
              {related.map((item) => (
                <Link href={`/${item.slug}`} key={item.slug}>
                  <span>{item.summary}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </nav>
          )}
        </article>
      </main>
    </>
  );
}
