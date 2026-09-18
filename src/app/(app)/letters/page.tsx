import { Mail } from "lucide-react";
import { getLetters } from "./actions";
import { EnvelopeCard } from "./EnvelopeCard";

export default async function LettersPage() {
  const letters = await getLetters();

  return (
    <main className="mx-auto max-w-md px-4 pt-safe pt-6">
      <h1 className="mb-4 font-heading text-2xl">Open When...</h1>

      {letters.length === 0 ? (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3 text-center">
          <Mail className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No letters yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {letters.map((letter) => (
            <EnvelopeCard key={letter.id} letter={letter} />
          ))}
        </div>
      )}
    </main>
  );
}
