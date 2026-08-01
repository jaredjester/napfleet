/**
 * In-memory rate limiter for development. Designed to swap for
 * Upstash Redis (`@upstash/ratelimit`) in production by implementing
 * the same interface.
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimitStore {
  increment(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult>;
}

class MemoryStore implements RateLimitStore {
  private hits = new Map<string, { count: number; resetAt: number }>();

  async increment(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.hits.get(key);

    // Clean expired entries
    if (entry && now > entry.resetAt) {
      this.hits.delete(key);
    }

    const current = this.hits.get(key);
    if (!current) {
      const resetAt = now + windowMs;
      this.hits.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    current.count++;
    if (current.count > maxRequests) {
      return { allowed: false, remaining: 0, resetAt: current.resetAt };
    }

    return { allowed: true, remaining: maxRequests - current.count, resetAt: current.resetAt };
  }

  // Cleanup stale entries periodically (call from a setInterval if needed)
  cleanup() {
    const now = Date.now();
    this.hits.forEach((entry, key) => {
      if (now > entry.resetAt) this.hits.delete(key);
    });
  }
}

const store = new MemoryStore();

// Periodically clean stale entries
if (typeof setInterval !== "undefined") {
  setInterval(() => store.cleanup(), 60_000);
}

/**
 * Apply rate limiting to a request.
 *
 * @param identifier - IP address or other unique identifier
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  return store.increment(`rl:${identifier}`, windowMs, maxRequests);
}

/**
 * Extract a rate-limit identifier from a Next.js request.
 * Falls back to IP, then to a random string in dev.
 */
export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";
  return `ip:${ip}`;
}

/** Pre-built limiters for common scenarios */
export const Limiters = {
  checkout: { maxRequests: 5, windowMs: 60_000 },
  orderStatus: { maxRequests: 30, windowMs: 60_000 },
  contact: { maxRequests: 3, windowMs: 60_000 },
  newsletter: { maxRequests: 5, windowMs: 60_000 },
  adminLogin: { maxRequests: 5, windowMs: 60_000 },
} as const;
