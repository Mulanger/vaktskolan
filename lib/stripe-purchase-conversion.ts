export const PREMIUM_PURCHASE_AMOUNT_MINOR = 39_900;
export const PREMIUM_PURCHASE_VALUE = 399;
export const PREMIUM_PURCHASE_CURRENCY = "SEK";

type CheckoutSessionForConversion = {
  id: string;
  livemode: boolean;
  mode: string;
  status: string | null;
  payment_status: string;
  client_reference_id: string | null;
  metadata: Record<string, string> | null;
  amount_total: number | null;
  currency: string | null;
};

type CheckoutLineItemsForConversion = {
  data: Array<{
    quantity: number | null;
    price: { id: string } | null;
  }>;
  has_more: boolean;
};

export class PremiumPurchaseVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PremiumPurchaseVerificationError";
  }
}

export function verifyPremiumPurchaseForConversion({
  session,
  lineItems,
  configuredPriceId,
  expectedUserId,
  expectedLiveMode,
}: {
  session: CheckoutSessionForConversion;
  lineItems: CheckoutLineItemsForConversion;
  configuredPriceId: string;
  expectedUserId: string;
  expectedLiveMode: boolean;
}) {
  if (
    session.client_reference_id !== expectedUserId ||
    session.metadata?.clerk_user_id !== expectedUserId
  ) {
    throw new PremiumPurchaseVerificationError("Checkout Session does not belong to the authenticated user.");
  }
  if (session.livemode !== expectedLiveMode) {
    throw new PremiumPurchaseVerificationError("Checkout Session belongs to the wrong Stripe mode.");
  }
  if (
    session.mode !== "payment" ||
    session.metadata?.membership !== "premium" ||
    session.metadata?.access !== "permanent"
  ) {
    throw new PremiumPurchaseVerificationError("Checkout Session is not a permanent Premium purchase.");
  }

  const lineItem = lineItems.data[0];
  if (
    lineItems.has_more ||
    lineItems.data.length !== 1 ||
    lineItem?.quantity !== 1 ||
    lineItem.price?.id !== configuredPriceId
  ) {
    throw new PremiumPurchaseVerificationError("Checkout Session does not contain the configured Premium price.");
  }
  if (
    session.amount_total !== PREMIUM_PURCHASE_AMOUNT_MINOR ||
    session.currency?.toLowerCase() !== PREMIUM_PURCHASE_CURRENCY.toLowerCase()
  ) {
    throw new PremiumPurchaseVerificationError("Checkout Session total is not 399 SEK.");
  }

  const paid = session.status === "complete" && session.payment_status === "paid";
  return {
    paid,
    transactionId: session.id,
    value: PREMIUM_PURCHASE_VALUE,
    currency: PREMIUM_PURCHASE_CURRENCY,
  };
}
