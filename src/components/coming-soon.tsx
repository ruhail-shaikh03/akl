export function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="font-heading text-2xl">{title}</h1>
      <p className="text-sm text-muted-foreground">Coming in {phase}.</p>
    </main>
  );
}
