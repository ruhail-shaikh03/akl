import { z } from "zod";

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm");

export const quietHoursSchema = z.object({
  enabled: z.boolean(),
  start: hhmm,
  end: hhmm,
});
export type QuietHoursInput = z.infer<typeof quietHoursSchema>;

export const eventTypeEnum = z.enum([
  "letter.opened",
  "coupon.redeemed",
  "mood.checkin",
  "bucketlist.completed",
  "chat.distress_detected",
]);

export const updateEventSettingSchema = z.object({
  eventType: eventTypeEnum,
  enabled: z.boolean().optional(),
  quietHoursExempt: z.boolean().optional(),
});
export type UpdateEventSettingInput = z.infer<typeof updateEventSettingSchema>;
