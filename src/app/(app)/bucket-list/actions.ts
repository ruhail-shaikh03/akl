"use server";

import { revalidatePath } from "next/cache";
import { aliasedTable, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { bucketListItems, users } from "@/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { checkMutationLimit } from "@/lib/ratelimit/limiters";
import { notify } from "@/lib/notify/notify";
import {
  createBucketItemSchema,
  toggleCompleteSchema,
  updateBucketItemSchema,
} from "@/lib/validations/bucketList.schema";

class RateLimitedError extends Error {
  constructor() {
    super("Too many requests. Try again in a bit.");
  }
}

async function assertMutationAllowed(userId: string) {
  const { success } = await checkMutationLimit(userId);
  if (!success) throw new RateLimitedError();
}

export async function getBucketItems() {
  await requireSession();
  const addedByUser = aliasedTable(users, "added_by_user");
  const completedByUser = aliasedTable(users, "completed_by_user");

  return db
    .select({
      id: bucketListItems.id,
      title: bucketListItems.title,
      description: bucketListItems.description,
      category: bucketListItems.category,
      targetDate: bucketListItems.targetDate,
      completionPhotoBlobUrl: bucketListItems.completionPhotoBlobUrl,
      completedAt: bucketListItems.completedAt,
      createdAt: bucketListItems.createdAt,
      addedByName: addedByUser.displayName,
      completedByName: completedByUser.displayName,
    })
    .from(bucketListItems)
    .leftJoin(addedByUser, eq(addedByUser.id, bucketListItems.addedBy))
    .leftJoin(completedByUser, eq(completedByUser.id, bucketListItems.completedBy))
    .where(isNull(bucketListItems.deletedAt))
    .orderBy(desc(bucketListItems.createdAt));
}

export async function createBucketItem(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const data = createBucketItemSchema.parse(input);

  await db.insert(bucketListItems).values({ ...data, addedBy: session.sub });
  revalidatePath("/bucket-list");
}

export async function updateBucketItem(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const { id, ...patch } = updateBucketItemSchema.parse(input);

  await db
    .update(bucketListItems)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(bucketListItems.id, id));
  revalidatePath("/bucket-list");
}

export async function deleteBucketItem(id: string) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  await db.update(bucketListItems).set({ deletedAt: new Date() }).where(eq(bucketListItems.id, id));
  revalidatePath("/bucket-list");
}

export async function toggleCompleteBucketItem(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const { id, completionPhotoBlobUrl } = toggleCompleteSchema.parse(input);

  const [item] = await db.select().from(bucketListItems).where(eq(bucketListItems.id, id)).limit(1);
  if (!item) throw new Error("Item not found");

  if (item.completedAt) {
    // uncheck
    await db
      .update(bucketListItems)
      .set({ completedAt: null, completedBy: null, completionPhotoBlobUrl: null, updatedAt: new Date() })
      .where(eq(bucketListItems.id, id));
    revalidatePath("/bucket-list");
    return { completed: false };
  }

  await db
    .update(bucketListItems)
    .set({
      completedAt: new Date(),
      completedBy: session.sub,
      completionPhotoBlobUrl,
      updatedAt: new Date(),
    })
    .where(eq(bucketListItems.id, id));

  await notify({
    type: "bucketlist.completed",
    priority: "normal",
    data: { itemTitle: item.title, completedBy: session.name },
  });

  revalidatePath("/bucket-list");
  return { completed: true };
}

export async function attachCompletionPhoto(id: string, completionPhotoBlobUrl: string) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  await db.update(bucketListItems).set({ completionPhotoBlobUrl }).where(eq(bucketListItems.id, id));
  revalidatePath("/bucket-list");
}
