import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings, type QuietHoursSetting } from "@/db/schema/appSettings";
import { isWithinWindow, nowKarachiTime } from "@/lib/time";

const DEFAULT_QUIET_HOURS: QuietHoursSetting = {
  enabled: true,
  start: "22:00",
  end: "08:00",
  tz: "Asia/Karachi",
};

export async function getQuietHoursSetting(): Promise<QuietHoursSetting> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, "quiet_hours")).limit(1);
  if (!row) return DEFAULT_QUIET_HOURS;
  return row.value as QuietHoursSetting;
}

export async function setQuietHoursSetting(value: QuietHoursSetting): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key: "quiet_hours", value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value } });
}

export async function isWithinQuietHours(): Promise<boolean> {
  const setting = await getQuietHoursSetting();
  if (!setting.enabled) return false;
  return isWithinWindow(nowKarachiTime(), setting.start, setting.end);
}
