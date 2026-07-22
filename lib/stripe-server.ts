import "server-only";
import Stripe from "stripe";
import { isLiveStripeKey } from "@/lib/billing";

let stripeClient: Stripe | null = null;
let premiumPricePromise: Promise<Stripe.Price> | null = null;

function requiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getStripeSecretKey() {
  const key = requiredEnvironmentValue("STRIPE_SECRET_KEY");
  if (!/^(?:sk|rk)_(?:test|live)_/.test(key)) {
    throw new Error("STRIPE_SECRET_KEY must be a Stripe test or live secret/restricted key.");
  }
  return key;
}

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      appInfo: { name: "Vaktskolan", version: "2.0.0", url: "https://vaktskolan.se" },
    });
  }
  return stripeClient;
}

export function getStripeMode() {
  return isLiveStripeKey(getStripeSecretKey());
}

export function getStripeWebhookSecret() {
  const secret = requiredEnvironmentValue("STRIPE_WEBHOOK_SECRET");
  if (!secret.startsWith("whsec_")) throw new Error("STRIPE_WEBHOOK_SECRET is not a Stripe webhook secret.");
  return secret;
}

export function getSiteOrigin() {
  const configured = process.env.SITE_URL || "https://vaktskolan.se";
  return new URL(configured).origin;
}

export function isStripeAutomaticTaxEnabled() {
  return process.env.STRIPE_AUTOMATIC_TAX?.toLowerCase() === "true";
}

export async function getPremiumPrice() {
  if (!premiumPricePromise) {
    premiumPricePromise = (async () => {
      const priceId = requiredEnvironmentValue("STRIPE_PREMIUM_PRICE_ID");
      const price = await getStripe().prices.retrieve(priceId);
      const expectedLiveMode = getStripeMode();

      if (!price.active || price.livemode !== expectedLiveMode) {
        throw new Error("STRIPE_PREMIUM_PRICE_ID is inactive or belongs to the wrong Stripe mode.");
      }
      if (price.currency !== "sek" || price.unit_amount !== 39900) {
        throw new Error("STRIPE_PREMIUM_PRICE_ID must be the 399 SEK Premium price.");
      }
      if (price.type !== "one_time" || price.recurring) {
        throw new Error("STRIPE_PREMIUM_PRICE_ID must be a one-time price.");
      }
      if (price.tax_behavior !== "inclusive") {
        throw new Error("STRIPE_PREMIUM_PRICE_ID must use inclusive tax behavior so 399 SEK is the final price.");
      }

      return price;
    })().catch((error) => {
      premiumPricePromise = null;
      throw error;
    });
  }

  return premiumPricePromise;
}
