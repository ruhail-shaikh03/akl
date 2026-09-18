"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { reasons } from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { createReasonSchema, updateReasonSchema } from "@/lib/validations/reasons.schema";

export async function getAdminReasons() {
  await requireRole(["admin"]);
  return db.select().from(reasons).where(isNull(reasons.deletedAt)).orderBy(desc(reasons.createdAt));
}

export async function getAdminReason(id: string) {
  await requireRole(["admin"]);
  const [reason] = await db
    .select()
    .from(reasons)
    .where(and(eq(reasons.id, id), isNull(reasons.deletedAt)))
    .limit(1);
  return reason ?? null;
}

export async function createReason(input: unknown) {
  await requireRole(["admin"]);
  const data = createReasonSchema.parse(input);
  await db.insert(reasons).values({ text: data.text, imageUrl: data.imageUrl });
  revalidatePath("/admin/reasons");
  revalidatePath("/reasons");
}

export async function updateReason(input: unknown) {
  await requireRole(["admin"]);
  const { id, ...patch } = updateReasonSchema.parse(input);
  await db.update(reasons).set(patch).where(eq(reasons.id, id));
  revalidatePath("/admin/reasons");
  revalidatePath("/reasons");
}

export async function deleteReason(id: string) {
  await requireRole(["admin"]);
  await db.update(reasons).set({ deletedAt: new Date(), isActive: false }).where(eq(reasons.id, id));
  revalidatePath("/admin/reasons");
  revalidatePath("/reasons");
}
