"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { compressPhoto } from "@/lib/gallery/compress";
import { createLetter, updateLetter } from "./actions";
import type { Letter } from "@/app/(app)/letters/types";

function toDatetimeLocal(iso: string | Date | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LetterForm({ initialLetter }: { initialLetter?: Letter }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initialLetter);

  const [title, setTitle] = useState(initialLetter?.title ?? "");
  const [body, setBody] = useState(initialLetter?.bodyMarkdown ?? "");
  const [imageBlobUrl, setImageBlobUrl] = useState(initialLetter?.imageBlobUrl ?? "");
  const [locked, setLocked] = useState(Boolean(initialLetter?.unlockAt));
  const [unlockAt, setUnlockAt] = useState(toDatetimeLocal(initialLetter?.unlockAt ?? null));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleImagePick(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressPhoto(file);
      const formData = new FormData();
      formData.append("file", compressed, file.name);
      formData.append("folder", "letters");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImageBlobUrl(data.blobUrl);
    } catch {
      toast.error("Couldn't upload that image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        bodyMarkdown: body,
        imageBlobUrl: imageBlobUrl || undefined,
        unlockAt: locked && unlockAt ? new Date(unlockAt).toISOString() : undefined,
      };
      if (isEdit) {
        await updateLetter({ id: initialLetter!.id, ...payload });
      } else {
        await createLetter(payload);
      }
      router.push("/admin/letters");
      router.refresh();
      toast.success(isEdit ? "Letter updated" : "Letter created");
    } catch {
      toast.error("Couldn't save this letter");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          className="text-base"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Open when you miss me"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Message (markdown supported)</Label>
        <Textarea id="body" className="text-base" rows={8} value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Image (optional)</Label>
        {imageBlobUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image src={imageBlobUrl} alt="" fill sizes="400px" className="object-cover" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImagePick(e.target.files)}
        />
        <Button type="button" variant="outline" className="gap-2" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <ImageUp className="size-4" aria-hidden="true" />
          {uploading ? "Uploading..." : imageBlobUrl ? "Replace image" : "Add image"}
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor="lock-toggle">Lock until a date</Label>
        <Switch id="lock-toggle" checked={locked} onCheckedChange={setLocked} />
      </div>
      {locked && (
        <Input
          type="datetime-local"
          className="text-base"
          value={unlockAt}
          onChange={(e) => setUnlockAt(e.target.value)}
          required={locked}
        />
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create letter"}
      </Button>
    </form>
  );
}
