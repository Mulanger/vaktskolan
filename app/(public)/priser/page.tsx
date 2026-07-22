import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/site";

const SIGN_UP_URL = "/login?mode=sign-up&redirect_url=%2Fplattform";

const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "För dig som vill testa Vaktskolan och få en känsla för hur plattformen fungerar.",
    price: "0 kr",
    priceNote: "Kostnadsfritt",
    cta: "Välj Basic",
    featured: false,
    features: [
      "Utvalda lektioner från VU1",
      "Ett urval av quizfrågor",
      "Prova scenariofrågor och flashcards",
      "Se resultat efter genomförda quiz",
      "Grundläggande översikt över dina framsteg",
      "Dina framsteg sparas",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "För dig som vill träna strukturerat och känna dig helt förberedd inför väktarprovet.",
    price: "99 kr",
    priceNote: "Ingen bindningstid",
    cta: "Skaffa Premium",
    featured: true,
    features: [
      "Samtliga lektioner i VU1 och VU2",
      "Full tillgång till alla quiz och frågebanker",
      "Hundratals realistiska scenariofrågor",
      "Komplett samling flashcards",
      "Personlig repetition av frågor du svarat fel på",
      "Realistiska slutprov med tidtagning",
      "Resultat, förklaringar och detaljerad statistik",
      "Personlig kursprogress som sparas mellan enheter",
      "Nya frågor och framtida innehållsuppdateringar ingår",
      "Träna obegränsat – så ofta du vill",
    ],
  },
] as const;

export const metadata: Metadata = {
  title: "Priser – Basic och Premium",
  description:
    "Jämför Vaktskolans medlemskap Basic och Premium för VU1, VU2, quiz, scenarioträning, flashcards och slutprov.",
  alternates: { canonical: "/priser" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "/priser",
    siteName: "Vaktskolan",
    title: "Basic eller Premium – välj ditt medlemskap",
    description: "Börja med Basic och uppgradera till hela Vaktskolan när du vill.",
  },
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18">
      <path d="m3.5 9.2 3.2 3.2 7.8-7.8" />
    </svg>
  );
}

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Vaktskolans priser",
    description: "Jämför medlemskapen Basic och Premium för Vaktskolans digitala lärplattform.",
    url: absoluteUrl("/priser"),
    isPartOf: { "@type": "WebSite", name: "Vaktskolan", url: absoluteUrl("/") },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main id="main-content" className="pricing-page">
        <section className="pricing-hero" aria-labelledby="pricing-title">
          <div className="pricing-container">
            <div className="pricing-heading">
              <p>Medlemskap</p>
              <h1 id="pricing-title">Välj ditt medlemskap</h1>
              <span>Träna smartare inför väktarprovet – börja med Basic och uppgradera när du vill.</span>
            </div>

            <div className="pricing-grid">
              {plans.map((plan) => (
                <article
                  className={`pricing-plan${plan.featured ? " pricing-plan--featured" : ""}`}
                  key={plan.id}
                >
                  {plan.featured ? <div className="pricing-plan__recommendation">Rekommenderas för dig</div> : null}
                  <div className="pricing-plan__inner">
                    <div className="pricing-plan__orb" aria-hidden="true" />
                    <h2>{plan.name}</h2>
                    <p className="pricing-plan__description">{plan.description}</p>
                    <div className="pricing-plan__price">
                      <strong>{plan.price}</strong>
                      <span>/mån</span>
                    </div>
                    <p className="pricing-plan__price-note">{plan.priceNote}</p>
                    <div className="pricing-plan__divider" />
                    <h3>Det här ingår:</h3>
                    <ul>
                      {plan.features.map((feature) => (
                        <li key={feature}>
                          <span className="pricing-check"><CheckIcon /></span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      className={`pricing-plan__cta${plan.featured ? " pricing-plan__cta--featured" : ""}`}
                      data-pricing-plan={plan.id}
                      href={SIGN_UP_URL}
                    >
                      {plan.cta} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <p className="pricing-assurance">Ingen bindningstid <span aria-hidden="true">·</span> Avsluta när du vill</p>
          </div>
        </section>

        <section className="pricing-sources" aria-label="Källor för utbildningsinnehållet">
          <p>Baserat på föreskrifter från</p>
          <div>
            <span>Polisen</span>
            <span>Arbetsmiljöverket</span>
            <span>IMY</span>
            <span>Regeringskansliet</span>
            <span>Länsstyrelserna</span>
          </div>
        </section>
      </main>
    </>
  );
}
