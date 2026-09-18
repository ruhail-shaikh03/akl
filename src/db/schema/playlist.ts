import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const playlistSongs = pgTable("playlist_songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  spotifyTrackId: text("spotify_track_id").notNull().unique(),
  titleCache: text("title_cache"),
  artistCache: text("artist_cache"),
  sortOrder: integer("sort_order").notNull().default(0),
  note: text("note"),
  addedBy: uuid("added_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
