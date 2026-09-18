"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ImageUp, Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { compressPhoto } from "@/lib/gallery/compress";
import { uploadGalleryPhoto } from "./actions";

type FileStatus = "compressing" | "uploading" | "done" | "error";

type QueueItem = {
  id: string;
  name: string;
  status: FileStatus;
  error?: string;
};

export function UploadSheet() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, 10);
    setBusy(true);
    setQueue(files.map((f) => ({ id: crypto.randomUUID(), name: f.name, status: "compressing" as const })));

    let successCount = 0;
    await Promise.all(
      files.map(async (file, index) => {
        try {
          const compressed = await compressPhoto(file);
          setQueue((q) => q.map((item, i) => (i === index ? { ...item, status: "uploading" } : item)));

          const formData = new FormData();
          formData.append("file", compressed, file.name);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Upload failed");

          await uploadGalleryPhoto({ blobUrl: data.blobUrl, blobPathname: data.blobPathname });
          successCount += 1;
          setQueue((q) => q.map((item, i) => (i === index ? { ...item, status: "done" } : item)));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          setQueue((q) => q.map((item, i) => (i === index ? { ...item, status: "error", error: message } : item)));
        }
      }),
    );

    setBusy(false);
    if (successCount > 0) {
      router.refresh();
      toast.success(`Added ${successCount} photo${successCount === 1 ? "" : "s"}`);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        className="fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
        aria-label="Add photos"
      >
        <Plus className="size-6" aria-hidden="true" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add photos</DrawerTitle>
          <DrawerDescription>Pick photos from your camera roll. They&apos;ll be compressed before uploading.</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={busy} className="gap-2">
            <ImageUp className="size-4" aria-hidden="true" />
            Choose photos
          </Button>

          {queue.length > 0 && (
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {queue.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-xs">
                  <span className="truncate">{item.name}</span>
                  {item.status === "done" && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
                  {item.status === "error" && <XIcon className="size-4 shrink-0 text-destructive" aria-hidden="true" />}
                  {(item.status === "compressing" || item.status === "uploading") && (
                    <span className="shrink-0 text-muted-foreground">{item.status}...</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {!busy && (
          <div className="p-4 pt-0">
            <DrawerClose render={<Button variant="outline" className="w-full" />}>Close</DrawerClose>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
