"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ImageIcon, ListOrdered, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadSheet } from "./UploadSheet";
import { EditPhotoSheet } from "./EditPhotoSheet";
import { reorderGalleryPhotos } from "./actions";
import type { GalleryPhoto } from "./types";

// Both pull in framer-motion — deferred so it's not in the initial gallery bundle.
const Lightbox = dynamic(() => import("./Lightbox").then((m) => m.Lightbox), { ssr: false });
const ReorderView = dynamic(() => import("./ReorderView"), { ssr: false });

export function GalleryClient({ initialPhotos }: { initialPhotos: GalleryPhoto[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [reordering, setReordering] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      await reorderGalleryPhotos(photos.map((p) => p.id));
      router.refresh();
      toast.success("Order saved");
      setReordering(false);
    } catch {
      toast.error("Couldn't save the new order");
    } finally {
      setSavingOrder(false);
    }
  }

  if (photos.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <ImageIcon className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="font-heading text-xl">No photos yet</h1>
        <p className="text-sm text-muted-foreground">Add the first one.</p>
        <UploadSheet />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-safe pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Gallery</h1>
        {reordering ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setReordering(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveOrder} disabled={savingOrder}>
              {savingOrder ? "Saving..." : "Done"}
            </Button>
          </div>
        ) : (
          <Button size="icon-sm" variant="ghost" aria-label="Reorder photos" onClick={() => setReordering(true)}>
            <ListOrdered className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {reordering ? (
        <ReorderView photos={photos} onReorder={setPhotos} />
      ) : (
        <div className="columns-2 gap-2 sm:columns-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative mb-2 break-inside-avoid">
              <button
                onClick={() => setLightboxIndex(index)}
                className="block w-full overflow-hidden rounded-xl bg-muted"
                aria-label={photo.caption || "View photo"}
              >
                <Image
                  src={photo.blobUrl}
                  alt={photo.caption ?? ""}
                  width={400}
                  height={400}
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="h-auto w-full object-cover"
                />
              </button>
              <button
                onClick={() => setEditingPhoto(photo)}
                aria-label="Edit photo"
                className="absolute top-1.5 right-1.5 flex size-9 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <UploadSheet />

      {lightboxIndex !== null && (
        <Lightbox photos={photos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      <EditPhotoSheet photo={editingPhoto} onClose={() => setEditingPhoto(null)} />
    </main>
  );
}
