import "server-only";
import {
  BASIC_USAGE_LIMITS,
  type MembershipTier,
  type MembershipUsageKind,
} from "@/lib/billing";

export type BillingCustomer = {
  user_id: string;
  stripe_customer_id: string;
  livemode: boolean;
  created_at: string;
  updated_at: string;
};

export type MembershipEntitlement = {
  user_id: string;
  livemode: boolean;
  tier: MembershipTier;
  source: "basic" | "stripe" | "manual";
  granted_at: string;
  revoked_at: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingPurchase = {
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  user_id: string;
  stripe_customer_id: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: "pending" | "paid" | "failed" | "expired" | "refunded" | "disputed";
  livemode: boolean;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MembershipUsageResult = {
  allowed: boolean;
  tier: MembershipTier;
  used: number;
  limit: number | null;
  remaining: number | null;
};

type StripeEventRow = {
  stripe_event_id: string;
  processed_at: string | null;
};

function getSupabaseConfiguration() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for membership storage.");
  return { url, key };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const { url, key } = getSupabaseConfiguration();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Membership storage request failed (${response.status}): ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function queryValue(value: string) {
  return encodeURIComponent(value);
}

export async function getBillingCustomer(userId: string, livemode: boolean) {
  const rows = await supabaseRequest<BillingCustomer[]>(
    `billing_customers?user_id=eq.${queryValue(userId)}&livemode=eq.${livemode}&select=*&limit=1`,
  );
  return rows[0] || null;
}

export async function upsertBillingCustomer(row: Pick<BillingCustomer, "user_id" | "stripe_customer_id" | "livemode">) {
  await supabaseRequest("billing_customers?on_conflict=user_id%2Clivemode", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
}

export async function getMembershipEntitlement(userId: string, livemode: boolean) {
  const rows = await supabaseRequest<MembershipEntitlement[]>(
    `membership_entitlements?user_id=eq.${queryValue(userId)}&livemode=eq.${livemode}&select=*&limit=1`,
  );
  return rows[0] || null;
}

export async function ensureMembershipEntitlement(userId: string, livemode: boolean) {
  await supabaseRequest("membership_entitlements?on_conflict=user_id%2Clivemode", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: userId, livemode, tier: "basic", source: "basic" }),
  });
  const entitlement = await getMembershipEntitlement(userId, livemode);
  if (!entitlement) throw new Error("Membership entitlement could not be created.");
  return entitlement;
}

export async function getMembershipSnapshot(userId: string, livemode: boolean) {
  const [entitlement, events] = await Promise.all([
    ensureMembershipEntitlement(userId, livemode),
    supabaseRequest<Array<{ usage_kind: MembershipUsageKind }>>(
      `membership_usage_events?user_id=eq.${queryValue(userId)}&livemode=eq.${livemode}&select=usage_kind`,
    ),
  ]);
  const counts: Record<MembershipUsageKind, number> = {
    vu1_question: 0,
    scenario_question: 0,
    flashcard_flip: 0,
  };
  events.forEach((event) => {
    if (event.usage_kind in counts) counts[event.usage_kind] += 1;
  });

  return {
    entitlement,
    usage: Object.fromEntries(
      Object.entries(BASIC_USAGE_LIMITS).map(([kind, limit]) => {
        const used = counts[kind as MembershipUsageKind];
        return [kind, { used, limit, remaining: Math.max(0, limit - used) }];
      }),
    ) as Record<MembershipUsageKind, { used: number; limit: number; remaining: number }>,
  };
}

export async function consumeMembershipUsage(
  userId: string,
  livemode: boolean,
  usageKind: MembershipUsageKind,
  eventKey: string,
) {
  const rows = await supabaseRequest<MembershipUsageResult[]>("rpc/consume_membership_usage", {
    method: "POST",
    body: JSON.stringify({
      p_user_id: userId,
      p_livemode: livemode,
      p_usage_kind: usageKind,
      p_event_key: eventKey,
    }),
  });
  const result = rows[0];
  if (!result) throw new Error("Membership usage result is missing.");
  return result;
}

export async function upsertBillingPurchase(
  row: Omit<BillingPurchase, "created_at" | "updated_at">,
) {
  await supabaseRequest("billing_purchases?on_conflict=stripe_checkout_session_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
}

export async function updateBillingPurchase(
  checkoutSessionId: string,
  updates: Partial<Pick<BillingPurchase, "payment_status" | "purchased_at" | "stripe_payment_intent_id">>,
) {
  await supabaseRequest(`billing_purchases?stripe_checkout_session_id=eq.${queryValue(checkoutSessionId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(updates),
  });
}

export async function getBillingPurchaseByPaymentIntent(paymentIntentId: string, livemode: boolean) {
  const rows = await supabaseRequest<BillingPurchase[]>(
    `billing_purchases?stripe_payment_intent_id=eq.${queryValue(paymentIntentId)}&livemode=eq.${livemode}&select=*&limit=1`,
  );
  return rows[0] || null;
}

export async function hasAnotherPaidPurchase(userId: string, livemode: boolean, excludedSessionId: string) {
  const rows = await supabaseRequest<Array<{ stripe_checkout_session_id: string }>>(
    `billing_purchases?user_id=eq.${queryValue(userId)}&livemode=eq.${livemode}&payment_status=eq.paid&stripe_checkout_session_id=neq.${queryValue(excludedSessionId)}&select=stripe_checkout_session_id&limit=1`,
  );
  return Boolean(rows[0]);
}

export async function grantPremiumEntitlement(
  userId: string,
  livemode: boolean,
  checkoutSessionId: string,
  paymentIntentId: string,
) {
  await supabaseRequest("membership_entitlements?on_conflict=user_id%2Clivemode", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      livemode,
      tier: "premium",
      source: "stripe",
      granted_at: new Date().toISOString(),
      revoked_at: null,
      stripe_checkout_session_id: checkoutSessionId,
      stripe_payment_intent_id: paymentIntentId,
    }),
  });
}

export async function revokePremiumEntitlement(userId: string, livemode: boolean) {
  await supabaseRequest(
    `membership_entitlements?user_id=eq.${queryValue(userId)}&livemode=eq.${livemode}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        tier: "basic",
        source: "basic",
        revoked_at: new Date().toISOString(),
        stripe_checkout_session_id: null,
        stripe_payment_intent_id: null,
      }),
    },
  );
}

export async function beginStripeEvent(eventId: string, eventType: string, livemode: boolean) {
  const existing = await supabaseRequest<StripeEventRow[]>(
    `stripe_webhook_events?stripe_event_id=eq.${queryValue(eventId)}&select=stripe_event_id,processed_at&limit=1`,
  );
  if (existing[0]?.processed_at) return false;

  await supabaseRequest("stripe_webhook_events?on_conflict=stripe_event_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ stripe_event_id: eventId, event_type: eventType, livemode }),
  });
  return true;
}

export async function completeStripeEvent(eventId: string) {
  await supabaseRequest(`stripe_webhook_events?stripe_event_id=eq.${queryValue(eventId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ processed_at: new Date().toISOString(), last_error: null }),
  });
}

export async function failStripeEvent(eventId: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown webhook processing error.";
  await supabaseRequest(`stripe_webhook_events?stripe_event_id=eq.${queryValue(eventId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ last_error: message.slice(0, 1000) }),
  });
}
