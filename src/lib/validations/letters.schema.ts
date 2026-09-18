import { z } from "zod";

export const createLetterSchema = z.object({
  title: z.string().trim().min(1).max(120),
  bodyMarkdown: z.string().trim().min(1).max(10000),
  imageBlobUrl: z.string().url().optional(),
  unlockAt: z.string().datetime().optional(),
});
export type CreateLetterInput = z.infer<typeof createLetterSchema>;

export const updateLetterSchema = createLetterSchema.partial().extend({
  id: z.string().uuid(),
});
export type UpdateLetterInput = z.infer<typeof updateLetterSchema>;
