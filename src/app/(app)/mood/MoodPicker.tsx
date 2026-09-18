"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitMoodCheckin } from "./actions";

const MOODS = [
  { level: 1, emoji: "😢", label: "Awful" },
  { level: 2, emoji: "😕", label: "Rough" },
  { level: 3, emoji: "😐", label: "Okay" },
  { level: 4, emoji: "🙂", label: "Good" },
  { level: 5, emoji: "😄", label: "Great" },
] as const;

export function MoodPicker({ onSubmitted }: { onSubmitted: (level: number) => void }) {
  const router = useRouter();
  const [level, setLevel] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (level === null) return;
    setSaving(true);
    try {
      await submitMoodCheckin({ level, note: note.trim() || undefined });
      router.refresh();
      onSubmitted(level);
    } catch {
      toast.error("Couldn't save your check-in");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between gap-1">
        {MOODS.map(({ level: l, emoji, label }) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            aria-label={label}
            aria-pressed={level === l}
            className={cn(
              "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border text-3xl transition-colors",
              level === l ? "border-primary bg-primary/10" : "border-border bg-card",
            )}
          >
            <span role="img" aria-hidden="true">
              {emoji}
            </span>
          </button>
        ))}
      </div>

      <Textarea
        className="text-base"
        rows={3}
        placeholder="Want to add anything? (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Button size="lg" onClick={handleSubmit} disabled={level === null || saving}>
        {saving ? "Saving..." : "Check in"}
      </Button>
    </div>
  );
}
