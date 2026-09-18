import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["normal", "high"]);
export const notifStatusEnum = pgEnum("notif_status", ["sent", "failed", "skipped"]);

export const notificationsLog = pgTable(
  "notifications_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    priority: priorityEnum("priority").notNull().default("normal"),
    channel: text("channel").notNull(),
    payload: jsonb("payload").notNull(),
    status: notifStatusEnum("status").notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("notif_event_idx").on(t.eventType)],
);

export const notificationSettings = pgTable("notification_settings", {
  eventType: text("event_type").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  quietHoursExempt: boolean("quiet_hours_exempt").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
