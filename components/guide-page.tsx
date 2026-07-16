import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef } from "react";
import type { ContentEntry } from "@/lib/content-schema";
import { formatEditorialDate, getRelatedContent } from "@/lib/content";
import { GUIDE_NAVIGATION_GROUPS } from "@/lib/guide-navigation";
import { contentPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

function SmartLink(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href || "#";
  if (href.startsWith("/")) return <Link {...props} href={href} />;
  return <a {...props} href={href} rel="noopener noreferrer" target="_blank" />;
}

const mdxComponents = {
  a: SmartLink,
};

function GuideNavigationLinks({ activeSlug }: { activeSlug: string }) {
  return (
    <div className="guide-navigation__groups">
      {GUIDE_NAVIGATION_GROUPS.map((group) => (
        <section className="guide-navigation__group" key={group.label}>
          <p className="guide-navigation__heading">{group.label}</p>
          <ul>
            {group.items.map((item) => {
              const isCurrent = item.slug === activeSlug;

              return (
                <li key={item.slug}>
                  <Link
                    aria-current={isCurrent ? "page" : undefined}
                    className={isCurrent ? "is-current" : undefined}
                    href={`/${item.slug}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function GuidePage({ entry }: { entry: ContentEntry }) {
  const related = getRelatedContent(entry);
  const breadcrumbs = entry.slug.split("/");
  const linkableHubs = new Set(["vaktarprov", "vaktarutbildning"]);
  const currentNavigationItem = GUIDE_NAVIGATION_GROUPS
    .flatMap((group) => group.items)
    .find((item) => item.slug === entry.slug);

  return (
    <>
      <JsonLd data={contentPageJsonLd(entry)} />
      <main id="main-content" className="guide-shell">
        <div className="guide-layout">
          <aside className="guide-sidebar">
            <nav className="guide-sidebar__sticky" aria-label="Alla guider">
              <p className="guide-sidebar__title">Guider</p>
              <GuideNavigationLinks activeSlug={entry.slug} />
            </nav>
          </aside>

          <div className="guide-content">
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

            <details className="guide-mobile-navigation">
              <summary>
                <span>
                  <span className="guide-mobile-navigation__label">Guider</span>
                  <strong>{currentNavigationItem?.label ?? "Alla guider"}</strong>
                </span>
                <span className="guide-mobile-navigation__chevron" aria-hidden="true" />
              </summary>
              <nav aria-label="Alla guider på mobil">
                <GuideNavigationLinks activeSlug={entry.slug} />
              </nav>
            </details>

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
          </div>
        </div>
      </main>
    </>
  );
}
