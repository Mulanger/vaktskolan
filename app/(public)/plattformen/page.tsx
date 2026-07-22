import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/site";

const SIGN_UP_URL = "/login?mode=sign-up&redirect_url=%2Fplattform";

const platformFeatures = [
  {
    id: "kurserna",
    label: "Kurserna · VU1 & VU2",
    tone: "green",
    title: "Strukturerade moduler som tar dig hela vägen",
    description:
      "Kurserna följer samma ämnesområden som väktarutbildningen. Varje modul består av korta lektionssidor och avslutas med ett quiz innan du går vidare.",
    bullets: [
      "11 moduler i VU1 och 6 i VU2 – juridik, arbetsmiljö, yrkesetik och mer",
      "En tydlig sidopanel visar var du är och vad som återstår",
      "Dina framsteg sparas automatiskt så att du kan fortsätta där du slutade",
    ],
    image: "/site-assets/platform-showcase/course.png",
    imageWidth: 1644,
    imageHeight: 864,
    alt: "Kursvyn för VU1 med moduler och personlig progression",
  },
  {
    id: "quizportalen",
    label: "Quizportalen",
    tone: "purple",
    title: "Träna tills kunskapen sitter",
    description:
      "I Quizportalen väljer du hur du vill öva: kursquiz, flashcards med viktiga lagrum och begrepp eller realistiska scenariofrågor från väktaryrket.",
    bullets: [
      "VU1- och VU2-quiz med fler än 200 flervalsfrågor",
      "300 scenariofrågor som prövar ditt omdöme i realistiska situationer",
      "Att repetera samlar felbesvarade frågor och följer upp dem efter 24 timmar",
    ],
    image: "/site-assets/platform-showcase/quiz-portal.png",
    imageWidth: 1641,
    imageHeight: 756,
    alt: "Quizportalen med kursquiz, flashcards och scenarioträning",
  },
  {
    id: "slutprovet",
    label: "Slutprov",
    tone: "blue",
    title: "Ett slutprov som känns som på riktigt",
    description:
      "När kursen är klar väntar ett skarpt kunskapstest i provläge – en fråga i taget och inget facit förrän du har lämnat in.",
    bullets: [
      "15 minuters tidsgräns och godkänt vid 24 av 30 rätt",
      "24 timmars spärr vid underkänt för ett mer fokuserat provläge",
      "Separata slutprov för VU1 och VU2 med resultat direkt efter inlämning",
    ],
    image: "/site-assets/platform-showcase/final-exam.png",
    imageWidth: 1400,
    imageHeight: 911,
    alt: "Slutprovsvyn med separata prov för VU1 och VU2",
  },
] as const;

const supportingFeatures = [
  {
    icon: "clock",
    tone: "orange",
    title: "Att repetera",
    description: "Fel svar schemaläggs och kommer tillbaka tills kunskapen sitter.",
  },
  {
    icon: "cards",
    tone: "green",
    title: "Flashcards",
    description: "200 kort med lagrum, paragrafer och facktermer att vända och repetera.",
  },
  {
    icon: "scenario",
    tone: "red",
    title: "Scenarioträning",
    description: "Realistiska situationer som tränar omdöme, inte bara faktakunskap.",
  },
  {
    icon: "progress",
    tone: "blue",
    title: "Emblem & framsteg",
    description: "Milstolpar och statistik som gör utvecklingen tydlig genom hela utbildningen.",
  },
] as const;

export const metadata: Metadata = {
  title: "Plattformen – VU1, VU2, quiz och slutprov",
  description:
    "Upptäck Vaktskolans digitala lärplattform med VU1, VU2, kursmoduler, quiz, scenarioträning, flashcards och slutprov.",
  alternates: { canonical: "/plattformen" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "/plattformen",
    siteName: "Vaktskolan",
    title: "Vaktskolans plattform för VU1 och VU2",
    description: "Lektioner, quiz, scenarioträning, flashcards och slutprov samlade på ett ställe.",
    images: [
      {
        url: "/site-assets/platform-showcase/dashboard.png",
        width: 1463,
        height: 931,
        alt: "Vaktskolans personliga elevöversikt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaktskolans plattform för VU1 och VU2",
    description: "Lektioner, quiz, scenarioträning, flashcards och slutprov samlade på ett ställe.",
    images: ["/site-assets/platform-showcase/dashboard.png"],
  },
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m3 8.3 3.1 3.1L13 4.8" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: (typeof supportingFeatures)[number]["icon"] }) {
  if (name === "clock") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5V12l3 1.8" />
      </svg>
    );
  }

  if (name === "cards") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="4" y="7" width="12" height="11" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      </svg>
    );
  }

  if (name === "scenario") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3 21 12 12 21 3 12Z" />
        <path d="M12 8v5" />
        <path d="M12 16.5h.01" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.3 2.3 4.8-5" />
    </svg>
  );
}

