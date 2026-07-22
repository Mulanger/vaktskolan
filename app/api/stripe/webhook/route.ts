import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  beginStripeEvent,
  completeStripeEvent,
  failStripeEvent,
  getBillingPurchaseByPaymentIntent,
  grantPremiumEntitlement,
  hasAnotherPaidPurchase,
  revokePremiumEntitlement,
  updateBillingPurchase,
  upsertBillingCustomer,
  upsertBillingPurchase,
} from "@/lib/billing-store";
import { syncClerkMembership } from "@/lib/clerk-membership";
import { getPremiumPrice, getStripe, getStripeMode, getStripeWebhookSecret } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function stripeId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return "";
}

async function syncCheckoutSession(session: Stripe.Checkout.Session, livemode: boolean) {
  const userId = session.client_reference_id || session.metadata?.clerk_user_id;
  const customerId = stripeId(session.customer);
  const paymentIntentId = stripeId(session.payment_intent);
  if (!userId || !userId.startsWith("user_") || !customerId) {
    throw new Error("Checkout Session is missing its Clerk user or Stripe customer mapping.");
  }
  if (session.mode !== "payment" || session.metadata?.membership !== "premium") {
    throw new Error("Checkout Session is not a Vaktskolan permanent Premium payment.");
  }

  const [lineItems, configuredPrice] = await Promise.all([
    getStripe().checkout.sessions.listLineItems(session.id, { limit: 1 }),
    getPremiumPrice(),
  ]);
  const lineItem = lineItems.data[0];
  const priceId = lineItem?.price?.id || "";
  if (!lineItem || lineItems.data.length !== 1 || lineItem.quantity !== 1 || priceId !== configuredPrice.id) {
    throw new Error("Checkout Session does not contain the configured Premium price.");
  }
  if (session.amount_total !== 39900 || session.currency !== "sek") {
    throw new Error("Checkout Session total is not 399 SEK.");
  }

  const paid = session.payment_status === "paid";
  const paymentStatus = paid ? "paid" : session.status === "expired" ? "expired" : "pending";
  await upsertBillingCustomer({ user_id: userId, stripe_customer_id: customerId, livemode });
  await upsertBillingPurchase({
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId || null,
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_product_id: stripeId(lineItem.price?.product) || null,
    stripe_price_id: priceId || null,
    amount_total: session.amount_total,
    currency: session.currency,
    payment_status: paymentStatus,
    livemode,
    purchased_at: paid ? new Date().toISOString() : null,
  });

  if (!paid) return;
  if (!paymentIntentId) throw new Error("Paid Checkout Session is missing its PaymentIntent.");
  const grantedAt = new Date().toISOString();
  await grantPremiumEntitlement(userId, livemode, session.id, paymentIntentId);
  await syncClerkMembership(userId, "premium", { customerId, paymentIntentId, grantedAt });
}

async function markCheckoutSession(session: Stripe.Checkout.Session, paymentStatus: "failed" | "expired") {
  const userId = session.client_reference_id || session.metadata?.clerk_user_id;
  const customerId = stripeId(session.customer);
  if (userId && customerId) {
    await upsertBillingCustomer({ user_id: userId, stripe_customer_id: customerId, livemode: session.livemode });
  }
  await updateBillingPurchase(session.id, {
    payment_status: paymentStatus,
    stripe_payment_intent_id: stripeId(session.payment_intent) || null,
  });
}

async function revokePurchaseAccess(paymentIntentId: string, livemode: boolean, status: "refunded" | "disputed") {
  const purchase = await getBillingPurchaseByPaymentIntent(paymentIntentId, livemode);
  if (!purchase) throw new Error(`No Vaktskolan purchase is mapped to PaymentIntent ${paymentIntentId}.`);

  await updateBillingPurchase(purchase.stripe_checkout_session_id, { payment_status: status });
  if (await hasAnotherPaidPurchase(purchase.user_id, livemode, purchase.stripe_checkout_session_id)) return;

  await revokePremiumEntitlement(purchase.user_id, livemode);
  await syncClerkMembership(purchase.user_id, "basic");
}

async function restoreDisputedPurchase(paymentIntentId: string, livemode: boolean) {
  const purchase = await getBillingPurchaseByPaymentIntent(paymentIntentId, livemode);
  if (!purchase) throw new Error(`No Vaktskolan purchase is mapped to PaymentIntent ${paymentIntentId}.`);
  const grantedAt = new Date().toISOString();
  await updateBillingPurchase(purchase.stripe_checkout_session_id, {
    payment_status: "paid",
    purchased_at: purchase.purchased_at || grantedAt,
  });
  await grantPremiumEntitlement(purchase.user_id, livemode, purchase.stripe_checkout_session_id, paymentIntentId);
  await syncClerkMembership(purchase.user_id, "premium", {
    customerId: purchase.stripe_customer_id,
    paymentIntentId,
    grantedAt,
  });
}

async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await syncCheckoutSession(event.data.object as Stripe.Checkout.Session, event.livemode);
      return;
    case "checkout.session.async_payment_failed":
      await markCheckoutSession(event.data.object as Stripe.Checkout.Session, "failed");
      return;
    case "checkout.session.expired":
      await markCheckoutSession(event.data.object as Stripe.Checkout.Session, "expired");
      return;
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (charge.refunded) await revokePurchaseAccess(stripeId(charge.payment_intent), event.livemode, "refunded");
      return;
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      await revokePurchaseAccess(stripeId(dispute.payment_intent), event.livemode, "disputed");
      return;
    }
    case "charge.dispute.closed": {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntentId = stripeId(dispute.payment_intent);
      if (dispute.status === "won") {
        const charge = await getStripe().charges.retrieve(stripeId(dispute.charge));
        if (!charge.refunded) await restoreDisputedPurchase(paymentIntentId, event.livemode);
      } else {
        await revokePurchaseAccess(paymentIntentId, event.livemode, "disputed");
      }
      return;
    }
    default:
      return;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing Stripe signature." }, { status: 400, headers: noStoreHeaders });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, getStripeWebhookSecret());
  } catch (error) {
    console.error("Stripe webhook signature verification failed.", error);
    return NextResponse.json({ ok: false, error: "Invalid Stripe signature." }, { status: 400, headers: noStoreHeaders });
  }

  if (event.livemode !== getStripeMode()) {
    return NextResponse.json({ ok: false, error: "Stripe mode mismatch." }, { status: 400, headers: noStoreHeaders });
  }

  try {
    const shouldProcess = await beginStripeEvent(event.id, event.type, event.livemode);
    if (!shouldProcess) return NextResponse.json({ received: true, duplicate: true }, { headers: noStoreHeaders });
    await processStripeEvent(event);
    await completeStripeEvent(event.id);
    return NextResponse.json({ received: true }, { headers: noStoreHeaders });
  } catch (error) {
    console.error(`Stripe webhook ${event.id} failed.`, error);
    try {
      await failStripeEvent(event.id, error);
    } catch (storageError) {
      console.error("Stripe webhook failure state could not be stored.", storageError);
    }
    return NextResponse.json({ received: false, error: "Webhook processing failed." }, { status: 500, headers: noStoreHeaders });
  }
}
