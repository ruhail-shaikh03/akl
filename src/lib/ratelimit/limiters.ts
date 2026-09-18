import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis, isRedisConfigured } from "./upstash";

let limiters: {
  login: Ratelimit;
  chat: Ratelimit;
  chatBurst: Ratelimit;
  upload: Ratelimit;
  mutation: Ratelimit;
  testNotification: Ratelimit;
} | null = null;

let warnedOnce = false;

/** Without Upstash configured (e.g. local dev), rate limiting no-ops and every check passes. */
function rateLimitingDisabled(): boolean {
  if (!isRedisConfigured()) {
    if (!warnedOnce) {
      console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — rate limiting is disabled.",
      );
      warnedOnce = true;
    }
    return true;
  }
  return false;
}

function getLimiters() {
  if (!limiters) {
    const redis = getRedis();
    limiters = {
      login: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:login",
      }),
      chat: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        prefix: "rl:chat",
      }),
      chatBurst: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "rl:chat-burst",
      }),
      upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 h"),
        prefix: "rl:upload",
      }),
      mutation: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 h"),
        prefix: "rl:mutation",
      }),
      testNotification: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        prefix: "rl:test-notify",
      }),
    };
  }
  return limiters;
}

export async function checkLoginLimit(ip: string, role: string) {
  if (rateLimitingDisabled()) return { success: true };
  return getLimiters().login.limit(`${ip}:${role}`);
}

export async function checkChatLimit(userId: string) {
  if (rateLimitingDisabled()) return { success: true };
  const [hourly, burst] = await Promise.all([
    getLimiters().chat.limit(userId),
    getLimiters().chatBurst.limit(userId),
  ]);
  return { success: hourly.success && burst.success };
}

export async function checkUploadLimit(userId: string) {
  if (rateLimitingDisabled()) return { success: true };
  return getLimiters().upload.limit(userId);
}

export async function checkMutationLimit(userId: string) {
  if (rateLimitingDisabled()) return { success: true };
  return getLimiters().mutation.limit(userId);
}

export async function checkTestNotificationLimit(userId: string) {
  if (rateLimitingDisabled()) return { success: true };
  return getLimiters().testNotification.limit(userId);
}
