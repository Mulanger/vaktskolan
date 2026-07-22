import "server-only";
import { createClerkClient } from "@clerk/backend";
import type { MembershipTier } from "@/lib/billing";

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) throw new Error("CLERK_SECRET_KEY is required to synchronize membership metadata.");
  if (!clerkClient) clerkClient = createClerkClient({ secretKey });
  return clerkClient;
}

export async function syncClerkMembership(
  userId: string,
  tier: MembershipTier,
  stripe: {
    customerId?: string | null;
    paymentIntentId?: string | null;
    grantedAt?: string | null;
  } = {},
) {
  const premium = tier === "premium";
  await getClerkClient().users.updateUserMetadata(userId, {
    publicMetadata: {
      membershipTier: tier,
      premiumAccess: premium,
    },
    privateMetadata: {
      stripeCustomerId: stripe.customerId || null,
      stripePaymentIntentId: stripe.paymentIntentId || null,
      premiumGrantedAt: premium ? stripe.grantedAt || new Date().toISOString() : null,
    },
  });
}
