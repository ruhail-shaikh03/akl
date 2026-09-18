import { z } from "zod";

export const createCouponSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  emoji: z.string().trim().min(1).max(8).default("🎁"),
  usageType: z.enum(["single", "multi"]),
  maxUses: z.number().int().positive().optional(),
  expiryAt: z.string().datetime().optional(),
});
export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  emoji: z.string().trim().min(1).max(8).optional(),
  usageType: z.enum(["single", "multi"]).optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiryAt: z.string().datetime().nullable().optional(),
});
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export const redeemCouponSchema = z.object({
  id: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});
export type RedeemCouponInput = z.infer<typeof redeemCouponSchema>;

export const fulfillRedemptionSchema = z.object({
  redemptionId: z.string().uuid(),
  adminResponseNote: z.string().trim().max(500).optional(),
});
export type FulfillRedemptionInput = z.infer<typeof fulfillRedemptionSchema>;
