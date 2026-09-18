import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const letters = pgTable("letters", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  bodyMarkdown: text("body_markdown").notNull(),
  imageBlobUrl: text("image_blob_url"),
  unlockAt: timestamp("unlock_at", { withTimezone: true }),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
