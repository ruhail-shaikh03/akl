import Link from "next/link";
import { Plus, Pencil, Lock } from "lucide-react";
import { getAdminLetters } from "./actions";
import { DeleteLetterButton } from "./DeleteLetterButton";

export default async function AdminLettersPage() {
  const letters = await getAdminLetters();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Letters</h1>
        <Link
          href="/admin/letters/new"
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
          New
        </Link>
      </div>

      {letters.length === 0 && <p className="text-sm text-muted-foreground">No letters yet.</p>}

      <ul className="flex flex-col gap-2">
        {letters.map((letter) => {
          const locked = letter.unlockAt ? new Date(letter.unlockAt) > new Date() : false;
          return (
            <li key={letter.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{letter.title}</span>
                <span className="text-xs text-muted-foreground">
                  {locked && (
                    <span className="mr-1 inline-flex items-center gap-0.5">
                      <Lock className="size-3" aria-hidden="true" /> locked ·
                    </span>
                  )}
                  {letter.openedAt ? "opened" : "not opened yet"}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/letters/${letter.id}/edit`}
                  aria-label="Edit"
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Link>
                <DeleteLetterButton id={letter.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
