import type { galleryPhotos } from "@/db/schema";

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
