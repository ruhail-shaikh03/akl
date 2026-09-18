import type { coupons } from "@/db/schema";

export type Coupon = typeof coupons.$inferSelect;
