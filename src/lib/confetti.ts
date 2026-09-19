import type confettiFn from "canvas-confetti";

/** Lazily loads canvas-confetti so it's not in the initial bundle of every page that celebrates something. */
export async function celebrate(options?: Parameters<typeof confettiFn>[0]) {
  if (typeof window === "undefined") return;
  const { default: confetti } = await import("canvas-confetti");
  confetti(options ?? { particleCount: 80, spread: 70, origin: { y: 0.7 } });
}
