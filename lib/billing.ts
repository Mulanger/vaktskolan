export const MEMBERSHIP_TIERS = ["basic", "premium"] as const;
export type MembershipTier = (typeof MEMBERSHIP_TIERS)[number];

export const MEMBERSHIP_USAGE_KINDS = ["vu1_question", "scenario_question", "flashcard_flip"] as const;
export type MembershipUsageKind = (typeof MEMBERSHIP_USAGE_KINDS)[number];

export const BASIC_USAGE_LIMITS: Record<MembershipUsageKind, number> = {
  vu1_question: 10,
  scenario_question: 10,
  flashcard_flip: 10,
};

export function hasPremiumAccess(tier: string | null | undefined) {
  return tier === "premium";
}

export function isMembershipUsageKind(value: unknown): value is MembershipUsageKind {
  return typeof value === "string" && MEMBERSHIP_USAGE_KINDS.includes(value as MembershipUsageKind);
}

export function isLiveStripeKey(key: string) {
  return /^(?:sk|rk)_live_/.test(key);
}
