"use client";

import { useState } from "react";
import Link from "next/link";
import { MoodPicker } from "./MoodPicker";
import { LowMoodOffers } from "./LowMoodOffers";

const MOOD_EMOJIS = ["😢", "😕", "😐", "🙂", "😄"];

export function MoodPageClient({
  initialLevel,
  waLink,
  isEvening,
}: {
  initialLevel: number | null;
  waLink: string | null;
  isEvening: boolean;
}) {
  const [level, setLevel] = useState(initialLevel);

  if (level !== null) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center">
          <span className="text-4xl" role="img" aria-hidden="true">
            {MOOD_EMOJIS[level - 1]}
          </span>
          <p className="text-sm text-muted-foreground">You&apos;re checked in for today 💛</p>
        </div>
        {level <= 2 && <LowMoodOffers waLink={waLink} />}
        <Link href="/mood/history" className="text-center text-sm text-muted-foreground underline">
          View your history
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {isEvening ? "It's evening — how are you feeling today?" : "How are you feeling today?"}
      </p>
      <MoodPicker onSubmitted={setLevel} />
    </div>
  );
}
