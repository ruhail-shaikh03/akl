import { formatInTimeZone } from "date-fns-tz";

export const APP_TIMEZONE = "Asia/Karachi";

/** Current time as "HH:mm" in Asia/Karachi. */
export function nowKarachiTime(date: Date = new Date()): string {
  return formatInTimeZone(date, APP_TIMEZONE, "HH:mm");
}

/** Current calendar date as "yyyy-MM-dd" in Asia/Karachi. Used as the day-boundary for daily features (mood check-ins, etc). */
export function todayKarachiDate(date: Date = new Date()): string {
  return formatInTimeZone(date, APP_TIMEZONE, "yyyy-MM-dd");
}

/** True if `time` ("HH:mm") falls within the [start, end) window, handling overnight windows like 22:00-08:00. */
export function isWithinWindow(time: string, start: string, end: string): boolean {
  if (start === end) return false; // zero-length window
  const t = toMinutes(time);
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s < e) {
    return t >= s && t < e;
  }
  // overnight window, e.g. 22:00 -> 08:00
  return t >= s || t < e;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Whole days between a "yyyy-MM-dd" date and today, in Asia/Karachi. */
export function daysSince(dateStr: string): number {
  const today = todayKarachiDate();
  const msPerDay = 24 * 60 * 60 * 1000;
  const [fy, fm, fd] = dateStr.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / msPerDay);
}

/** Days until the next occurrence of a "yyyy-MM-dd" birthday/anniversary (month+day only), in Asia/Karachi. */
export function daysUntilNextAnniversary(dateStr: string): number {
  const [, month, day] = dateStr.split("-").map(Number);
  const today = todayKarachiDate();
  const [ty, tm, td] = today.split("-").map(Number);
  const msPerDay = 24 * 60 * 60 * 1000;
  const todayUTC = Date.UTC(ty, tm - 1, td);

  let next = Date.UTC(ty, month - 1, day);
  if (next < todayUTC) {
    next = Date.UTC(ty + 1, month - 1, day);
  }
  return Math.round((next - todayUTC) / msPerDay);
}
