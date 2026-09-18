import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./upstash";

let limiters: {
  login: Ratelimit;
  chat: Ratelimit;
  chatBurst: Ratelimit;
  upload: Ratelimit;
  mutation: Ratelimit;
  testNotification: Ratelimit;
} | null = null;

/** Lazily constructed so builds/tests without Upstash env vars don't crash at import time. */
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
  return getLimiters().login.limit(`${ip}:${role}`);
}

export async function checkChatLimit(userId: string) {
  const [hourly, burst] = await Promise.all([
    getLimiters().chat.limit(userId),
    getLimiters().chatBurst.limit(userId),
  ]);
  return { success: hourly.success && burst.success };
}

export async function checkUploadLimit(userId: string) {
  return getLimiters().upload.limit(userId);
}

export async function checkMutationLimit(userId: string) {
  return getLimiters().mutation.limit(userId);
}

export async function checkTestNotificationLimit(userId: string) {
  return getLimiters().testNotification.limit(userId);
}
