"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addPlaylistSong } from "./actions";

export function AddSongSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [trackUrl, setTrackUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await addPlaylistSong({
        spotifyTrackId: trackUrl,
        titleCache: title.trim() || undefined,
        artistCache: artist.trim() || undefined,
        note: note.trim() || undefined,
      });
      router.refresh();
      setOpen(false);
      setTrackUrl("");
      setTitle("");
      setArtist("");
      setNote("");
      toast.success("Added");
    } catch {
      toast.error("Couldn't save that note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" aria-hidden="true" />
        Add a song note
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add a song note</DrawerTitle>
          <DrawerDescription>Paste the Spotify track link and say why it&apos;s ours.</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="track-url">Spotify track link</Label>
            <Input
              id="track-url"
              className="text-base"
              value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              required
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="song-title">Title (optional)</Label>
              <Input id="song-title" className="text-base" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="song-artist">Artist (optional)</Label>
              <Input id="song-artist" className="text-base" value={artist} onChange={(e) => setArtist(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="song-note">Why this song</Label>
            <Textarea id="song-note" className="text-base" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DrawerFooter className="px-0">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add"}
            </Button>
            <DrawerClose render={<Button type="button" variant="ghost" />}>Cancel</DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
