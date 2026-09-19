import "server-only";

// Deliberately biased toward false positives over false negatives — see plan §7.
// English + Roman Urdu terms for hopelessness/self-harm/suicidal ideation.
const DISTRESS_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bend it all\b/i,
  /\bwant to die\b/i,
  /\bdon'?t want to (live|be alive)\b/i,
  /\bself[\s-]?harm/i,
  /\bhurt(ing)? myself\b/i,
  /\bno reason to live\b/i,
  /\bcan'?t (go on|do this anymore)\b/i,
  /\bbetter off (without me|dead)\b/i,
  /\bkhudkushi/i, // suicide (Roman Urdu)
  /\bmarna chahti hoon\b/i, // "I want to die"
  /\bjeena nahi chahti\b/i, // "don't want to live"
  /\bzindagi khatam\b/i, // "life over/end"
];

export function detectDistressKeywords(text: string): boolean {
  return DISTRESS_PATTERNS.some((pattern) => pattern.test(text));
}
