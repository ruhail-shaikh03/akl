"use server";

import { revalidatePath } from "next/cache";
import { asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { checkMutationLimit } from "@/lib/ratelimit/limiters";
import { deleteBlobByPathname } from "@/lib/blob/upload";
import {
  reorderGalleryPhotosSchema,
  replaceGalleryPhotoSchema,
  updateGalleryPhotoSchema,
  uploadGalleryPhotoSchema,
} from "@/lib/validations/gallery.schema";

class RateLimitedError extends Error {
  constructor() {
    super("Too many requests. Try again in a bit.");
  }
}

async function assertMutationAllowed(userId: string) {
  const { success } = await checkMutationLimit(userId);
  if (!success) throw new RateLimitedError();
}

export async function getGalleryPhotos() {
  await requireSession();
  return db
    .select()
    .from(galleryPhotos)
    .where(isNull(galleryPhotos.deletedAt))
    .orderBy(asc(galleryPhotos.sortOrder), desc(galleryPhotos.createdAt));
}

export async function uploadGalleryPhoto(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const data = uploadGalleryPhotoSchema.parse(input);

  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${galleryPhotos.sortOrder}), -1)` })
    .from(galleryPhotos);

  await db.insert(galleryPhotos).values({
    blobUrl: data.blobUrl,
    blobPathname: data.blobPathname,
    caption: data.caption,
    takenAt: data.takenAt,
    tags: data.tags ?? [],
    sortOrder: maxOrder + 1,
    uploadedBy: session.sub,
  });

  revalidatePath("/gallery");
}

export async function updateGalleryPhoto(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const { id, ...patch } = updateGalleryPhotoSchema.parse(input);

  await db
    .update(galleryPhotos)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(galleryPhotos.id, id));

  revalidatePath("/gallery");
}

export async function replaceGalleryPhoto(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const { id, blobUrl, blobPathname } = replaceGalleryPhotoSchema.parse(input);

  const [existing] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id)).limit(1);
  if (!existing) throw new Error("Photo not found");

  await db
    .update(galleryPhotos)
    .set({ blobUrl, blobPathname, updatedAt: new Date() })
    .where(eq(galleryPhotos.id, id));

  await deleteBlobByPathname(existing.blobPathname);
  revalidatePath("/gallery");
}

export async function deleteGalleryPhoto(id: string) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);

  await db.update(galleryPhotos).set({ deletedAt: new Date() }).where(eq(galleryPhotos.id, id));
  revalidatePath("/gallery");
}

export async function restoreGalleryPhoto(id: string) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);

  await db.update(galleryPhotos).set({ deletedAt: null }).where(eq(galleryPhotos.id, id));
  revalidatePath("/gallery");
}

export async function reorderGalleryPhotos(orderedIds: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const ids = reorderGalleryPhotosSchema.parse(orderedIds);

  await Promise.all(
    ids.map((id, index) => db.update(galleryPhotos).set({ sortOrder: index }).where(eq(galleryPhotos.id, id))),
  );

  revalidatePath("/gallery");
}
