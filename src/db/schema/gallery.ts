import {
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const galleryPhotos = pgTable(
  "gallery_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blobUrl: text("blob_url").notNull(),
    blobPathname: text("blob_pathname").notNull(),
    caption: text("caption"),
    takenAt: date("taken_at"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    sortOrder: integer("sort_order").notNull().default(0),
    uploadedBy: uuid("uploaded_by")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("gallery_sort_idx").on(t.sortOrder), index("gallery_deleted_idx").on(t.deletedAt)],
);
