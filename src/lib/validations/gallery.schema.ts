import { z } from "zod";

export const galleryPhotoMetaSchema = z.object({
  caption: z.string().trim().max(500).optional(),
  takenAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
});

export const uploadGalleryPhotoSchema = galleryPhotoMetaSchema.extend({
  blobUrl: z.string().url(),
  blobPathname: z.string().min(1),
});
export type UploadGalleryPhotoInput = z.infer<typeof uploadGalleryPhotoSchema>;

export const updateGalleryPhotoSchema = galleryPhotoMetaSchema.extend({
  id: z.string().uuid(),
});
export type UpdateGalleryPhotoInput = z.infer<typeof updateGalleryPhotoSchema>;

export const replaceGalleryPhotoSchema = z.object({
  id: z.string().uuid(),
  blobUrl: z.string().url(),
  blobPathname: z.string().min(1),
});
export type ReplaceGalleryPhotoInput = z.infer<typeof replaceGalleryPhotoSchema>;

export const reorderGalleryPhotosSchema = z.array(z.string().uuid()).min(1).max(500);
