"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { removeSong, updateSongNote } from "./actions";
import type { PlaylistSong } from "./types";

export function SongNoteRow({ song }: { song: PlaylistSong }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(song.note ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateSongNote({ id: song.id, note: note.trim() || undefined });
      router.refresh();
      setEditing(false);
    } catch {
      toast.error("Couldn't save that note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    await removeSong(song.id);
    router.refresh();
    toast.success("Removed");
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{song.titleCache || song.spotifyTrackId}</span>
          {song.artistCache && <span className="text-xs text-muted-foreground">{song.artistCache}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => setEditing((e) => !e)} aria-label="Edit note" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={handleDelete}
            aria-label={confirmingDelete ? "Confirm delete" : "Delete"}
            className={`flex size-8 items-center justify-center rounded-full ${confirmingDelete ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <Textarea className="text-base" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <Button size="sm" onClick={handleSave} disabled={saving} className="w-fit">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : (
        song.note && <p className="text-sm text-muted-foreground">{song.note}</p>
      )}
    </li>
  );
}
