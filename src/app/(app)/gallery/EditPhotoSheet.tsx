"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUp, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compressPhoto } from "@/lib/gallery/compress";
import { deleteGalleryPhoto, replaceGalleryPhoto, restoreGalleryPhoto, updateGalleryPhoto } from "./actions";
import type { GalleryPhoto } from "./types";

export function EditPhotoSheet({ photo, onClose }: { photo: GalleryPhoto | null; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [takenAt, setTakenAt] = useState(photo?.takenAt ?? "");
  const [tags, setTags] = useState((photo?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);

  if (!photo) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await updateGalleryPhoto({
        id: photo!.id,
        caption: caption.trim() || undefined,
        takenAt: takenAt || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.refresh();
      toast.success("Saved");
      onClose();
    } catch {
      toast.error("Couldn't save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleReplace(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setReplacing(true);
    try {
      const compressed = await compressPhoto(file);
      const formData = new FormData();
      formData.append("file", compressed, file.name);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      await replaceGalleryPhoto({ id: photo!.id, blobUrl: data.blobUrl, blobPathname: data.blobPathname });
      router.refresh();
      toast.success("Photo replaced");
      onClose();
    } catch {
      toast.error("Couldn't replace photo");
    } finally {
      setReplacing(false);
    }
  }

  async function handleDelete() {
    const id = photo!.id;
    onClose();
    await deleteGalleryPhoto(id);
    router.refresh();
    toast("Photo deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          await restoreGalleryPhoto(id);
          router.refresh();
        },
      },
    });
  }

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit photo</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" className="text-base" value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="takenAt">Date taken</Label>
            <Input id="takenAt" type="date" className="text-base" value={takenAt ?? ""} onChange={(e) => setTakenAt(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" className="text-base" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="trip, beach, 2024" />
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleReplace(e.target.files)}
          />
          <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()} disabled={replacing}>
            <ImageUp className="size-4" aria-hidden="true" />
            {replacing ? "Replacing..." : "Replace photo"}
          </Button>
        </div>
        <DrawerFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
          <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
