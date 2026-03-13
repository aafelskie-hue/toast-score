const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const HOURLY_LIMIT = 5;
const DAILY_LIMIT = 15;

const store = new Map<string, { timestamps: number[] }>();

export function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const entry = store.get(ip) ?? { timestamps: [] };

  // Prune entries older than 24h
  entry.timestamps = entry.timestamps.filter((t) => now - t < DAY_MS);

  const hourCount = entry.timestamps.filter((t) => now - t < HOUR_MS).length;
  if (hourCount >= HOURLY_LIMIT) {
    store.set(ip, entry);
    return {
      allowed: false,
      message: "Rate limit exceeded. Max 5 toasts per hour. Your bread needs to cool down.",
    };
  }

  if (entry.timestamps.length >= DAILY_LIMIT) {
    store.set(ip, entry);
    return {
      allowed: false,
      message: "Rate limit exceeded. Max 15 toasts per day. Even the best bakeries close eventually.",
    };
  }

  entry.timestamps.push(now);
  store.set(ip, entry);
  return { allowed: true };
}