export default function PlatformShowcasePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Vaktskolans plattform för VU1 och VU2",
    description:
      "En digital lärplattform med kursmoduler, quiz, scenarioträning, flashcards och slutprov för VU1 och VU2.",
    url: absoluteUrl("/plattformen"),
    datePublished: "2026-07-22T12:00:00+02:00",
    dateModified: "2026-07-22T12:00:00+02:00",
    isPartOf: { "@type": "WebSite", name: "Vaktskolan", url: absoluteUrl("/") },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Plattformen", item: absoluteUrl("/plattformen") },
    ],
  };

  return (
    <>
      <JsonLd data={[jsonLd, breadcrumbJsonLd]} />
      <main id="main-content" className="platform-showcase">
        <section id="oversikt" className="platform-hero">
          <div className="platform-container">
            <div className="platform-hero__copy">
              <p className="platform-eyebrow">Plattformen</p>
              <h1>Hela väktarutbildningen. En plattform.</h1>
              <p className="platform-hero__lead">
                En digital studiemiljö för VU1 och VU2 med lektioner, quiz, scenarioträning och slutprov.
                Plugga var du vill, i din egen takt, och kom bättre förberedd till utbildningen.
              </p>
              <div className="platform-actions">
                <Link className="platform-button platform-button--primary" href={SIGN_UP_URL}>
                  Bli medlem gratis <span aria-hidden="true">→</span>
                </Link>
                <a className="platform-button platform-button--secondary" href="#kurserna">
                  Se hur det fungerar
                </a>
              </div>
            </div>

            <figure className="platform-browser">
              <div className="platform-browser__bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <small>vaktskolan.se/plattform</small>
              </div>
              <Image
                src="/site-assets/platform-showcase/dashboard.png"
                width={1463}
                height={931}
                sizes="(max-width: 760px) calc(100vw - 32px), 1020px"
                priority
                alt="Vaktskolans elevöversikt med kursframsteg, nästa steg och emblem"
              />
              <figcaption>Din personliga översikt – framsteg och nästa steg, alltid uppdaterade.</figcaption>
            </figure>
          </div>
        </section>

        <section className="platform-stat-strip" aria-label="Plattformens innehåll">
          <div className="platform-container platform-stat-strip__grid">
            <div><strong>17</strong><span>moduler i VU1 och VU2</span></div>
            <div><strong>150+</strong><span>lektionssidor</span></div>
            <div><strong>500+</strong><span>quiz- och scenariofrågor</span></div>
            <div><strong>200</strong><span>flashcards</span></div>
          </div>
        </section>

        <div className="platform-feature-list">
          {platformFeatures.map((feature, index) => (
            <section
              className={`platform-feature platform-feature--${feature.tone}${index % 2 === 1 ? " platform-feature--reverse" : ""}`}
              id={feature.id}
              key={feature.id}
            >
              <div className="platform-container platform-feature__grid">
                <div className="platform-feature__copy">
                  <p className="platform-feature__label">{feature.label}</p>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                  <ul>
                    {feature.bullets.map((bullet) => (
                      <li key={bullet}>
                        <span className="platform-check"><CheckIcon /></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <figure className="platform-feature__media">
                  <Image
                    src={feature.image}
                    width={feature.imageWidth}
                    height={feature.imageHeight}
                    sizes="(max-width: 900px) calc(100vw - 32px), 620px"
                    alt={feature.alt}
                  />
                </figure>
              </div>
            </section>
          ))}
        </div>

        <section className="platform-extras" aria-labelledby="platform-extras-title">
          <div className="platform-container">
            <div className="platform-section-heading">
              <p className="platform-eyebrow">Dessutom</p>
              <h2 id="platform-extras-title">Detaljer som gör pluggandet lättare</h2>
            </div>
            <div className="platform-extras__grid">
              {supportingFeatures.map((feature) => (
                <article className={`platform-extra platform-extra--${feature.tone}`} key={feature.title}>
                  <span className="platform-extra__icon"><FeatureIcon name={feature.icon} /></span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="platform-final-cta">
          <div className="platform-container platform-final-cta__inner">
            <p className="platform-eyebrow">Börja idag</p>
            <h2>Redo att ta nästa steg?</h2>
            <p>Skapa ett konto och börja med den första modulen i VU1. Dina framsteg sparas från första sidan.</p>
            <div className="platform-actions">
              <Link className="platform-button platform-button--primary" href={SIGN_UP_URL}>
                Bli medlem gratis <span aria-hidden="true">→</span>
              </Link>
              <a className="platform-button platform-button--dark-secondary" href="#oversikt">
                Se plattformen igen
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
