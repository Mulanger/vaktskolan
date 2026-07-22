import { NextRequest, NextResponse } from "next/server";
import { isMembershipUsageKind } from "@/lib/billing";
import { consumeMembershipUsage } from "@/lib/billing-store";
import { ClerkAuthenticationError, requireClerkUserId } from "@/lib/clerk-session";
import { getStripeMode } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function POST(request: NextRequest) {
  try {
    const userId = await requireClerkUserId(request);
    const body = await request.json().catch(() => null);
    const kind = body?.kind;
    const eventKey = typeof body?.eventKey === "string" ? body.eventKey.trim() : "";
    if (!isMembershipUsageKind(kind) || !eventKey || eventKey.length > 200) {
      return NextResponse.json(
        { ok: false, error: "A valid usage kind and event key are required." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const result = await consumeMembershipUsage(userId, getStripeMode(), kind, eventKey);
    return NextResponse.json(
      { ok: result.allowed, membership: result.tier, usage: result },
      { status: result.allowed ? 200 : 403, headers: noStoreHeaders },
    );
  } catch (error) {
    const status = error instanceof ClerkAuthenticationError ? 401 : 503;
    const message = error instanceof ClerkAuthenticationError ? error.message : "Usage could not be registered.";
    console.error("Membership usage registration failed.", error);
    return NextResponse.json({ ok: false, error: message }, { status, headers: noStoreHeaders });
  }
}
