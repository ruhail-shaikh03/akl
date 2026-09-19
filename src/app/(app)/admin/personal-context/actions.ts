"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { personalContext } from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { updatePersonalContextSchema } from "@/lib/validations/personalContext.schema";

export async function getPersonalContext() {
  await requireRole(["admin"]);
  const [row] = await db.select().from(personalContext).where(eq(personalContext.id, 1)).limit(1);
  return row ?? null;
}

export async function updatePersonalContext(input: unknown) {
  await requireRole(["admin"]);
  const data = updatePersonalContextSchema.parse(input);

  await db
    .update(personalContext)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(personalContext.id, 1));

  revalidatePath("/admin/personal-context");
}
