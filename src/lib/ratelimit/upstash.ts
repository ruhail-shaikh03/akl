import "server-only";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

/** Lazily constructed so builds/tests without Upstash env vars don't crash at import time. */
export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set");
    }
    redis = new Redis({ url, token });
  }
  return redis;
}
