"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { letters } from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/slug";
import { createLetterSchema, updateLetterSchema } from "@/lib/validations/letters.schema";

async function uniqueSlugFor(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "letter";
  let slug = base;
  let suffix = 2;
  while (true) {
    const [existing] = await db.select({ id: letters.id }).from(letters).where(eq(letters.slug, slug)).limit(1);
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function getAdminLetters() {
  await requireRole(["admin"]);
  return db.select().from(letters).where(isNull(letters.deletedAt)).orderBy(desc(letters.createdAt));
}

export async function getAdminLetter(id: string) {
  await requireRole(["admin"]);
  const [letter] = await db
    .select()
    .from(letters)
    .where(and(eq(letters.id, id), isNull(letters.deletedAt)))
    .limit(1);
  return letter ?? null;
}

export async function createLetter(input: unknown) {
  const session = await requireRole(["admin"]);
  const data = createLetterSchema.parse(input);
  const slug = await uniqueSlugFor(data.title);

  await db.insert(letters).values({
    title: data.title,
    slug,
    bodyMarkdown: data.bodyMarkdown,
    imageBlobUrl: data.imageBlobUrl,
    unlockAt: data.unlockAt ? new Date(data.unlockAt) : undefined,
    createdBy: session.sub,
  });

  revalidatePath("/admin/letters");
  revalidatePath("/letters");
}

export async function updateLetter(input: unknown) {
  await requireRole(["admin"]);
  const { id, ...patch } = updateLetterSchema.parse(input);

  await db
    .update(letters)
    .set({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.bodyMarkdown !== undefined ? { bodyMarkdown: patch.bodyMarkdown } : {}),
      ...(patch.imageBlobUrl !== undefined ? { imageBlobUrl: patch.imageBlobUrl } : {}),
      ...(patch.unlockAt !== undefined ? { unlockAt: patch.unlockAt ? new Date(patch.unlockAt) : null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(letters.id, id));

  revalidatePath("/admin/letters");
  revalidatePath("/letters");
  revalidatePath(`/letters/${id}`);
}

export async function deleteLetter(id: string) {
  await requireRole(["admin"]);
  await db.update(letters).set({ deletedAt: new Date() }).where(eq(letters.id, id));
  revalidatePath("/admin/letters");
  revalidatePath("/letters");
}
