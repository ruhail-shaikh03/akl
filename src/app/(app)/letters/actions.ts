"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { letters } from "@/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { notify } from "@/lib/notify/notify";

export async function getLetters() {
  await requireSession();
  return db.select().from(letters).where(isNull(letters.deletedAt)).orderBy(letters.createdAt);
}

export async function getLetter(id: string) {
  await requireSession();
  const [letter] = await db
    .select()
    .from(letters)
    .where(and(eq(letters.id, id), isNull(letters.deletedAt)))
    .limit(1);
  return letter ?? null;
}

export async function openLetter(id: string) {
  await requireSession();

  // Only the first open sets openedAt and fires the notification — a
  // conditional update makes this safe against double-invocation/races.
  const updated = await db
    .update(letters)
    .set({ openedAt: sql`now()` })
    .where(and(eq(letters.id, id), isNull(letters.openedAt)))
    .returning({ title: letters.title });

  if (updated.length > 0) {
    await notify({ type: "letter.opened", priority: "normal", data: { letterTitle: updated[0].title } });
  }

  revalidatePath(`/letters/${id}`);
  revalidatePath("/letters");
}
