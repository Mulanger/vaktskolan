import assert from "node:assert/strict";
import {
  BASIC_USAGE_LIMITS,
  hasPremiumAccess,
  isLiveStripeKey,
  isMembershipUsageKind,
} from "../lib/billing";

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

console.log("Validated permanent Premium access and Basic lifetime quota configuration.");
