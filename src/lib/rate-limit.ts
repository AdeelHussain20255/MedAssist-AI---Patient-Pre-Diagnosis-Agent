/**
2:  * Rate Limiting — Distributed implementation for Production (Vercel/Edge)
3:  * Uses @upstash/ratelimit backed by Redis for persistence across cold starts.
4:  */
5: 
6: import { Ratelimit } from "@upstash/ratelimit";
7: import { Redis } from "@upstash/redis";
8: 
9: // Create Redis instance
10: const redis = new Redis({
11:   url: process.env.UPSTASH_REDIS_REST_URL!,
12:   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
13: });
14: 
15: export interface RateLimitConfig {
16:   limit: number;
17:   window: string; // e.g. "60s", "1h", "1d"
18: }
19: 
20: /** Rate limit presets */
21: export const RATE_LIMITS = {
22:   AUTH: { limit: 5, window: "900s" },       // 5 req / 15 min
23:   GENERAL: { limit: 60, window: "60s" },    // 60 req / 1 min
24:   CHAT_MESSAGES: { limit: 20, window: "60s" }, // 20 msgs / 1 min
25:   CHAT_SESSIONS: { limit: 5, window: "3600s" }, // 5 sessions / 1 hour
26:   EMERGENCY_ALERTS: { limit: 3, window: "86400s" }, // 3 alerts / 1 day
27:   CRON: { limit: 1, window: "60s" },        // 1 req / 1 min
28: } as const;
29: 
30: /**
31:  * Check if request is within rate limit using Upstash Redis.
32:  * 
33:  * @param identifier - Unique identifier (IP, userId, etc.)
34:  * @param config - Rate limit configuration
35:  * @returns Object with success boolean and remaining count
36:  */
37: export async function checkRateLimit(
38:   identifier: string,
39:   config: RateLimitConfig
40: ): Promise<{ success: boolean; remaining: number; retryAfter: number }> {
41:   // Fallback to in-memory if Redis env vars are missing (development only)
42:   if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
43:     console.warn("UPSTASH_REDIS_REST_URL missing. Using mock rate limiter.");
44:     return { success: true, remaining: 999, retryAfter: 0 };
45:   }
46: 
47:   const ratelimit = new Ratelimit({
48:     redis,
49:     limiter: Ratelimit.slidingWindow(config.limit, config.window as any),
50:     analytics: true,
51:     prefix: "@medassist/ratelimit",
52:   });
53: 
54:   const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
55:   const now = Date.now();
56:   const retryAfter = Math.ceil((reset - now) / 1000);
57: 
58:   return { success, remaining, retryAfter };
59: }
60: 
61: /**
62:  * Helper to get client IP from request headers
63:  */
64: export function getClientIP(request: Request): string {
65:   const forwarded = request.headers.get('x-forwarded-for');
66:   if (forwarded) {
67:     return forwarded.split(',')[0].trim();
68:   }
69:   const realIP = request.headers.get('x-real-ip');
70:   if (realIP) return realIP;
71:   return '127.0.0.1';
72: }
