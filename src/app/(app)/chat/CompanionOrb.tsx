export function CompanionOrb({ size = 32, pulsing = false }: { size?: number; pulsing?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${pulsing ? "animate-pulse" : ""}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 32% 28%, var(--accent), var(--primary) 70%)",
        boxShadow: `0 0 ${Math.round(size * 0.5)}px color-mix(in oklch, var(--primary) 45%, transparent)`,
      }}
    />
  );
}
