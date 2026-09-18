import { date, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const personalContext = pgTable("personal_context", {
  id: integer("id").primaryKey().default(1),
  partnerName: text("partner_name").notNull(),
  nicknames: jsonb("nicknames").$type<string[]>().notNull().default([]),
  insideJokes: jsonb("inside_jokes").$type<string[]>().notNull().default([]),
  cheerUpList: jsonb("cheer_up_list").$type<string[]>().notNull().default([]),
  favorites: jsonb("favorites").$type<Record<string, string[]>>().notNull().default({}),
  avoidTopics: jsonb("avoid_topics").$type<string[]>().notNull().default([]),
  tone: text("tone").notNull().default("warm, playful"),
  language: text("language").notNull().default("English + casual Urdu mix"),
  relationshipStartDate: date("relationship_start_date").notNull(),
  partnerBirthday: date("partner_birthday").notNull(),
  adminName: text("admin_name").notNull().default("Ruhail"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
