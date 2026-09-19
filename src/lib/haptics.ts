/** No-op on iOS/desktop (no Vibration API support) — safe to call unconditionally. */
export function vibrate(pattern: number | number[] = 15) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore — some browsers throw if called outside a user gesture
    }
  }
}
