/**
 * Rate Limiting — Distributed implementation for Production (Vercel/Edge)
 * Uses @upstash/ratelimit backed by Redis for persistence across cold starts.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis instance
let redisInstance: Redis | null = null;
function getRedis() {
  if (!redisInstance && process.env.UPSTASH_REDIS_REST_URL) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisInstance;
}

export interface RateLimitConfig {
  limit: number;
  window: string; // e.g. "60s", "1h", "1d"
}

/** Rate limit presets */
export const RATE_LIMITS = {
  AUTH: { limit: 5, window: "900s" },       // 5 req / 15 min
  GENERAL: { limit: 60, window: "60s" },    // 60 req / 1 min
  CHAT_MESSAGES: { limit: 20, window: "60s" }, // 20 msgs / 1 min
  CHAT_SESSIONS: { limit: 5, window: "3600s" }, // 5 sessions / 1 hour
  EMERGENCY_ALERTS: { limit: 3, window: "86400s" }, // 3 alerts / 1 day
  CRON: { limit: 1, window: "60s" },        // 1 req / 1 min
} as const;

/**
 * Check if request is within rate limit using Upstash Redis.
 * 
 * @param identifier - Unique identifier (IP, userId, etc.)
 * @param config - Rate limit configuration
 * @returns Object with success boolean and remaining count
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; retryAfter: number }> {
  // Fallback to in-memory if Redis env vars are missing (development only)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("UPSTASH_REDIS_REST_URL missing. Using mock rate limiter.");
    return { success: true, remaining: 999, retryAfter: 0 };
  }

    const redis = getRedis();
    if (!redis) {
      console.warn("Redis not configured. Skipping rate limit.");
      return { success: true, remaining: 999, retryAfter: 0 };
    }
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, config.window as any),
      analytics: true,
      prefix: "@medassist/ratelimit",
    });

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  const now = Date.now();
  const retryAfter = Math.ceil((reset - now) / 1000);

  return { success, remaining, retryAfter };
}

/**
 * Helper to get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return '127.0.0.1';
}
