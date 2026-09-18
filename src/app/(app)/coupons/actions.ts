"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { coupons, redemptions } from "@/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { checkMutationLimit } from "@/lib/ratelimit/limiters";
import { notify } from "@/lib/notify/notify";
import { redeemCouponSchema } from "@/lib/validations/coupons.schema";

class RateLimitedError extends Error {
  constructor() {
    super("Too many requests. Try again in a bit.");
  }
}

async function assertMutationAllowed(userId: string) {
  const { success } = await checkMutationLimit(userId);
  if (!success) throw new RateLimitedError();
}

export async function getCoupons() {
  await requireSession();
  return db.select().from(coupons).where(isNull(coupons.deletedAt)).orderBy(coupons.createdAt);
}

export async function scratchCoupon(id: string) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);

  await db
    .update(coupons)
    .set({ status: "revealed", revealedAt: new Date() })
    .where(and(eq(coupons.id, id), eq(coupons.status, "locked")));

  revalidatePath("/coupons");
}

function isRedeemable(coupon: typeof coupons.$inferSelect): boolean {
  if (coupon.status === "locked") return false;
  if (coupon.expiryAt && new Date(coupon.expiryAt) < new Date()) return false;
  if (coupon.usageType === "single") return coupon.status !== "redeemed";
  // multi-use: redeemable unless a max was set and it's been reached
  return coupon.maxUses === null || coupon.usesCount < coupon.maxUses;
}

export async function redeemCoupon(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const { id, note } = redeemCouponSchema.parse(input);

  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  if (!coupon) throw new Error("Coupon not found");
  if (!isRedeemable(coupon)) throw new Error("This coupon can't be redeemed right now");

  await db.insert(redemptions).values({ couponId: id, redeemedBy: session.sub, note });

  const newUsesCount = coupon.usesCount + 1;
  const exhausted =
    coupon.usageType === "single" || (coupon.maxUses !== null && newUsesCount >= coupon.maxUses);

  await db
    .update(coupons)
    .set({ usesCount: newUsesCount, status: exhausted ? "redeemed" : "revealed" })
    .where(eq(coupons.id, id));

  await notify({ type: "coupon.redeemed", priority: "normal", data: { couponTitle: coupon.title, note } });

  revalidatePath("/coupons");
}
