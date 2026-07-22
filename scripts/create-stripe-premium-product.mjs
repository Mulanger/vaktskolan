import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!secretKey || !/^(?:sk|rk)_test_/.test(secretKey)) {
  throw new Error("stripe:setup only accepts a rotated Stripe test/sandbox key in STRIPE_SECRET_KEY.");
}

const stripe = new Stripe(secretKey, {
  appInfo: { name: "Vaktskolan setup", version: "2.0.0", url: "https://vaktskolan.se" },
});
const lookupKey = "vaktskolan_premium_lifetime_sek";
const existingPrices = await stripe.prices.list({ active: true, lookup_keys: [lookupKey], limit: 1 });
let price = existingPrices.data[0];

if (price) {
  if (price.currency !== "sek" || price.unit_amount !== 39900 || price.type !== "one_time" || price.tax_behavior !== "inclusive") {
    throw new Error(`Existing lookup key ${lookupKey} does not represent a one-time payment of 399 SEK.`);
  }
} else {
  const taxCode = process.env.STRIPE_PRODUCT_TAX_CODE?.trim();
  const product = await stripe.products.create(
    {
      name: "Vaktskolan Premium – permanent tillgång",
      description: "Permanent tillgång till Vaktskolans VU1- och VU2-träning, quiz, scenarier, flashcards och slutprov.",
      ...(taxCode ? { tax_code: taxCode } : {}),
      metadata: { membership: "premium", access: "permanent", application: "vaktskolan" },
    },
    { idempotencyKey: "vaktskolan-premium-lifetime-product-v1" },
  );
  price = await stripe.prices.create(
    {
      product: product.id,
      currency: "sek",
      unit_amount: 39900,
      tax_behavior: "inclusive",
      lookup_key: lookupKey,
      metadata: { membership: "premium", access: "permanent", application: "vaktskolan" },
    },
    { idempotencyKey: "vaktskolan-premium-lifetime-sek-v1" },
  );
}

console.log(`Stripe test product is ready. Add this to .env:\nSTRIPE_PREMIUM_PRICE_ID=${price.id}`);
