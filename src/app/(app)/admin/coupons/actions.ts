"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { coupons, redemptions, users } from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import {
  createCouponSchema,
  fulfillRedemptionSchema,
  updateCouponSchema,
} from "@/lib/validations/coupons.schema";

export async function getAdminCoupons() {
  await requireRole(["admin"]);
  return db.select().from(coupons).where(isNull(coupons.deletedAt)).orderBy(desc(coupons.createdAt));
}

export async function getAdminCoupon(id: string) {
  await requireRole(["admin"]);
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.id, id), isNull(coupons.deletedAt)))
    .limit(1);
  return coupon ?? null;
}

export async function createCoupon(input: unknown) {
  const session = await requireRole(["admin"]);
  const data = createCouponSchema.parse(input);

  await db.insert(coupons).values({
    title: data.title,
    description: data.description,
    emoji: data.emoji,
    usageType: data.usageType,
    maxUses: data.usageType === "multi" ? data.maxUses : undefined,
    expiryAt: data.expiryAt ? new Date(data.expiryAt) : undefined,
    createdBy: session.sub,
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
}

export async function updateCoupon(input: unknown) {
  await requireRole(["admin"]);
  const { id, ...patch } = updateCouponSchema.parse(input);

  await db
    .update(coupons)
    .set({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}),
      ...(patch.usageType !== undefined ? { usageType: patch.usageType } : {}),
      ...(patch.maxUses !== undefined ? { maxUses: patch.maxUses } : {}),
      ...(patch.expiryAt !== undefined ? { expiryAt: patch.expiryAt ? new Date(patch.expiryAt) : null } : {}),
    })
    .where(eq(coupons.id, id));

  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
}

export async function deleteCoupon(id: string) {
  await requireRole(["admin"]);
  await db.update(coupons).set({ deletedAt: new Date() }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
}

export async function reissueCoupon(id: string) {
  await requireRole(["admin"]);
  await db
    .update(coupons)
    .set({ status: "locked", usesCount: 0, revealedAt: null })
    .where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
}

export async function getRedemptions() {
  await requireRole(["admin"]);
  return db
    .select({
      id: redemptions.id,
      couponId: redemptions.couponId,
      couponTitle: coupons.title,
      couponEmoji: coupons.emoji,
      redeemedByName: users.displayName,
      redeemedAt: redemptions.redeemedAt,
      note: redemptions.note,
      fulfilledAt: redemptions.fulfilledAt,
      adminResponseNote: redemptions.adminResponseNote,
    })
    .from(redemptions)
    .innerJoin(coupons, eq(coupons.id, redemptions.couponId))
    .innerJoin(users, eq(users.id, redemptions.redeemedBy))
    .orderBy(desc(redemptions.redeemedAt));
}

export async function fulfillRedemption(input: unknown) {
  await requireRole(["admin"]);
  const { redemptionId, adminResponseNote } = fulfillRedemptionSchema.parse(input);

  await db
    .update(redemptions)
    .set({ fulfilledAt: new Date(), adminResponseNote })
    .where(eq(redemptions.id, redemptionId));

  revalidatePath("/admin/coupons/redemptions");
}
