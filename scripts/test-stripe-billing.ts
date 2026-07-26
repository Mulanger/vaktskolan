import assert from "node:assert/strict";
import {
  BASIC_USAGE_LIMITS,
  hasPremiumAccess,
  isLiveStripeKey,
  isMembershipUsageKind,
} from "../lib/billing";
import {
  PremiumPurchaseVerificationError,
  verifyPremiumPurchaseForConversion,
} from "../lib/stripe-purchase-conversion";

assert.equal(hasPremiumAccess("premium"), true);
assert.equal(hasPremiumAccess("basic"), false);
assert.equal(hasPremiumAccess(null), false);

assert.deepEqual(BASIC_USAGE_LIMITS, {
  vu1_question: 10,
  scenario_question: 10,
  flashcard_flip: 10,
});
for (const kind of Object.keys(BASIC_USAGE_LIMITS)) assert.equal(isMembershipUsageKind(kind), true);
assert.equal(isMembershipUsageKind("module_quiz"), false);

assert.equal(isLiveStripeKey("rk_live_example"), true);
assert.equal(isLiveStripeKey("sk_live_example"), true);
assert.equal(isLiveStripeKey("rk_test_example"), false);
assert.equal(isLiveStripeKey("sk_test_example"), false);

const paidCheckout = {
  id: "cs_live_verifiedpurchase",
  livemode: true,
  mode: "payment",
  status: "complete",
  payment_status: "paid",
  client_reference_id: "user_verified",
  metadata: {
    clerk_user_id: "user_verified",
    membership: "premium",
    access: "permanent",
  },
  amount_total: 39900,
  currency: "sek",
};
const premiumLineItems = {
  data: [{ quantity: 1, price: { id: "price_premium" } }],
  has_more: false,
};
const verifiedPurchase = verifyPremiumPurchaseForConversion({
  session: paidCheckout,
  lineItems: premiumLineItems,
  configuredPriceId: "price_premium",
  expectedUserId: "user_verified",
  expectedLiveMode: true,
});
assert.deepEqual(verifiedPurchase, {
  paid: true,
  transactionId: "cs_live_verifiedpurchase",
  value: 399,
  currency: "SEK",
});

const pendingPurchase = verifyPremiumPurchaseForConversion({
  session: { ...paidCheckout, status: "open", payment_status: "unpaid" },
  lineItems: premiumLineItems,
  configuredPriceId: "price_premium",
  expectedUserId: "user_verified",
  expectedLiveMode: true,
});
assert.equal(pendingPurchase.paid, false);

assert.throws(
  () =>
    verifyPremiumPurchaseForConversion({
      session: paidCheckout,
      lineItems: premiumLineItems,
      configuredPriceId: "price_premium",
      expectedUserId: "user_someone_else",
      expectedLiveMode: true,
    }),
  PremiumPurchaseVerificationError,
);
assert.throws(
  () =>
    verifyPremiumPurchaseForConversion({
      session: paidCheckout,
      lineItems: { ...premiumLineItems, data: [{ quantity: 1, price: { id: "price_wrong" } }] },
      configuredPriceId: "price_premium",
      expectedUserId: "user_verified",
      expectedLiveMode: true,
    }),
  PremiumPurchaseVerificationError,
);

console.log("Validated permanent Premium access and Basic lifetime quota configuration.");
