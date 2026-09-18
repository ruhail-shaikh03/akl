"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { notificationSettings } from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { checkTestNotificationLimit } from "@/lib/ratelimit/limiters";
import { notify } from "@/lib/notify/notify";
import { getQuietHoursSetting, setQuietHoursSetting } from "@/lib/notify/quietHours";
import { quietHoursSchema, updateEventSettingSchema } from "@/lib/validations/notifications.schema";

export async function updateEventSetting(input: unknown) {
  await requireRole(["admin"]);
  const { eventType, enabled, quietHoursExempt } = updateEventSettingSchema.parse(input);

  await db
    .insert(notificationSettings)
    .values({
      eventType,
      enabled: enabled ?? true,
      quietHoursExempt: quietHoursExempt ?? false,
    })
    .onConflictDoUpdate({
      target: notificationSettings.eventType,
      set: {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(quietHoursExempt !== undefined ? { quietHoursExempt } : {}),
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/notifications");
}

export async function updateQuietHours(input: unknown) {
  await requireRole(["admin"]);
  const parsed = quietHoursSchema.parse(input);
  await setQuietHoursSetting({ ...parsed, tz: "Asia/Karachi" });
  revalidatePath("/admin/notifications");
}

export async function getQuietHours() {
  await requireRole(["admin"]);
  return getQuietHoursSetting();
}

export async function sendTestNotification(): Promise<{
  delivered: boolean;
  skipped?: "disabled" | "quiet_hours";
  error?: string;
}> {
  const session = await requireRole(["admin"]);

  const { success } = await checkTestNotificationLimit(session.sub);
  if (!success) {
    return { delivered: false, error: "Too many test notifications. Try again later." };
  }

  const result = await notify({ type: "notification.test", priority: "normal", data: {} });
  revalidatePath("/admin/notifications");
  return result;
}
