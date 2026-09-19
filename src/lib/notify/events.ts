export type NotifyEvent =
  | { type: "letter.opened"; priority: "normal"; data: { letterTitle: string } }
  | { type: "coupon.redeemed"; priority: "normal"; data: { couponTitle: string; note?: string } }
  | { type: "mood.checkin"; priority: "normal" | "high"; data: { moodLevel: number; note?: string } }
  | { type: "bucketlist.completed"; priority: "normal"; data: { itemTitle: string; completedBy: string } }
  | { type: "chat.distress_detected"; priority: "high"; data: { snippet: string; detectedBy: string } }
  | { type: "chat.spend_guard_triggered"; priority: "normal"; data: Record<string, never> }
  | { type: "notification.test"; priority: "normal"; data: Record<string, never> };

export type NotifyEventType = NotifyEvent["type"];

/** The admin-configurable event types (excludes "notification.test", which always fires). */
export const CONFIGURABLE_EVENT_TYPES = [
  "letter.opened",
  "coupon.redeemed",
  "mood.checkin",
  "bucketlist.completed",
  "chat.distress_detected",
] as const satisfies readonly NotifyEventType[];

export const EVENT_TYPE_LABELS: Record<(typeof CONFIGURABLE_EVENT_TYPES)[number], string> = {
  "letter.opened": "Letter opened",
  "coupon.redeemed": "Coupon redeemed",
  "mood.checkin": "Mood check-in",
  "bucketlist.completed": "Bucket list item completed",
  "chat.distress_detected": "Possible distress in chat",
};

const MOOD_EMOJIS = ["😢", "😕", "😐", "🙂", "😄"];

export function formatEvent(event: NotifyEvent): { title: string; body: string } {
  switch (event.type) {
    case "letter.opened":
      return { title: "Letter opened 💌", body: `She opened "${event.data.letterTitle}".` };
    case "coupon.redeemed":
      return {
        title: "Coupon redeemed 🎟️",
        body: `She redeemed "${event.data.couponTitle}".${event.data.note ? `\nNote: ${event.data.note}` : ""}`,
      };
    case "mood.checkin": {
      const emoji = MOOD_EMOJIS[event.data.moodLevel - 1] ?? "";
      return {
        title: `Mood check-in ${emoji}`,
        body: `She logged mood ${event.data.moodLevel}/5.${event.data.note ? `\nNote: ${event.data.note}` : ""}`,
      };
    }
    case "bucketlist.completed":
      return {
        title: "Bucket list item completed ✅",
        body: `"${event.data.itemTitle}" was completed by ${event.data.completedBy}.`,
      };
    case "chat.distress_detected":
      return {
        title: "⚠️ Possible distress in chat",
        body: `Detected by ${event.data.detectedBy}.\n"${event.data.snippet}"`,
      };
    case "chat.spend_guard_triggered":
      return {
        title: "⚠️ Chat spend guard triggered",
        body: "Today's DeepSeek token budget was hit — the bot is giving canned fallback replies until tomorrow (Asia/Karachi).",
      };
    case "notification.test":
      return { title: "Test notification 🔔", body: "If you're seeing this, notifications are working." };
  }
}
