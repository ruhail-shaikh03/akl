import "server-only";
import { fromZonedTime } from "date-fns-tz";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { APP_TIMEZONE, todayKarachiDate } from "@/lib/time";

const DEFAULT_DAILY_BUDGET = 200_000;

function getDailyBudget(): number {
  const raw = process.env.DAILY_TOKEN_BUDGET;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_BUDGET;
}

/** Sum of assistant-message tokens used app-wide (both accounts) today, Asia/Karachi day boundary. */
export async function getTodayTokenUsage(): Promise<number> {
  const startOfDayUtc = fromZonedTime(`${todayKarachiDate()}T00:00:00`, APP_TIMEZONE);
  const [{ total }] = await db
    .select({ total: sql<number>`coalesce(sum(${chatMessages.tokensUsed}), 0)` })
    .from(chatMessages)
    .where(and(eq(chatMessages.role, "assistant"), gte(chatMessages.createdAt, startOfDayUtc)));
  return Number(total);
}

export async function isOverDailyBudget(): Promise<boolean> {
  const used = await getTodayTokenUsage();
  return used >= getDailyBudget();
}
