import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMyMoodHistory } from "../actions";
import { MoodHeatmap } from "@/components/MoodHeatmap";

const MOOD_EMOJIS = ["😢", "😕", "😐", "🙂", "😄"];

export default async function MoodHistoryPage() {
  const history = await getMyMoodHistory();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <Link href="/mood" className="flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Link>
      <h1 className="font-heading text-2xl">Your history</h1>

      <MoodHeatmap data={history} />

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No check-ins yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {[...history]
            .reverse()
            .slice(0, 20)
            .map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                <span className="text-xl">{MOOD_EMOJIS[entry.moodLevel - 1]}</span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{entry.checkinDate}</span>
                  {entry.note && <span className="text-sm">{entry.note}</span>}
                </div>
              </li>
            ))}
        </ul>
      )}
    </main>
  );
}
