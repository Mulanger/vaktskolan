import { NextRequest, NextResponse } from "next/server";
import { ClerkAuthenticationError, requireClerkUserId } from "@/lib/clerk-session";
import {
  PremiumPurchaseVerificationError,
  verifyPremiumPurchaseForConversion,
} from "@/lib/stripe-purchase-conversion";
import { getPremiumPrice, getStripe, getStripeMode } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const checkoutSessionIdPattern = /^cs_(?:test|live)_[A-Za-z0-9]+$/;

export async function GET(request: NextRequest) {
  try {
    const userId = await requireClerkUserId(request);
    const sessionId = request.nextUrl.searchParams.get("session_id")?.trim() || "";
    if (!checkoutSessionIdPattern.test(sessionId)) {
      return NextResponse.json(
        { ok: false, error: "A valid Checkout Session is required." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const stripe = getStripe();
    const [session, lineItems, configuredPrice] = await Promise.all([
      stripe.checkout.sessions.retrieve(sessionId),
      stripe.checkout.sessions.listLineItems(sessionId, { limit: 2 }),
      getPremiumPrice(),
    ]);
    const purchase = verifyPremiumPurchaseForConversion({
      session,
      lineItems,
      configuredPriceId: configuredPrice.id,
      expectedUserId: userId,
      expectedLiveMode: getStripeMode(),
    });

    return NextResponse.json(
      { ok: true, paid: purchase.paid, ...(purchase.paid ? { purchase } : {}) },
      { status: purchase.paid ? 200 : 202, headers: noStoreHeaders },
    );
  } catch (error) {
    if (error instanceof ClerkAuthenticationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401, headers: noStoreHeaders });
    }
    if (error instanceof PremiumPurchaseVerificationError) {
      console.warn("Stripe Checkout purchase was rejected for Google Ads conversion tracking.", error);
      return NextResponse.json(
        { ok: false, error: "Checkout purchase could not be verified." },
        { status: 404, headers: noStoreHeaders },
      );
    }

    console.error("Stripe Checkout purchase verification failed.", error);
    return NextResponse.json(
      { ok: false, error: "Checkout purchase verification is temporarily unavailable." },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
