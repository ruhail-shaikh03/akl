"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { moodCheckins, users } from "@/db/schema";
import { requireRole, requireSession } from "@/lib/auth/guards";
import { checkMutationLimit } from "@/lib/ratelimit/limiters";
import { notify } from "@/lib/notify/notify";
import { todayKarachiDate } from "@/lib/time";
import { submitMoodCheckinSchema } from "@/lib/validations/mood.schema";

class RateLimitedError extends Error {
  constructor() {
    super("Too many requests. Try again in a bit.");
  }
}

export async function getTodaysCheckin() {
  const session = await requireSession();
  const today = todayKarachiDate();
  const [checkin] = await db
    .select()
    .from(moodCheckins)
    .where(and(eq(moodCheckins.userId, session.sub), eq(moodCheckins.checkinDate, today)))
    .limit(1);
  return checkin ?? null;
}

export async function submitMoodCheckin(input: unknown) {
  const session = await requireSession();
  const { success } = await checkMutationLimit(session.sub);
  if (!success) throw new RateLimitedError();

  const { level, note } = submitMoodCheckinSchema.parse(input);
  const today = todayKarachiDate();

  await db
    .insert(moodCheckins)
    .values({ userId: session.sub, moodLevel: level, note, checkinDate: today })
    .onConflictDoUpdate({
      target: [moodCheckins.userId, moodCheckins.checkinDate],
      set: { moodLevel: level, note },
    });

  await notify({
    type: "mood.checkin",
    priority: level <= 2 ? "high" : "normal",
    data: { moodLevel: level, note },
  });

  revalidatePath("/mood");
  revalidatePath("/mood/history");
  revalidatePath("/");
  revalidatePath("/admin/mood");

  return { level };
}

/** The current user's own history (whoever is logged in). */
export async function getMyMoodHistory(days = 90) {
  const session = await requireSession();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDate = since.toISOString().slice(0, 10);

  return db
    .select()
    .from(moodCheckins)
    .where(and(eq(moodCheckins.userId, session.sub), gte(moodCheckins.checkinDate, sinceDate)))
    .orderBy(moodCheckins.checkinDate);
}

/** Admin-only: the partner's history, for the admin/mood dashboard. */
export async function getPartnerMoodHistory(days = 90) {
  await requireRole(["admin"]);
  const [partner] = await db.select().from(users).where(eq(users.role, "partner")).limit(1);
  if (!partner) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDate = since.toISOString().slice(0, 10);

  return db
    .select()
    .from(moodCheckins)
    .where(and(eq(moodCheckins.userId, partner.id), gte(moodCheckins.checkinDate, sinceDate)))
    .orderBy(moodCheckins.checkinDate);
}
