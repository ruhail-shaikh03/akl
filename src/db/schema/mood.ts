import { date, pgTable, smallint, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const moodCheckins = pgTable(
  "mood_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    moodLevel: smallint("mood_level").notNull(),
    note: text("note"),
    checkinDate: date("checkin_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.checkinDate)],
);
