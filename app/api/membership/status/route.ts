import { NextRequest, NextResponse } from "next/server";
import { getMembershipSnapshot } from "@/lib/billing-store";
import { ClerkAuthenticationError, requireClerkUserId } from "@/lib/clerk-session";
import { getStripeMode } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function GET(request: NextRequest) {
  try {
    const userId = await requireClerkUserId(request);
    const snapshot = await getMembershipSnapshot(userId, getStripeMode());
    return NextResponse.json(
      {
        ok: true,
        membership: snapshot.entitlement.tier,
        usage: {
          vu1Question: snapshot.usage.vu1_question,
          scenarioQuestion: snapshot.usage.scenario_question,
          flashcardFlip: snapshot.usage.flashcard_flip,
        },
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    const status = error instanceof ClerkAuthenticationError ? 401 : 503;
    const message = error instanceof ClerkAuthenticationError ? error.message : "Membership status is unavailable.";
    console.error("Membership status lookup failed.", error);
    return NextResponse.json({ ok: false, error: message }, { status, headers: noStoreHeaders });
  }
}
