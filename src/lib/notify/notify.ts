import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notificationSettings, notificationsLog } from "@/db/schema";
import { sendTelegram } from "./channels/telegram";
import { sendResendEmail } from "./channels/resend";
import { isWithinQuietHours } from "./quietHours";
import { formatEvent, type NotifyEvent } from "./events";

export type NotifyResult = { delivered: boolean; skipped?: "disabled" | "quiet_hours" };

/**
 * Central notification entry point. Tries Telegram first, falls back to Resend email on
 * failure. High-priority events and event types marked quiet-hours-exempt bypass quiet hours;
 * everything else is silently suppressed during the configured window (and logged as such).
 */
export async function notify(event: NotifyEvent): Promise<NotifyResult> {
  const [settingsRow] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.eventType, event.type))
    .limit(1);

  const enabled = settingsRow?.enabled ?? true;
  if (!enabled) {
    return { delivered: false, skipped: "disabled" };
  }

  const bypassQuietHours = event.priority === "high" || (settingsRow?.quietHoursExempt ?? false);
  if (!bypassQuietHours && (await isWithinQuietHours())) {
    await logAttempt(event, "none", "skipped");
    return { delivered: false, skipped: "quiet_hours" };
  }

  const { title, body } = formatEvent(event);

  const telegramResult = await sendTelegram(title, body);
  await logAttempt(event, "telegram", telegramResult.success ? "sent" : "failed", telegramResult.error);
  if (telegramResult.success) {
    return { delivered: true };
  }

  const resendResult = await sendResendEmail(title, body);
  await logAttempt(event, "resend", resendResult.success ? "sent" : "failed", resendResult.error);
  return { delivered: resendResult.success };
}

async function logAttempt(
  event: NotifyEvent,
  channel: "telegram" | "resend" | "none",
  status: "sent" | "failed" | "skipped",
  errorMessage?: string,
) {
  await db.insert(notificationsLog).values({
    eventType: event.type,
    priority: event.priority,
    channel,
    payload: event.data,
    status,
    errorMessage,
  });
}
