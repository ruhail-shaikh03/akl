"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatConversations, chatMessages, galleryPhotos } from "@/db/schema";
import { requireSession } from "@/lib/auth/guards";

export async function getOrCreateActiveConversation() {
  const session = await requireSession();

  const [existing] = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.userId, session.sub), eq(chatConversations.archived, false)))
    .orderBy(desc(chatConversations.lastMessageAt))
    .limit(1);
  if (existing) return existing;

  const [created] = await db.insert(chatConversations).values({ userId: session.sub }).returning();
  return created;
}

export async function startNewConversation() {
  const session = await requireSession();

  await db
    .update(chatConversations)
    .set({ archived: true })
    .where(and(eq(chatConversations.userId, session.sub), eq(chatConversations.archived, false)));

  const [created] = await db.insert(chatConversations).values({ userId: session.sub }).returning();
  revalidatePath("/chat");
  return created;
}

export async function getConversationMessages(conversationId: string) {
  const session = await requireSession();

  const [conversation] = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, session.sub)))
    .limit(1);
  if (!conversation) throw new Error("Conversation not found");

  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt));
}

export async function getRandomMemory() {
  await requireSession();

  const [photo] = await db
    .select()
    .from(galleryPhotos)
    .where(isNull(galleryPhotos.deletedAt))
    .orderBy(sql`random()`)
    .limit(1);

  if (!photo) return null;
  return { blobUrl: photo.blobUrl, caption: photo.caption, takenAt: photo.takenAt };
}
