"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { compressPhoto } from "@/lib/gallery/compress";
import { createReason, updateReason } from "./actions";
import type { Reason } from "./types";

export function ReasonForm({ initialReason }: { initialReason?: Reason }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initialReason);

  const [text, setText] = useState(initialReason?.text ?? "");
  const [imageUrl, setImageUrl] = useState(initialReason?.imageUrl ?? "");
  const [isActive, setIsActive] = useState(initialReason?.isActive ?? true);
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
      formData.append("folder", "reasons");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImageUrl(data.blobUrl);
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
      if (isEdit) {
        await updateReason({ id: initialReason!.id, text, imageUrl: imageUrl || null, isActive });
      } else {
        await createReason({ text, imageUrl: imageUrl || undefined });
      }
      router.push("/admin/reasons");
      router.refresh();
      toast.success(isEdit ? "Reason updated" : "Reason added");
    } catch {
      toast.error("Couldn't save this reason");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="text">Reason</Label>
        <Textarea
          id="text"
          className="text-base"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="The way you laugh at your own jokes"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Image (optional)</Label>
        {imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image src={imageUrl} alt="" fill sizes="400px" className="object-cover" />
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
          {uploading ? "Uploading..." : imageUrl ? "Replace image" : "Add image"}
        </Button>
      </div>

      {isEdit && (
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label htmlFor="active-toggle">Active (shown in the jar)</Label>
          <Switch id="active-toggle" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : isEdit ? "Save changes" : "Add reason"}
      </Button>
    </form>
  );
}
