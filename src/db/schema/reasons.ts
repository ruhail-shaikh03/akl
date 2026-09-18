import { boolean, pgTable, primaryKey, text, timestamp, unique, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const reasons = pgTable("reasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const reasonCycles = pgTable(
  "reason_cycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    cycleNumber: integer("cycle_number").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.cycleNumber)],
);

export const reasonViews = pgTable(
  "reason_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cycleId: uuid("cycle_id")
      .references(() => reasonCycles.id)
      .notNull(),
    reasonId: uuid("reason_id")
      .references(() => reasons.id)
      .notNull(),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.cycleId, t.reasonId)],
);

export const reasonFavorites = pgTable(
  "reason_favorites",
  {
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    reasonId: uuid("reason_id")
      .references(() => reasons.id)
      .notNull(),
    favoritedAt: timestamp("favorited_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.reasonId] })],
);
