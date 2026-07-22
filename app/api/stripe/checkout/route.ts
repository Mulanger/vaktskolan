import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getBillingCustomer, ensureMembershipEntitlement } from "@/lib/billing-store";
import { ClerkAuthenticationError, requireClerkUserId } from "@/lib/clerk-session";
import {
  getPremiumPrice,
  getSiteOrigin,
  getStripe,
  getStripeMode,
  isStripeAutomaticTaxEnabled,
} from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function checkoutIdempotencyKey(userId: string, request: NextRequest) {
  const requestKey = request.headers.get("x-idempotency-key")?.trim() || randomUUID();
  return `checkout_${createHash("sha256").update(`${userId}:${requestKey}`).digest("hex")}`;
}

function checkoutIntegrationIdentifier() {
  const suffix = Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
  return `vaktskolan_web_${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireClerkUserId(request);
    const stripe = getStripe();
    const livemode = getStripeMode();
    const [price, customer, entitlement] = await Promise.all([
      getPremiumPrice(),
      getBillingCustomer(userId, livemode),
      ensureMembershipEntitlement(userId, livemode),
    ]);
    const siteOrigin = getSiteOrigin();

    if (entitlement.tier === "premium") {
      return NextResponse.json(
        { ok: false, code: "already_premium", url: `${siteOrigin}/plattform` },
        { status: 409, headers: noStoreHeaders },
      );
    }

    const automaticTax = isStripeAutomaticTaxEnabled();
    const metadata = { clerk_user_id: userId, membership: "premium", access: "permanent" };
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "sv",
        managed_payments: { enabled: false },
        line_items: [{ price: price.id, quantity: 1 }],
        ...(customer
          ? { customer: customer.stripe_customer_id }
          : { customer_creation: "always" as const }),
        ...(customer && automaticTax ? { customer_update: { address: "auto" as const, name: "auto" as const } } : {}),
        ...(automaticTax ? { automatic_tax: { enabled: true } } : {}),
        integration_identifier: checkoutIntegrationIdentifier(),
        client_reference_id: userId,
        metadata,
        payment_intent_data: { metadata },
        success_url: `${siteOrigin}/plattform?billing=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteOrigin}/priser?checkout=cancelled`,
      },
      { idempotencyKey: checkoutIdempotencyKey(userId, request) },
    );

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.json({ ok: true, url: session.url }, { headers: noStoreHeaders });
  } catch (error) {
    const status = error instanceof ClerkAuthenticationError ? 401 : 503;
    const message = error instanceof ClerkAuthenticationError ? error.message : "Checkout could not be started.";
    console.error("Stripe Checkout session creation failed.", error);
    return NextResponse.json({ ok: false, error: message }, { status, headers: noStoreHeaders });
  }
}
