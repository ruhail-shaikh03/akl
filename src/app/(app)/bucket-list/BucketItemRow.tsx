"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Check, Pencil, Trash2, Camera } from "lucide-react";
import { compressPhoto } from "@/lib/gallery/compress";
import { attachCompletionPhoto, deleteBucketItem, toggleCompleteBucketItem } from "./actions";
import { ItemFormSheet } from "./ItemFormSheet";
import type { BucketItem } from "./types";

export function BucketItemRow({ item }: { item: BucketItem }) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [completed, setCompleted] = useState(Boolean(item.completedAt));
  const [photoUrl, setPhotoUrl] = useState(item.completionPhotoBlobUrl);
  const [toggling, setToggling] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleToggle() {
    if (toggling) return;
    setToggling(true);
    const willComplete = !completed;
    setCompleted(willComplete);
    try {
      await toggleCompleteBucketItem({ id: item.id });
      if (willComplete) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        toast("Nice! Want to add a photo of this moment?", {
          action: { label: "Add photo", onClick: () => photoInputRef.current?.click() },
        });
      }
      router.refresh();
    } catch {
      setCompleted(!willComplete);
      toast.error("Couldn't update that");
    } finally {
      setToggling(false);
    }
  }

  async function handlePhotoPick(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const compressed = await compressPhoto(file);
      const formData = new FormData();
      formData.append("file", compressed, file.name);
      formData.append("folder", "bucket-list");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      await attachCompletionPhoto(item.id, data.blobUrl);
      setPhotoUrl(data.blobUrl);
      router.refresh();
      toast.success("Photo added");
    } catch {
      toast.error("Couldn't upload that photo");
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    await deleteBucketItem(item.id);
    router.refresh();
    toast.success("Removed");
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={toggling}
          aria-label={completed ? "Mark as not done" : "Mark as done"}
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
            completed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
          }`}
        >
          {completed && <Check className="size-4" aria-hidden="true" />}
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className={`text-sm font-medium ${completed ? "text-muted-foreground line-through" : ""}`}>
            {item.title}
          </span>
          {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {item.category && <span className="rounded-full bg-muted px-2 py-0.5">{item.category}</span>}
            {item.targetDate && <span>by {item.targetDate}</span>}
          </div>
          {completed && (
            <span className="mt-1 text-[11px] text-muted-foreground">
              Completed by {item.completedByName}
              {item.completedAt ? ` on ${new Date(item.completedAt).toLocaleDateString()}` : ""}
            </span>
          )}
          <span className="mt-0.5 text-[11px] text-muted-foreground">Added by {item.addedByName}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => setEditOpen(true)} aria-label="Edit" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
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

      {photoUrl && (
        <div className="relative ml-9 aspect-video w-[calc(100%-2.25rem)] overflow-hidden rounded-lg">
          <Image src={photoUrl} alt="" fill sizes="300px" className="object-cover" />
        </div>
      )}

      {completed && !photoUrl && (
        <button
          onClick={() => photoInputRef.current?.click()}
          className="ml-9 flex w-fit items-center gap-1 text-xs text-primary"
        >
          <Camera className="size-3.5" aria-hidden="true" />
          Add a photo
        </button>
      )}

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoPick(e.target.files)}
      />

      <ItemFormSheet item={item} open={editOpen} onOpenChange={setEditOpen} />
    </li>
  );
}
