import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export type QuietHoursSetting = {
  enabled: boolean;
  start: string; // "HH:mm", Asia/Karachi local time
  end: string; // "HH:mm", Asia/Karachi local time
  tz: "Asia/Karachi";
};
