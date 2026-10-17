/**
 * Reusable in-memory sliding-window rate limiter.
 *
 * Edge-safe: uses only a module-level Map (no Node APIs), so it can be
 * imported from Middleware and from Node route handlers alike. For
 * multi-instance deployments use a shared store (e.g. Redis / KV) instead.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests per window. Defaults to 100. */
  limit?: number;
  /** Window size in milliseconds. Defaults to 60_000 (1 minute). */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Records one request for `key` and reports whether it is within budget.
 * Expired buckets are swept lazily on each call to bound memory growth.
 */
export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const limit = options.limit ?? 100;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  // Lazy sweep of expired buckets so the Map cannot grow without bound.
  for (const [k, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(k);
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/** Clears all buckets (used in tests). */
export function resetRateLimitForTesting(): void {
  buckets.clear();
}
