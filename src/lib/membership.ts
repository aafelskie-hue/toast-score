import { getStripe } from "./stripe";
import { getMemberCustomerId } from "./cookies";

interface MembershipStatus {
  isMember: boolean;
  customerId: string | null;
  currentPeriodEnd: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const cache = new Map<
  string,
  { status: MembershipStatus; expiresAt: number }
>();

export async function checkMembership(
  customerId: string
): Promise<MembershipStatus> {
  const now = Date.now();
  const cached = cache.get(customerId);
  if (cached && cached.expiresAt > now) {
    return cached.status;
  }

  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });

  const active = subscriptions.data.length > 0;
  let periodEnd: string | null = null;
  if (active) {
    const item = subscriptions.data[0].items.data[0];
    if (item?.current_period_end) {
      periodEnd = new Date(item.current_period_end * 1000).toISOString();
    }
  }

  const status: MembershipStatus = {
    isMember: active,
    customerId,
    currentPeriodEnd: periodEnd,
  };

  cache.set(customerId, { status, expiresAt: now + CACHE_TTL_MS });
  return status;
}

export function invalidateCache(customerId: string): void {
  cache.delete(customerId);
}

export async function getMembershipStatus(): Promise<MembershipStatus> {
  const customerId = await getMemberCustomerId();
  if (!customerId) {
    return { isMember: false, customerId: null, currentPeriodEnd: null };
  }
  return checkMembership(customerId);
}
