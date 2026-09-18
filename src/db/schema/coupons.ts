import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const couponStatusEnum = pgEnum("coupon_status", ["locked", "revealed", "redeemed"]);
export const usageTypeEnum = pgEnum("usage_type", ["single", "multi"]);

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  emoji: text("emoji").notNull().default("🎁"),
  usageType: usageTypeEnum("usage_type").notNull().default("single"),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").notNull().default(0),
  expiryAt: timestamp("expiry_at", { withTimezone: true }),
  status: couponStatusEnum("status").notNull().default("locked"),
  revealedAt: timestamp("revealed_at", { withTimezone: true }),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const redemptions = pgTable(
  "redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    couponId: uuid("coupon_id")
      .references(() => coupons.id)
      .notNull(),
    redeemedBy: uuid("redeemed_by")
      .references(() => users.id)
      .notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }).defaultNow().notNull(),
    note: text("note"),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    adminResponseNote: text("admin_response_note"),
  },
  (t) => [index("redemption_coupon_idx").on(t.couponId)],
);
