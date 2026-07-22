import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/site";

const BASIC_SIGN_UP_URL = "/login?mode=sign-up&redirect_url=%2Fplattform";
const PREMIUM_SIGN_UP_URL = "/login?mode=sign-up&redirect_url=%2Fplattform%3Fupgrade%3Dpremium";

const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "För dig som vill prova Vaktskolan och bygga en stabil grund innan du låser upp hela utbildningen.",
    price: "0 kr",
    priceUnit: "",
    priceNote: "Kostnadsfritt – inget betalkort krävs",
    cta: "Börja med Basic",
    href: BASIC_SIGN_UP_URL,
    featured: false,
    features: [
      "Hela modul 1 i VU1",
      "10 VU1-frågor",
      "10 realistiska scenariofrågor",
      "10 flashcard-vändningar",
      "Resultat och förklaringar på dina svar",
      "Dina framsteg sparas på kontot",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "För dig som vill träna strukturerat, obegränsat och känna dig helt förberedd inför väktarprovet.",
    price: "399 kr",
    priceUnit: "engångsbelopp",
    priceNote: "Permanent tillgång – inga återkommande avgifter",
    cta: "Lås upp Premium",
    href: PREMIUM_SIGN_UP_URL,
    featured: true,
    features: [
      "Samtliga lektioner och moduler i VU1 och VU2",
      "Obegränsad tillgång till alla quiz och frågebanker",
      "Hela banken med realistiska scenariofrågor",
      "Komplett samling flashcards utan vändningsgräns",
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
    "Jämför Vaktskolans medlemskap Basic och Premium. Premium kostar 399 kr som engångsbelopp och ger permanent tillgång.",
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
    description: "Börja kostnadsfritt med Basic eller lås upp hela Vaktskolan permanent för 399 kr.",
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
    description: "Jämför Basic med permanent Premium för Vaktskolans digitala lärplattform.",
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
              <span>Prova grunderna kostnadsfritt eller få permanent tillgång till hela Vaktskolan.</span>
            </div>

            <div className="pricing-grid">
              {plans.map((plan) => (
                <article
                  className={`pricing-plan${plan.featured ? " pricing-plan--featured" : ""}`}
                  key={plan.id}
                >
                  {plan.featured ? <div className="pricing-plan__recommendation">Mest komplett</div> : null}
                  <div className="pricing-plan__inner">
                    <div className="pricing-plan__orb" aria-hidden="true" />
                    <h2>{plan.name}</h2>
                    <p className="pricing-plan__description">{plan.description}</p>
                    <div className="pricing-plan__price">
                      <strong>{plan.price}</strong>
                      {plan.priceUnit ? <span>{plan.priceUnit}</span> : null}
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
                      href={plan.href}
                    >
                      {plan.cta} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <p className="pricing-assurance">En betalning <span aria-hidden="true">·</span> Permanent Premium <span aria-hidden="true">·</span> Inga återkommande avgifter</p>
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
