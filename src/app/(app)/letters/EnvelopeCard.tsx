import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Lock, Mail, MailOpen } from "lucide-react";
import type { Letter } from "./types";

export function EnvelopeCard({ letter }: { letter: Letter }) {
  const locked = letter.unlockAt ? new Date(letter.unlockAt) > new Date() : false;

  if (locked) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center opacity-70">
        <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{letter.title}</span>
        <span className="text-xs text-muted-foreground">
          Unlocks in {formatDistanceToNowStrict(new Date(letter.unlockAt!))}
        </span>
      </div>
    );
  }

  const opened = Boolean(letter.openedAt);

  return (
    <Link
      href={`/letters/${letter.id}`}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:bg-accent/10"
    >
      {opened ? (
        <MailOpen className="size-8 text-muted-foreground" aria-hidden="true" />
      ) : (
        <Mail className="size-8 text-primary" aria-hidden="true" />
      )}
      <span className="text-sm font-medium">{letter.title}</span>
      {!opened && <span className="text-xs text-muted-foreground">Tap to open</span>}
    </Link>
  );
}
