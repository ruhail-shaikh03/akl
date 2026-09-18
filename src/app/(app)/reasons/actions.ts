"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { reasonCycles, reasonFavorites, reasonViews, reasons } from "@/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { checkMutationLimit } from "@/lib/ratelimit/limiters";

class RateLimitedError extends Error {
  constructor() {
    super("Too many requests. Try again in a bit.");
  }
}

async function assertMutationAllowed(userId: string) {
  const { success } = await checkMutationLimit(userId);
  if (!success) throw new RateLimitedError();
}

export async function getReasonsOverview() {
  const session = await requireSession();
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(reasons)
    .where(and(eq(reasons.isActive, true), isNull(reasons.deletedAt)));
  const [{ favoriteCount }] = await db
    .select({ favoriteCount: sql<number>`count(*)` })
    .from(reasonFavorites)
    .where(eq(reasonFavorites.userId, session.sub));
  return { total: Number(total), favoriteCount: Number(favoriteCount) };
}

export async function drawReason() {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);

  const activeReasons = await db
    .select()
    .from(reasons)
    .where(and(eq(reasons.isActive, true), isNull(reasons.deletedAt)));

  if (activeReasons.length === 0) {
    return { reason: null as null, seenCount: 0, totalCount: 0, newCycleStarted: false, favorited: false };
  }

  let [currentCycle] = await db
    .select()
    .from(reasonCycles)
    .where(eq(reasonCycles.userId, session.sub))
    .orderBy(desc(reasonCycles.cycleNumber))
    .limit(1);

  let newCycleStarted = false;
  if (!currentCycle) {
    [currentCycle] = await db.insert(reasonCycles).values({ userId: session.sub, cycleNumber: 1 }).returning();
  }

  const viewed = await db
    .select({ reasonId: reasonViews.reasonId })
    .from(reasonViews)
    .where(eq(reasonViews.cycleId, currentCycle.id));
  const viewedIds = new Set(viewed.map((v) => v.reasonId));
  let unseen = activeReasons.filter((r) => !viewedIds.has(r.id));

  if (unseen.length === 0) {
    [currentCycle] = await db
      .insert(reasonCycles)
      .values({ userId: session.sub, cycleNumber: currentCycle.cycleNumber + 1 })
      .returning();
    unseen = activeReasons;
    newCycleStarted = true;
  }

  const picked = unseen[Math.floor(Math.random() * unseen.length)];
  await db
    .insert(reasonViews)
    .values({ cycleId: currentCycle.id, reasonId: picked.id })
    .onConflictDoNothing();

  const [{ seenCount }] = await db
    .select({ seenCount: sql<number>`count(*)` })
    .from(reasonViews)
    .where(eq(reasonViews.cycleId, currentCycle.id));

  const [favorite] = await db
    .select()
    .from(reasonFavorites)
    .where(and(eq(reasonFavorites.userId, session.sub), eq(reasonFavorites.reasonId, picked.id)))
    .limit(1);

  return {
    reason: { id: picked.id, text: picked.text, imageUrl: picked.imageUrl },
    seenCount: Number(seenCount),
    totalCount: activeReasons.length,
    newCycleStarted,
    favorited: Boolean(favorite),
  };
}

export async function toggleFavoriteReason(reasonId: string) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);

  const [existing] = await db
    .select()
    .from(reasonFavorites)
    .where(and(eq(reasonFavorites.userId, session.sub), eq(reasonFavorites.reasonId, reasonId)))
    .limit(1);

  if (existing) {
    await db
      .delete(reasonFavorites)
      .where(and(eq(reasonFavorites.userId, session.sub), eq(reasonFavorites.reasonId, reasonId)));
  } else {
    await db.insert(reasonFavorites).values({ userId: session.sub, reasonId }).onConflictDoNothing();
  }

  revalidatePath("/reasons/favorites");
  return { favorited: !existing };
}

export async function getFavoriteReasons() {
  const session = await requireSession();
  return db
    .select({
      id: reasons.id,
      text: reasons.text,
      imageUrl: reasons.imageUrl,
      favoritedAt: reasonFavorites.favoritedAt,
    })
    .from(reasonFavorites)
    .innerJoin(reasons, eq(reasons.id, reasonFavorites.reasonId))
    .where(eq(reasonFavorites.userId, session.sub))
    .orderBy(desc(reasonFavorites.favoritedAt));
}
