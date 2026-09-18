"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryPhoto } from "./types";

const SWIPE_THRESHOLD = 60;

export function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: GalleryPhoto[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const photo = photos[index];

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, photos.length - 1)), [photos.length]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, goNext, goPrev]);

  function handlePanEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goNext();
    else if (info.offset.x > SWIPE_THRESHOLD) goPrev();
  }

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 pt-safe pb-safe" role="dialog" aria-modal="true">
      <div className="flex items-center justify-end p-3">
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex size-11 items-center justify-center rounded-full text-white/80 hover:text-white"
        >
          <X className="size-6" aria-hidden="true" />
        </button>
      </div>

      <motion.div className="relative flex flex-1 items-center justify-center overflow-hidden" onPanEnd={handlePanEnd}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={photo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative h-full w-full"
          >
            <Image src={photo.blobUrl} alt={photo.caption ?? ""} fill sizes="100vw" className="object-contain" priority />
          </motion.div>
        </AnimatePresence>

        {index > 0 && (
          <button
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white sm:flex"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white sm:flex"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        )}
      </motion.div>

      {(photo.caption || photo.takenAt) && (
        <div className="p-4 text-center text-white">
          {photo.caption && <p className="text-sm">{photo.caption}</p>}
          {photo.takenAt && <p className="mt-1 text-xs text-white/60">{photo.takenAt}</p>}
        </div>
      )}
    </div>
  );
}
