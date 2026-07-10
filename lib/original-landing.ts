import { readFileSync } from "node:fs";
import { join } from "node:path";

type OriginalLanding = {
  markup: string;
  script: string;
  styles: string;
};

function requiredMatch(source: string, expression: RegExp, label: string) {
  const match = source.match(expression);
  if (!match?.[1]) throw new Error(`Could not extract ${label} from landing/index.html`);
  return match[1];
}

export function getOriginalLanding(): OriginalLanding {
  const source = readFileSync(join(process.cwd(), "landing", "index.html"), "utf8");
  const styles = requiredMatch(source, /<style>([\s\S]*?)<\/style>/, "inline styles")
    .replaceAll("body > header", ".original-landing-shell > header");

  const header = requiredMatch(source, /(<header[\s\S]*?<\/header>)/, "header");
  const main = requiredMatch(source, /(<main[\s\S]*?<\/main>)/, "hero");
  const study = requiredMatch(
    source,
    /(<section id="utbildningar"[\s\S]*?<\/section>)/,
    "study section",
  );
  const footer = requiredMatch(source, /(<footer[\s\S]*?<\/footer>)/, "footer");

  let headingCount = 0;
  let markup = `${header}${main}${study}${footer}`.replace(
    /<h1([^>]*)>([\s\S]*?)<\/h1>/g,
    (_match, attributes: string, contents: string) => {
      headingCount += 1;
      const semanticHeading = headingCount === 1
        ? '<h1 class="sr-only">Träna inför väktarprovet</h1>'
        : "";
      return `${semanticHeading}<div aria-hidden="true"${attributes}>${contents}</div>`;
    },
  );

  if (headingCount !== 2) {
    throw new Error(`Expected two responsive visual headings, found ${headingCount}`);
  }

  markup = markup
    .replace('<main class="', '<main id="main-content" class="')
    .replace(
      /<img src="\/landing\/assets\/guard-figure\.png"([^>]*)>/,
      '<picture><source media="(max-width: 1023px)" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="><source srcset="/site-assets/hero/guard-desktop.avif" type="image/avif"><img src="/site-assets/hero/guard-desktop.webp"$1 fetchpriority="high"></picture>',
    )
    .replace(
      /<img src="\/landing\/assets\/vaktare\.png"([^>]*)>/,
      '<picture><source media="(min-width: 640px)" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="><source srcset="/site-assets/hero/guard-mobile.avif" type="image/avif"><img src="/site-assets/hero/guard-mobile.webp"$1 fetchpriority="high"></picture>',
    )
    .replaceAll("/quiz-demo", "/vaktarprov/vu1-ovningsfragor")
    .replaceAll("/login.html?", "/login?")
    .replaceAll("redirect_url=/platform", "redirect_url=/plattform")
    .replaceAll('href="#" class="hover:text-zinc-400">Användarvillkor', 'href="/anvandarvillkor" class="hover:text-zinc-400">Användarvillkor')
    .replaceAll('href="#" class="hover:text-zinc-400">Integritetspolicy', 'href="/integritet" class="hover:text-zinc-400">Integritetspolicy')
    .replaceAll('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
    .replaceAll("Godkänd av Länsstyrelsen", "Så fungerar Länsstyrelsens godkännande")
    .replaceAll(
      "Sveriges modernaste studietjänst för framtida väktare.",
      "Fristående studietjänst för framtida väktare.",
    );

  const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  const originalScript = scripts.at(-1)?.[1];
  if (!originalScript) throw new Error("Could not extract landing interactions");

  const script = originalScript.replace(
    /window\.onload = function\(\) \{[\s\S]*?initHeroQuizModule\(\);\s*\}/,
    "initMobileMenu();\n        initHeroQuizModule();",
  ).replaceAll("/quiz-demo", "/vaktarprov/vu1-ovningsfragor")
    .replaceAll("/login.html?", "/login?")
    .replaceAll("redirect_url=/platform", "redirect_url=/plattform");

  return { markup, script, styles };
}
