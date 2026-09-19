"use client";

import Image from "next/image";
import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
import type { GalleryPhoto } from "./types";

export default function ReorderView({
  photos,
  onReorder,
}: {
  photos: GalleryPhoto[];
  onReorder: (photos: GalleryPhoto[]) => void;
}) {
  return (
    <Reorder.Group axis="y" values={photos} onReorder={onReorder} className="flex flex-col gap-2">
      {photos.map((photo) => (
        <Reorder.Item
          key={photo.id}
          value={photo}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-2"
        >
          <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
            <Image src={photo.blobUrl} alt={photo.caption ?? ""} fill sizes="56px" className="object-cover" />
          </div>
          <span className="truncate text-sm text-muted-foreground">{photo.caption || "Untitled"}</span>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
